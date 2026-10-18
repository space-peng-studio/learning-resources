import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    // 管理員給了臨時密碼後為 true，學員登入後必須先設定新密碼
    mustChangePassword: { type: Boolean, default: false },
    // 重設密碼時 +1，讓所有裝置上舊的登入憑證失效
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export type User = InferSchemaType<typeof userSchema>;

// 熱更新時 model 可能已經註冊過，先沿用既有的
export const UserModel: Model<User> = models.User || model("User", userSchema);
