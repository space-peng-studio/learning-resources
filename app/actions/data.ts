"use server";

import { getCurrentUser } from "@/lib/auth";
import { DATE_KEY_RE, daysBetween, taipeiDate } from "@/lib/date";
import { evaluate, questions, type Scores } from "@/lib/moneyMap";
import { applyPracticeOp, isValidOp, type PracticeOp, type PracticeState } from "@/lib/practice";
import { isInWindow, type QuizRecord } from "@/lib/quizHistory";
import { getPracticeState, getQuizHistory, savePracticeState } from "@/lib/userData";
import { QuizRecordModel } from "@/models/QuizRecord";

// 每個動作都重新確認登入者，只能讀寫自己的資料

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

const NOT_LOGGED_IN = { ok: false as const, error: "登入已過期，請重新登入。" };
const SAVE_FAILED = { ok: false as const, error: "沒有儲存成功，請再試一次。" };

function isScores(value: unknown): value is Scores {
  if (!value || typeof value !== "object") return false;
  return questions.every((q) => {
    const v = (value as Record<string, unknown>)[q.key];
    return Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 6;
  });
}

/** 儲存一次測驗：最近一筆的 30 天內重測就更新它，否則新增一筆。回傳最新的完整紀錄 */
export async function saveQuizResult(scores: Scores): Promise<Result<QuizRecord[]>> {
  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;
  if (!isScores(scores)) return { ok: false, error: "資料格式不正確" };

  const clean: Scores = {
    emotion: scores.emotion,
    belief: scores.belief,
    action: scores.action,
    asset: scores.asset,
  };
  try {
    const now = new Date();
    const fields = { takenAt: now, scores: clean, stage: evaluate(clean).stage.key };
    // 以台灣時間的日期計算 30 天
    const latest = await QuizRecordModel.findOne({ userId: user.id }).sort({ startedAt: -1 });
    if (latest && isInWindow(taipeiDate(latest.startedAt), taipeiDate(now))) {
      await QuizRecordModel.updateOne({ _id: latest._id }, { $set: fields });
    } else {
      await QuizRecordModel.create({ userId: user.id, startedAt: now, ...fields });
    }
    return { ok: true, data: await getQuizHistory(user.id) };
  } catch (err) {
    console.error(err);
    return SAVE_FAILED;
  }
}

// 「今天」由學員的瀏覽器決定（各地時區不同），但只接受和伺服器的日期相差一天以內，
// 避免把日期改到很久以前來補打卡
function isPlausibleToday(today: string) {
  if (!DATE_KEY_RE.test(today)) return false;
  return Math.abs(daysBetween(new Date().toISOString().slice(0, 10), today)) <= 1;
}

/** 套用一個練習操作（打勾、加入、移除⋯），用伺服器上的最新資料計算後存回 */
export async function updatePractice(op: PracticeOp, today: string): Promise<Result<PracticeState>> {
  const user = await getCurrentUser();
  if (!user) return NOT_LOGGED_IN;
  if (!isValidOp(op) || !isPlausibleToday(today)) return { ok: false, error: "資料格式不正確" };

  try {
    const next = applyPracticeOp(await getPracticeState(user.id), op, today);
    await savePracticeState(user.id, next);
    return { ok: true, data: next };
  } catch (err) {
    console.error(err);
    return SAVE_FAILED;
  }
}
