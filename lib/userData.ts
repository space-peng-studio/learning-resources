import "server-only";
import { taipeiDate } from "./date";
import { connectDB } from "./db";
import { EMPTY_PRACTICE, type PracticeState } from "./practice";
import type { QuizRecord } from "./quizHistory";
import { PracticeStateModel } from "@/models/PracticeState";
import { QuizRecordModel } from "@/models/QuizRecord";

// 讀取某位學員的資料。呼叫端必須先用 requireUser() 取得「自己」的 id，不可接受外部傳入的 id。

/** 依時間排序（舊到新）的測驗紀錄 */
export async function getQuizHistory(userId: string): Promise<QuizRecord[]> {
  await connectDB();
  const docs = await QuizRecordModel.find({ userId }).sort({ startedAt: 1 }).lean();
  return docs.map((d) => ({
    takenAt: d.takenAt.toISOString(),
    startDay: taipeiDate(d.startedAt),
    scores: {
      emotion: d.scores!.emotion,
      belief: d.scores!.belief,
      action: d.scores!.action,
      asset: d.scores!.asset,
    },
    stage: d.stage as QuizRecord["stage"],
  }));
}

export async function getPracticeState(userId: string): Promise<PracticeState> {
  await connectDB();
  const doc = await PracticeStateModel.findOne({ userId }).lean();
  if (!doc) return EMPTY_PRACTICE;
  return { selected: [...doc.selected], log: { ...(doc.log ?? {}) } };
}

export async function savePracticeState(userId: string, state: PracticeState) {
  await connectDB();
  await PracticeStateModel.updateOne(
    { userId },
    { $set: { selected: state.selected, log: state.log } },
    { upsert: true },
  );
}
