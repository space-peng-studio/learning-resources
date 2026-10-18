import { NextResponse, type NextRequest } from "next/server";
import {
  RENEW_AFTER_SECONDS,
  SESSION_COOKIE,
  sessionCookieOptions,
  signSession,
  verifySession,
} from "@/lib/jwt";

// 只看憑證是否有效的快速檢查；使用者是否存在、是否被撤銷由 lib/auth.ts 查資料庫確認

// 需要登入才能用的頁面；其他頁面路人也能看（測驗與練習路人可以試用，只是不會記錄）
const MEMBER_PATHS = ["/account"];
// 已登入的人不需要再看的頁面
const GUEST_ONLY_PATHS = ["/login", "/signup"];
const SET_PASSWORD_PATH = "/set-password";

const matches = (pathname: string, paths: string[]) =>
  paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  const redirectTo = (path: string) => NextResponse.redirect(new URL(path, request.url));

  if (!session) {
    if (matches(pathname, MEMBER_PATHS)) {
      // 登入後帶回原本想去的頁面
      return redirectTo(`/login?next=${encodeURIComponent(pathname)}`);
    }
    return pathname === SET_PASSWORD_PATH ? redirectTo("/login") : NextResponse.next();
  }

  if (matches(pathname, GUEST_ONLY_PATHS)) return redirectTo("/");

  // 拿臨時密碼登入的人，要先設定新密碼才能使用網站
  if (session.mcp && pathname !== SET_PASSWORD_PATH) return redirectTo(SET_PASSWORD_PATH);
  if (!session.mcp && pathname === SET_PASSWORD_PATH) return redirectTo("/");

  const response = NextResponse.next();
  // 每次造訪自動延長：讓「一年內有回來過」的學員永遠不用重新登入
  const age = Math.floor(Date.now() / 1000) - (session.iat ?? 0);
  if (age > RENEW_AFTER_SECONDS) {
    const token = await signSession({ sub: session.sub, v: session.v, mcp: session.mcp });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  }
  return response;
}

export const config = {
  // 略過靜態檔、圖片、影片、PDF 與登出
  matcher: ["/((?!_next/static|_next/image|logout|favicon.ico|.*\\.[a-zA-Z0-9]+$).*)"],
};
