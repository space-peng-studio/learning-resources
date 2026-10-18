// 每日練習：從各階段項目挑 1–5 項，每天勾選。
// 每日類每天重置；每月／每季／每年類在該期間內完成一次；一次性任務完成後移到「已完成」。
// 這裡都是純函式：瀏覽器用來即時更新畫面，伺服器用同一套規則寫進資料庫。

import { shiftDay } from "./date";
import { stages, type Frequency, type Practice, type Stage, type StageKey } from "./moneyMap";

export const MAX_SELECTED = 5;

export type PracticeState = {
  selected: string[];
  log: Record<string, string[]>; // 日期（YYYY-MM-DD）→ 當天完成的項目
};

export const EMPTY_PRACTICE: PracticeState = { selected: [], log: {} };

export type PracticeOp =
  | { type: "toggle"; id: string }
  | { type: "toggleYesterday"; id: string } // 補打卡：只限清單裡的每日類練習
  | { type: "undo"; id: string }
  | { type: "add"; id: string }
  | { type: "remove"; id: string }
  | { type: "recommend"; stage: StageKey };

export const practiceById = new Map<string, { practice: Practice; stage: Stage }>(
  stages.flatMap((stage) =>
    [...stage.required, ...stage.suggested].map((practice) => [practice.id, { practice, stage }] as const),
  ),
);

// 同一期間內完成一次就算完成；「定期」以月為單位
function periodOf(freq: Frequency, day: string) {
  switch (freq) {
    case "daily":
      return day;
    case "monthly":
    case "regular":
      return day.slice(0, 7);
    case "quarterly":
      return `${day.slice(0, 4)}-Q${Math.ceil(Number(day.slice(5, 7)) / 3)}`;
    case "yearly":
      return day.slice(0, 4);
    case "once":
      return "once";
  }
}

function datesDone(state: PracticeState, id: string) {
  return Object.keys(state.log).filter((d) => state.log[d].includes(id));
}

export function isDone(state: PracticeState, id: string, today: string) {
  const freq = practiceById.get(id)!.practice.frequency;
  const period = periodOf(freq, today);
  return datesDone(state, id).some((d) => periodOf(freq, d) === period);
}

/** 已完成的一次性任務與完成日期（新到舊） */
export function completedTasks(state: PracticeState) {
  return [...practiceById.values()]
    .filter(({ practice }) => practice.frequency === "once")
    .map(({ practice }) => ({ practice, date: datesDone(state, practice.id).sort()[0] }))
    .filter((t) => t.date)
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** 有完成任何一項練習的日子（舊到新） */
export function practiceDays(state: PracticeState) {
  return Object.keys(state.log)
    .filter((d) => state.log[d].length > 0)
    .sort();
}

function withoutInPeriod(state: PracticeState, id: string, today: string) {
  const freq = practiceById.get(id)!.practice.frequency;
  const period = periodOf(freq, today);
  const log: PracticeState["log"] = {};
  for (const [d, ids] of Object.entries(state.log)) {
    const kept = periodOf(freq, d) === period ? ids.filter((x) => x !== id) : ids;
    if (kept.length) log[d] = kept;
  }
  return log;
}

/** 套用一個操作，回傳新的狀態（不修改原本的） */
function toggleOn(state: PracticeState, id: string, day: string): PracticeState {
  if (isDone(state, id, day)) return { ...state, log: withoutInPeriod(state, id, day) };
  const log = { ...state.log, [day]: [...(state.log[day] ?? []), id] };
  const once = practiceById.get(id)!.practice.frequency === "once";
  return { selected: once ? state.selected.filter((x) => x !== id) : state.selected, log };
}

export function applyPracticeOp(state: PracticeState, op: PracticeOp, today: string): PracticeState {
  switch (op.type) {
    case "toggle":
      return toggleOn(state, op.id, today);
    case "toggleYesterday": {
      const daily = practiceById.get(op.id)!.practice.frequency === "daily";
      if (!daily || !state.selected.includes(op.id)) return state;
      return toggleOn(state, op.id, shiftDay(today, -1));
    }
    case "undo": {
      // 把已完成的一次性任務放回清單（清單已滿時只取消完成）
      const room = state.selected.length < MAX_SELECTED && !state.selected.includes(op.id);
      return {
        selected: room ? [...state.selected, op.id] : state.selected,
        log: withoutInPeriod(state, op.id, today),
      };
    }
    case "add":
      if (state.selected.includes(op.id) || state.selected.length >= MAX_SELECTED) return state;
      return { ...state, selected: [...state.selected, op.id] };
    case "remove":
      return { ...state, selected: state.selected.filter((x) => x !== op.id) };
    case "recommend": {
      // 依老師推薦（該階段必做項目）補滿清單
      const stage = stages.find((s) => s.key === op.stage);
      if (!stage) return state;
      const done = new Set(completedTasks(state).map((t) => t.practice.id));
      const picks = stage.required
        .map((p) => p.id)
        .filter((id) => !done.has(id) && !state.selected.includes(id))
        .slice(0, MAX_SELECTED - state.selected.length);
      return { ...state, selected: [...state.selected, ...picks] };
    }
  }
}

/** 伺服器端檢查從瀏覽器送來的操作是否合法 */
export function isValidOp(op: unknown): op is PracticeOp {
  if (!op || typeof op !== "object") return false;
  const o = op as Record<string, unknown>;
  if (o.type === "recommend") return stages.some((s) => s.key === o.stage);
  return (
    ["toggle", "toggleYesterday", "undo", "add", "remove"].includes(o.type as string) &&
    practiceById.has(o.id as string)
  );
}
