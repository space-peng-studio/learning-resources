"use client";

import Link from "next/link";
import { useState } from "react";
import { dateKey, shiftDay } from "@/lib/date";
import { useToday } from "@/lib/useToday";
import { frequencyLabel, stageByKey, stages, type Practice, type StageKey } from "@/lib/moneyMap";
import {
  MAX_SELECTED,
  completedTasks,
  isDone,
  practiceById,
  practiceDays,
  type PracticeState,
} from "@/lib/practice";
import { usePractice } from "@/lib/usePractice";
import GuestNotice from "@/components/GuestNotice";

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

const parseDay = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const doneLabel: Record<Practice["frequency"], string> = {
  daily: "今天完成了",
  once: "已完成",
  regular: "本月已完成",
  monthly: "本月已完成",
  quarterly: "本季已完成",
  yearly: "今年已完成",
};

function Tags({ p }: { p: Practice }) {
  return (
    <span className="inline-flex gap-1 align-middle">
      <span className="rounded-full bg-lavender/15 px-2 py-0.5 text-[11px] tracking-wider text-[#6a5a8c]">{p.tag}</span>
      <span className="rounded-full bg-gold/12 px-2 py-0.5 text-[11px] tracking-wider text-gold">
        {frequencyLabel[p.frequency]}
      </span>
    </span>
  );
}

const card = "rounded-[2rem] border border-white/70 bg-white/60 p-6 backdrop-blur sm:p-8";

/** guestLoginHref 有值代表未登入：可以試著挑選、打勾，但不會記錄 */
export default function PracticeApp({
  initialState,
  quizStage,
  guestLoginHref,
}: {
  initialState: PracticeState;
  quizStage?: StageKey;
  guestLoginHref?: string;
}) {
  const today = useToday();
  const { state, dispatch, error } = usePractice(initialState, !guestLoginHref);
  const [tab, setTab] = useState<StageKey | null>(null);

  // 日期只在瀏覽器端決定，伺服器端先顯示空白骨架
  if (!today) return <div className="mt-10 h-96" />;

  const activeStage = stageByKey(tab ?? quizStage ?? "seed");
  const days = practiceDays(state);
  const checkedIn = (state.log[today]?.length ?? 0) > 0;
  const finished = completedTasks(state);
  const finishedIds = new Set(finished.map((t) => t.practice.id));
  const full = state.selected.length >= MAX_SELECTED;
  const yesterday = shiftDay(today, -1);
  const dailySelected = state.selected.filter((id) => practiceById.get(id)!.practice.frequency === "daily");
  const todayDate = parseDay(today);
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(todayDate);
    d.setDate(d.getDate() - (6 - i));
    return { key: dateKey(d), label: WEEKDAYS[d.getDay()], date: d.getDate() };
  });

  return (
    <div className="mx-auto mt-10 max-w-3xl space-y-6">
      {guestLoginHref && (
        <GuestNotice loginHref={guestLoginHref}>可以先挑練習、打勾試試看；登入後，打卡才會被記錄並累積修行天數。</GuestNotice>
      )}
      {error && (
        <p
          role="alert"
          className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-2xl bg-ink px-5 py-3 text-center text-sm tracking-wider text-white shadow-xl"
        >
          {error}
        </p>
      )}
      {/* 今日打卡 */}
      <section className={`${card} text-center`}>
        <p className="text-sm tracking-[0.3em] text-muted">
          {todayDate.getMonth() + 1} 月 {todayDate.getDate()} 日・星期{WEEKDAYS[todayDate.getDay()]}
        </p>
        <p
          className={`mt-3 font-serif text-2xl font-bold tracking-widest sm:text-3xl ${
            checkedIn ? "text-gold" : "text-ink"
          }`}
        >
          {checkedIn ? "✦ 今日打卡成功" : "今天還沒打卡"}
        </p>
        <p className="mt-2 text-sm tracking-wider text-muted">
          {checkedIn ? "謝謝你，今天也有好好陪伴自己。" : "完成下方任何一項練習，就算打卡成功。"}
        </p>

        <ol className="mx-auto mt-6 grid max-w-md grid-cols-7 gap-2">
          {week.map((d) => {
            const done = (state.log[d.key]?.length ?? 0) > 0;
            return (
              <li key={d.key} className="flex flex-col items-center gap-1.5">
                <span className="text-[11px] tracking-wider text-muted">{d.label}</span>
                <span
                  className={`flex size-9 items-center justify-center rounded-full text-xs ${
                    done
                      ? "bg-gradient-to-br from-rose to-lavender text-white"
                      : d.key === today
                        ? "border border-dashed border-gold/60 text-ink"
                        : "bg-ink/5 text-muted"
                  }`}
                >
                  {done ? "✓" : d.date}
                </span>
              </li>
            );
          })}
        </ol>

        {/* 只呈現正向累積，不設目標，避免「做不完」的壓力 */}
        <div className="mx-auto mt-7 grid max-w-sm grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white/70 px-4 py-3">
            <p className="text-xs tracking-widest text-muted">累積修行</p>
            <p className="mt-1 text-sm text-ink">
              <b className="font-serif text-3xl text-gold">{days.length}</b> 天
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3">
            <p className="text-xs tracking-widest text-muted">本月修行</p>
            <p className="mt-1 text-sm text-ink">
              <b className="font-serif text-3xl text-gold">{days.filter((d) => d.startsWith(today.slice(0, 7))).length}</b> 天
            </p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed tracking-wider text-muted">
          {days.length === 0 ? "第一天，就是最好的開始。" : "每一次練習，都替豐盛多存了一點。"}
          <br />
          斷了一天沒關係，接著數就好，不用歸零重來。
        </p>
      </section>

      {/* 我的練習 */}
      <section className={card}>
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-2xl font-bold tracking-wider text-ink">我的練習</h2>
          <span className="text-sm tracking-widest text-muted">
            {state.selected.length} / {MAX_SELECTED}
          </span>
        </div>

        {state.selected.length === 0 ? (
          <p className="mt-6 rounded-2xl bg-cream/80 px-5 py-6 text-center text-sm leading-relaxed tracking-wide text-muted">
            還沒有挑選練習。從下方挑 1–5 項，
            <br />
            或直接套用老師推薦。
          </p>
        ) : (
          <ul className="mt-5 space-y-3">
            {state.selected.map((id) => {
              const { practice } = practiceById.get(id)!;
              const done = isDone(state, id, today);
              return (
                <li
                  key={id}
                  className={`flex items-start gap-3 rounded-2xl border p-4 transition ${
                    done ? "border-gold/40 bg-gold/8" : "border-ink/10 bg-white/70"
                  }`}
                >
                  <button
                    type="button"
                    role="checkbox"
                    aria-checked={done}
                    aria-label={practice.text}
                    onClick={() => dispatch({ type: "toggle", id }, today)}
                    className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      done ? "border-transparent bg-gradient-to-br from-rose to-lavender text-white" : "border-ink/25 hover:border-lavender"
                    }`}
                  >
                    {done && "✓"}
                  </button>
                  <div className="flex-1">
                    <p className={`text-[15px] leading-relaxed ${done ? "text-ink/55" : "text-ink/90"}`}>{practice.text}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Tags p={practice} />
                      {done && <span className="text-xs tracking-wider text-gold">{doneLabel[practice.frequency]}</span>}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "remove", id }, today)}
                    aria-label={`從清單移除：${practice.text}`}
                    className="shrink-0 px-1 text-lg leading-none text-muted/60 transition hover:text-ink"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* 補打卡：昨天做了卻忘了勾，只限清單裡的每日類練習 */}
        {dailySelected.length > 0 && (
          <details className="group mt-5 rounded-2xl border border-dashed border-ink/15 px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm tracking-wider text-muted">
              昨天忘了打勾嗎？
              <span aria-hidden className="transition group-open:rotate-90">›</span>
            </summary>
            <p className="mt-2 text-xs tracking-wide text-muted">
              昨天（{Number(yesterday.slice(5, 7))}/{Number(yesterday.slice(8, 10))}）有做到的，可以在這裡補勾。
            </p>
            <ul className="mt-3 space-y-2">
              {dailySelected.map((id) => {
                const { practice } = practiceById.get(id)!;
                const done = isDone(state, id, yesterday);
                return (
                  <li key={id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      onClick={() => dispatch({ type: "toggleYesterday", id }, today)}
                      className="flex w-full items-start gap-3 text-left text-sm leading-relaxed text-ink/80"
                    >
                      <span
                        className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] transition ${
                          done ? "border-transparent bg-gradient-to-br from-rose to-lavender text-white" : "border-ink/25"
                        }`}
                      >
                        {done && "✓"}
                      </span>
                      {practice.text}
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>
        )}
      </section>

      {/* 已完成的任務 */}
      {finished.length > 0 && (
        <section className={card}>
          <h2 className="font-serif text-xl font-bold tracking-wider text-ink">已完成的任務</h2>
          <ul className="mt-4 divide-y divide-ink/8">
            {finished.map(({ practice, date }) => {
              const d = parseDay(date);
              return (
                <li key={practice.id} className="flex items-start gap-3 py-3 text-sm">
                  <span aria-hidden className="text-gold">✦</span>
                  <span className="flex-1 leading-relaxed text-ink/75">
                    {practice.text}
                    <span className="ml-2 text-xs text-muted">
                      {d.getMonth() + 1}/{d.getDate()} 完成
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "undo", id: practice.id }, today)}
                    className="shrink-0 text-xs tracking-wider text-muted underline underline-offset-4 hover:text-ink"
                  >
                    放回清單
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 挑選練習 */}
      <section className={card}>
        <h2 className="font-serif text-2xl font-bold tracking-wider text-ink">挑選練習</h2>
        {quizStage ? (
          <p className="mt-2 text-sm tracking-wide text-muted">
            依你最近一次測驗，你在
            <b className="mx-1 font-serif" style={{ color: stageByKey(quizStage).color }}>
              {stageByKey(quizStage).name}
            </b>
            。也可以看看其他階段的練習。
          </p>
        ) : (
          <p className="mt-2 text-sm tracking-wide text-muted">
            還不知道自己在哪個階段？
            <Link href="/quiz" className="ml-1 text-gold underline underline-offset-4">
              先做 4 題測驗 →
            </Link>
          </p>
        )}

        <div role="tablist" aria-label="選擇階段" className="mt-5 grid grid-cols-4 gap-2">
          {stages.map((s) => {
            const active = s.key === activeStage.key;
            return (
              <button
                key={s.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(s.key)}
                className={`relative rounded-2xl border px-1 py-3 font-serif text-sm font-bold tracking-wider transition sm:text-base ${
                  active ? "bg-white shadow-md" : "border-ink/8 bg-white/40 text-ink/50 hover:text-ink"
                }`}
                style={active ? { borderColor: s.color, color: s.color } : undefined}
              >
                {s.key === quizStage && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink px-2 py-0.5 font-sans text-[10px] font-normal tracking-wider text-white">
                    你的階段
                  </span>
                )}
                {s.name}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-ink/8 bg-white/50 px-5 py-4 text-sm leading-relaxed tracking-wide text-ink/80">
          <p className="font-serif text-base font-bold tracking-wider" style={{ color: activeStage.color }}>
            {activeStage.headline}
            <span className="ml-2 font-sans text-xs font-normal text-muted">{activeStage.focus}</span>
          </p>
          <p className="mt-3">
            <span className="mr-2 text-gold">核心藥方</span>
            {activeStage.core}
          </p>
          <p className="mt-2">
            <span className="mr-2 text-[#b0573f]">{activeStage.upgrade.label}</span>
            {activeStage.upgrade.text}
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-gradient-to-r from-rose/12 to-lavender/18 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-relaxed tracking-wide text-ink/80">
            <span className="mr-2 text-gold">✦ 老師推薦</span>
            {activeStage.name}的必做項目，還沒做到就從它開始。
          </p>
          <button
            type="button"
            onClick={() => dispatch({ type: "recommend", stage: activeStage.key }, today)}
            disabled={full}
            className="shrink-0 rounded-full bg-ink px-5 py-2.5 text-sm tracking-[0.2em] text-white transition hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
          >
            套用老師推薦
          </button>
        </div>

        {(
          [
            ["必做項目", "老師推薦", activeStage.required],
            ["建議項目", null, activeStage.suggested],
          ] as const
        ).map(([title, badge, items]) => (
          <div key={title} className="mt-7">
            <h3 className="font-serif text-lg font-bold tracking-widest text-ink">{title}</h3>
            <ul className="mt-3 space-y-2">
              {items.map((p) => {
                const selected = state.selected.includes(p.id);
                const completed = finishedIds.has(p.id);
                return (
                  <li key={p.id} className="flex items-start gap-3 rounded-2xl border border-ink/8 bg-white/50 p-4">
                    <div className="flex-1">
                      <p className="text-[15px] leading-relaxed text-ink/85">
                        {badge && (
                          <span className="mr-2 rounded-full bg-ink px-2 py-0.5 align-middle text-[10px] tracking-wider text-white">
                            {badge}
                          </span>
                        )}
                        {p.text}
                      </p>
                      <div className="mt-1.5">
                        <Tags p={p} />
                      </div>
                    </div>
                    {completed ? (
                      <span className="shrink-0 px-3 py-1.5 text-xs tracking-wider text-gold">✦ 已完成</span>
                    ) : selected ? (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "remove", id: p.id }, today)}
                        className="shrink-0 rounded-full border border-gold/50 bg-gold/10 px-3 py-1.5 text-xs tracking-wider text-gold transition hover:bg-gold/20"
                      >
                        ✓ 已加入
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => dispatch({ type: "add", id: p.id }, today)}
                        disabled={full}
                        title={full ? `最多挑選 ${MAX_SELECTED} 項` : undefined}
                        className="shrink-0 rounded-full border border-ink/20 bg-white px-3 py-1.5 text-xs tracking-wider text-ink transition hover:border-ink/40 disabled:opacity-35"
                      >
                        ＋ 加入
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        {full && (
          <p className="mt-5 text-center text-xs tracking-wider text-muted">
            已挑滿 {MAX_SELECTED} 項。想換練習，先從「我的練習」移除一項。
          </p>
        )}
      </section>
    </div>
  );
}
