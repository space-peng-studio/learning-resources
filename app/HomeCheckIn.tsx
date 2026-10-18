"use client";

import Link from "next/link";
import { dateKey } from "@/lib/date";
import { useToday } from "@/lib/useToday";
import { stageByKey, type StageKey } from "@/lib/moneyMap";
import { practiceDays, type PracticeState } from "@/lib/practice";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

/** 首頁上方的今日打卡狀態 */
export default function HomeCheckIn({ state, quizStage }: { state: PracticeState; quizStage?: StageKey }) {
  const today = useToday();

  // 日期只在瀏覽器端決定，伺服器端先保留高度
  if (!today) return <div className="h-40 sm:h-28" />;

  const [y, m, d] = today.split("-").map(Number);
  const todayDate = new Date(y, m - 1, d);
  const checkedIn = (state.log[today]?.length ?? 0) > 0;
  const total = practiceDays(state).length;
  const stage = quizStage && stageByKey(quizStage);
  const week = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(todayDate);
    day.setDate(day.getDate() - (6 - i));
    return { key: dateKey(day), label: WEEKDAYS[day.getDay()] };
  });

  return (
    <section
      aria-label="今日打卡"
      className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/65 p-6 shadow-[0_24px_60px_-40px_rgb(80_60_100/0.55)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8"
    >
      <div>
        <p className="text-xs tracking-[0.3em] text-muted">
          {m} 月 {d} 日・星期{WEEKDAYS[todayDate.getDay()]}
          {stage && (
            <span className="ml-2 font-serif font-bold" style={{ color: stage.color }}>
              ・{stage.name}
            </span>
          )}
        </p>
        <p className={`mt-2 font-serif text-2xl font-bold tracking-widest ${checkedIn ? "text-gold" : "text-ink"}`}>
          {checkedIn ? "✦ 今日打卡成功" : "今天還沒打卡"}
        </p>
        <p className="mt-1 text-sm tracking-wider text-muted">
          累積修行 <b className="font-serif text-lg text-gold">{total}</b> 天
        </p>
      </div>

      <ol aria-label="最近七天" className="flex gap-2">
        {week.map((w) => {
          const done = (state.log[w.key]?.length ?? 0) > 0;
          return (
            <li key={w.key} className="flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted">{w.label}</span>
              <span
                className={`flex size-7 items-center justify-center rounded-full text-[11px] ${
                  done
                    ? "bg-gradient-to-br from-rose to-lavender text-white"
                    : w.key === today
                      ? "border border-dashed border-gold/60"
                      : "bg-ink/5"
                }`}
              >
                {done && "✓"}
              </span>
            </li>
          );
        })}
      </ol>

      <Link
        href={stage ? "/practice" : "/quiz"}
        className={`shrink-0 rounded-full px-6 py-3 text-center text-sm tracking-[0.2em] transition hover:-translate-y-0.5 ${
          checkedIn ? "border border-ink/20 bg-white/60 text-ink" : "bg-ink text-white shadow-lg shadow-ink/20"
        }`}
      >
        {stage ? (checkedIn ? "看看我的練習" : "去完成今天的練習 →") : "先測出我的階段 →"}
      </Link>
    </section>
  );
}
