import "server-only";
import { headers } from "next/headers";
import { LoginThrottleModel } from "@/models/LoginThrottle";

// 防止猜密碼：同一個 Email 15 分鐘內錯 5 次、同一個網路位址錯 30 次，就暫停登入

const WINDOW_MS = 15 * 60 * 1000;
const LIMITS = { email: 5, ip: 30 };

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || null;
}

async function keysFor(email: string) {
  const ip = await clientIp();
  // 本機開發沒有網路位址資訊時，只用 Email 計算
  return [
    { key: `email:${email}`, limit: LIMITS.email },
    ...(ip ? [{ key: `ip:${ip}`, limit: LIMITS.ip }] : []),
  ];
}

/** 被暫停時回傳還要等幾分鐘，沒有被暫停回傳 0 */
export async function lockedMinutes(email: string) {
  const now = Date.now();
  let wait = 0;
  for (const { key, limit } of await keysFor(email)) {
    const doc = await LoginThrottleModel.findOne({ key }).lean();
    if (doc && doc.count >= limit && doc.resetAt.getTime() > now) {
      wait = Math.max(wait, Math.ceil((doc.resetAt.getTime() - now) / 60000));
    }
  }
  return wait;
}

export async function recordFailure(email: string) {
  const now = new Date();
  for (const { key } of await keysFor(email)) {
    const counted = await LoginThrottleModel.findOneAndUpdate(
      { key, resetAt: { $gt: now } },
      { $inc: { count: 1 } },
    );
    if (!counted) {
      await LoginThrottleModel.updateOne(
        { key },
        { $set: { count: 1, resetAt: new Date(now.getTime() + WINDOW_MS) } },
        { upsert: true },
      );
    }
  }
}

/** 登入成功後清除這個 Email 的失敗次數 */
export async function clearFailures(email: string) {
  await LoginThrottleModel.deleteOne({ key: `email:${email}` });
}
