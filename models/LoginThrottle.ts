import { Schema, model, models, type Model } from "mongoose";

// 登入失敗次數：key 例如 "email:xxx@example.com"、"ip:1.2.3.4"
const loginThrottleSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, required: true },
  // 到這個時間就重新計算；MongoDB 也會在這之後自動刪除這筆
  resetAt: { type: Date, required: true, index: { expires: 0 } },
});

export type LoginThrottleDoc = { key: string; count: number; resetAt: Date };

export const LoginThrottleModel: Model<LoginThrottleDoc> =
  models.LoginThrottle || model("LoginThrottle", loginThrottleSchema);
