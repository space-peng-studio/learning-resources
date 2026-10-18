import { daysBetween, shiftDay } from "./date";
import type { Scores, StageKey } from "./moneyMap";

// 測驗紀錄每 30 天一筆：從這一筆第一次測驗那天起算 30 天（含當天），
// 期間內重測會更新這一筆；第 31 天起再測就新增下一筆。
export const RECORD_DAYS = 30;

export type QuizRecord = {
  takenAt: string; // 最近一次作答的時間（ISO）
  startDay: string; // 這一筆的起始日（台灣時間 YYYY-MM-DD）
  scores: Scores;
  stage: StageKey;
};

/** 今天是否還在這一筆的 30 天期間內 */
export function isInWindow(startDay: string, today: string) {
  return daysBetween(startDay, today) < RECORD_DAYS;
}

/** 期間最後一天，以及會新增下一筆的日子 */
export function recordWindow(startDay: string) {
  return { lastDay: shiftDay(startDay, RECORD_DAYS - 1), nextDay: shiftDay(startDay, RECORD_DAYS) };
}

/** YYYY-MM-DD → 10/18 */
export const shortDay = (key: string) => `${Number(key.slice(5, 7))}/${Number(key.slice(8, 10))}`;

export function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
