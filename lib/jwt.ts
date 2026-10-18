import { SignJWT, jwtVerify } from "jose";

// 登入憑證（JWT）的簽發與驗證。proxy 與伺服器端程式共用。

export const SESSION_COOKIE = "session";

// 瀏覽器規定 cookie 最多約 400 天；設 1 年，並在每次造訪時自動延長
export const SESSION_MAX_AGE = 60 * 60 * 24 * 365;

// 超過一天才換發新憑證，避免每個請求都重新簽名
export const RENEW_AFTER_SECONDS = 60 * 60 * 24;

export type SessionPayload = {
  sub: string; // 使用者 id
  v: number; // tokenVersion
  mcp?: boolean; // 必須先改密碼
  iat?: number;
};

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("缺少環境變數 JWT_SECRET");
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: Omit<SessionPayload, "iat">) {
  return new SignJWT({ v: payload.v, ...(payload.mcp ? { mcp: true } : {}) })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.sub !== "string" || typeof payload.v !== "number") return null;
    return { sub: payload.sub, v: payload.v, mcp: payload.mcp === true, iat: payload.iat };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
