import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { connectDB } from "./db";
import { SESSION_COOKIE, sessionCookieOptions, signSession, verifySession } from "./jwt";
import { UserModel } from "@/models/User";

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
};

// 管理員由 .env.local 的 ADMIN_EMAILS 決定。網站不驗證 Email 是否屬於本人，
// 所以新增管理員時，務必「先讓對方用該 Email 註冊，再把 Email 加進 ADMIN_EMAILS」，
// 否則別人可能搶先用那個 Email 註冊而取得管理權限。
export function isAdminEmail(email: string) {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export async function createSession(user: {
  _id: { toString(): string };
  tokenVersion: number;
  mustChangePassword: boolean;
}) {
  const token = await signSession({
    sub: user._id.toString(),
    v: user.tokenVersion,
    mcp: user.mustChangePassword,
  });
  (await cookies()).set(SESSION_COOKIE, token, sessionCookieOptions);
}

/**
 * 給未登入者的登入連結。憑證已失效（例如密碼被重設）時改走登出流程清掉舊憑證，
 * 否則 proxy 會把他當成已登入，一直被帶離登入頁。
 */
export async function guestLink(path: "/login" | "/signup") {
  return (await cookies()).has(SESSION_COOKIE) ? "/logout" : path;
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

/** 讀取目前登入的使用者；未登入、憑證無效或已被撤銷時回傳 null（同一個請求內只查一次） */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;

  await connectDB();
  const user = await UserModel.findById(session.sub).lean();
  if (!user || user.tokenVersion !== session.v) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isAdmin: isAdminEmail(user.email),
  };
});

/** 頁面用：沒登入就帶去登出流程（清掉失效的憑證）再到登入頁 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/logout");
  return user;
}
