"use server";

import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { isValidObjectId } from "mongoose";
import { redirect } from "next/navigation";
import { createSession, deleteSession, getCurrentUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { clearFailures, lockedMinutes, recordFailure } from "@/lib/loginThrottle";
import { SESSION_COOKIE, verifySession } from "@/lib/jwt";
import { MAX_NAME, MIN_PASSWORD } from "@/lib/authRules";
import { UserModel } from "@/models/User";

export type FormState = {
  error?: string;
  ok?: string;
  values?: Record<string, string>;
} | null;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const field = (formData: FormData, key: string) => String(formData.get(key) ?? "").trim();

function checkName(name: string) {
  if (!name) return "請告訴我們怎麼稱呼你";
  if (name.length > MAX_NAME) return `名字請在 ${MAX_NAME} 個字以內`;
  return null;
}

function checkPassword(password: string) {
  return password.length < MIN_PASSWORD ? `密碼至少要 ${MIN_PASSWORD} 個字元` : null;
}

const hash = (password: string) => bcrypt.hash(password, 10);

// 登入後要回去的頁面；只接受站內路徑，避免被導到別的網站。
// 瀏覽器會把「/\\」當成「//」，所以反斜線也要擋；最後再用網址解析確認仍在本站。
function nextPath(formData: FormData) {
  const next = field(formData, "next");
  if (!/^\/(?![\/\\])/.test(next) || /[\\\s]/.test(next)) return "/";
  try {
    const url = new URL(next, "http://site.local");
    return url.origin === "http://site.local" ? `${url.pathname}${url.search}` : "/";
  } catch {
    return "/";
  }
}

const SERVER_ERROR = "伺服器暫時連不上，請稍後再試一次。";

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = field(formData, "name");
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { name, email };

  const error =
    checkName(name) ??
    (EMAIL_RE.test(email) ? null : "Email 格式好像不太對") ??
    checkPassword(password);
  if (error) return { error, values };

  let user;
  try {
    await connectDB();
    if (await UserModel.exists({ email })) {
      return { error: "這個 Email 已經註冊過了，請直接登入。", values };
    }
    user = await UserModel.create({ name, email, passwordHash: await hash(password) });
  } catch (err) {
    if ((err as { code?: number }).code === 11000) {
      return { error: "這個 Email 已經註冊過了，請直接登入。", values };
    }
    console.error(err);
    return { error: SERVER_ERROR, values };
  }

  await createSession(user);
  redirect(nextPath(formData));
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = field(formData, "email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const values = { email };

  let user;
  try {
    await connectDB();
    const wait = await lockedMinutes(email);
    if (wait) return { error: `嘗試次數太多，請 ${wait} 分鐘後再試。`, values };

    user = await UserModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      await recordFailure(email);
      return { error: "Email 或密碼不正確。", values };
    }
    await clearFailures(email);
  } catch (err) {
    console.error(err);
    return { error: SERVER_ERROR, values };
  }

  await createSession(user);
  redirect(user.mustChangePassword ? "/set-password" : nextPath(formData));
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function updateName(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/logout");

  const name = field(formData, "name");
  const error = checkName(name);
  if (error) return { error, values: { name } };

  try {
    await UserModel.updateOne({ _id: user.id }, { name });
  } catch (err) {
    console.error(err);
    return { error: SERVER_ERROR, values: { name } };
  }
  // 讓頁首與首頁的名字跟著更新
  refresh();
  return { ok: "名字已更新", values: { name } };
}

/** 帳號設定：輸入目前密碼後改新密碼；其他裝置上的登入會失效 */
export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const current = await getCurrentUser();
  if (!current) redirect("/logout");

  const oldPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const error = checkPassword(newPassword);
  if (error) return { error };

  try {
    const user = await UserModel.findById(current.id);
    if (!user || !(await bcrypt.compare(oldPassword, user.passwordHash))) {
      return { error: "目前的密碼不正確。" };
    }
    user.passwordHash = await hash(newPassword);
    user.tokenVersion += 1;
    await user.save();
    await createSession(user);
  } catch (err) {
    console.error(err);
    return { error: SERVER_ERROR };
  }
  return { ok: "密碼已更新，其他裝置需要重新登入。" };
}

/** 用臨時密碼登入後，設定自己的新密碼 */
export async function setNewPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  const current = await getCurrentUser();
  if (!session?.mcp || !current) redirect("/logout");

  const newPassword = String(formData.get("newPassword") ?? "");
  const error = checkPassword(newPassword);
  if (error) return { error };

  try {
    const user = await UserModel.findById(current.id);
    if (!user) return { error: SERVER_ERROR };
    user.passwordHash = await hash(newPassword);
    user.mustChangePassword = false;
    user.tokenVersion += 1;
    await user.save();
    await createSession(user);
  } catch (err) {
    console.error(err);
    return { error: SERVER_ERROR };
  }
  redirect("/");
}

const TEMP_WORDS = ["star", "moon", "lotus", "light", "bloom", "river", "dawn", "gold"];

/** 管理員：產生臨時密碼。學員所有裝置會被登出，下次登入必須先改密碼 */
export async function resetPassword(userId: string): Promise<{ tempPassword?: string; error?: string }> {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return { error: "沒有權限" };

  if (typeof userId !== "string" || !isValidObjectId(userId)) return { error: "找不到這位學員" };

  // 一個英文字＋6 位數字，好用 LINE 傳、也不容易被猜中
  const tempPassword = `${TEMP_WORDS[randomInt(TEMP_WORDS.length)]}-${randomInt(100000, 1000000)}`;
  try {
    const result = await UserModel.updateOne(
      { _id: userId },
      { passwordHash: await hash(tempPassword), mustChangePassword: true, $inc: { tokenVersion: 1 } },
    );
    if (result.matchedCount === 0) return { error: "找不到這位學員" };
  } catch (err) {
    console.error(err);
    return { error: SERVER_ERROR };
  }
  return { tempPassword };
}
