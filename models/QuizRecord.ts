import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const score = { type: Number, required: true, min: 1, max: 6 };

const quizRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  // 這一筆的起始時間：30 天內重測會更新同一筆（規則見 lib/quizHistory.ts）
  startedAt: { type: Date, required: true },
  // 最近一次作答的時間
  takenAt: { type: Date, required: true },
  scores: { emotion: score, belief: score, action: score, asset: score },
  stage: { type: String, required: true, enum: ["seed", "growth", "abundance", "master"] },
});
quizRecordSchema.index({ userId: 1, startedAt: 1 });

export type QuizRecordDoc = InferSchemaType<typeof quizRecordSchema>;

export const QuizRecordModel: Model<QuizRecordDoc> =
  models.QuizRecord || model("QuizRecord", quizRecordSchema);
