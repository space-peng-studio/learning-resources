import "server-only";
import { isValidObjectId } from "mongoose";
import { taipeiDate } from "./date";
import { connectDB } from "./db";
import type { StageKey } from "./moneyMap";
import { practiceDays, type PracticeState } from "./practice";
import type { QuizRecord } from "./quizHistory";
import { getPracticeState, getQuizHistory } from "./userData";
import { PracticeStateModel } from "@/models/PracticeState";
import { QuizRecordModel } from "@/models/QuizRecord";
import { UserModel } from "@/models/User";

// 管理後台用的唯讀資料。呼叫端必須先確認是管理員。

export type StudentSummary = {
  id: string;
  name: string;
  email: string;
  joinedAt: string; // YYYY-MM-DD
  mustChangePassword: boolean;
  stage?: StageKey;
  lastQuizAt?: string; // YYYY-MM-DD
  practiceDays: number;
  lastCheckIn?: string; // YYYY-MM-DD
  selectedCount: number;
};

function summarize(
  user: { _id: { toString(): string }; name: string; email: string; createdAt: Date; mustChangePassword: boolean },
  quiz: { stage: string; takenAt: Date } | undefined,
  practice: PracticeState,
): StudentSummary {
  const days = practiceDays(practice);
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    joinedAt: taipeiDate(user.createdAt),
    mustChangePassword: user.mustChangePassword,
    stage: quiz?.stage as StageKey | undefined,
    lastQuizAt: quiz && taipeiDate(quiz.takenAt),
    practiceDays: days.length,
    lastCheckIn: days.at(-1),
    selectedCount: practice.selected.length,
  };
}

export async function getStudentSummaries(): Promise<StudentSummary[]> {
  await connectDB();
  const [users, latestQuiz, practices] = await Promise.all([
    UserModel.find().sort({ createdAt: -1 }).select("name email createdAt mustChangePassword").lean(),
    QuizRecordModel.aggregate<{ _id: unknown; stage: string; takenAt: Date }>([
      { $sort: { takenAt: -1 } },
      { $group: { _id: "$userId", stage: { $first: "$stage" }, takenAt: { $first: "$takenAt" } } },
    ]),
    PracticeStateModel.find().select("userId selected log").lean(),
  ]);

  const quizBy = new Map(latestQuiz.map((q) => [String(q._id), q]));
  const practiceBy = new Map(
    practices.map((p) => [String(p.userId), { selected: p.selected ?? [], log: p.log ?? {} }]),
  );
  return users.map((u) =>
    summarize(u, quizBy.get(u._id.toString()), practiceBy.get(u._id.toString()) ?? { selected: [], log: {} }),
  );
}

export async function getStudentDetail(
  id: string,
): Promise<{ summary: StudentSummary; history: QuizRecord[]; practice: PracticeState } | null> {
  if (!isValidObjectId(id)) return null;
  await connectDB();
  const user = await UserModel.findById(id).select("name email createdAt mustChangePassword").lean();
  if (!user) return null;

  const [history, practice] = await Promise.all([getQuizHistory(id), getPracticeState(id)]);
  const last = history.at(-1);
  const summary = summarize(
    user,
    last && { stage: last.stage, takenAt: new Date(last.takenAt) },
    practice,
  );
  return { summary, history, practice };
}
