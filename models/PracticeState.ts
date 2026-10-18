import { Schema, model, models, type Model } from "mongoose";

// 每位學員一筆：目前挑選的練習，以及每天完成了哪些
const practiceStateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    selected: { type: [String], default: [] },
    // { "2026-10-17": ["seed-r1", ...] }
    log: { type: Schema.Types.Mixed, default: {} },
  },
  { minimize: false, timestamps: true },
);

export type PracticeStateDoc = {
  userId: unknown;
  selected: string[];
  log: Record<string, string[]>;
};

export const PracticeStateModel: Model<PracticeStateDoc> =
  models.PracticeState || model("PracticeState", practiceStateSchema);
