import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/jwt";

// 清掉登入憑證後回到登入頁（憑證失效時也會被帶來這裡）
export function GET(request: NextRequest) {
  // 從別的網站連過來的請求不登出，避免被惡意連結強制登出
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
