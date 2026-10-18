"use client";

import { useEffect, useRef, useState } from "react";
import { saveQuizResult } from "@/app/actions/data";
import TrajectoryChart from "@/components/TrajectoryChart";
import { dateKey } from "@/lib/date";
import { useToday } from "@/lib/useToday";
import { evaluate, questions, stageByKey, type Scores } from "@/lib/moneyMap";
import { formatDate, isInWindow, recordWindow, shortDay, type QuizRecord } from "@/lib/quizHistory";
import GuestNotice from "@/components/GuestNotice";
import ResultView from "./ResultView";

// startDay：這次結果屬於哪一筆紀錄（路人沒有）
type Shown = { scores: Scores; previous?: Scores; startDay?: string };

// 路人做完測驗後去註冊／登入，回來時把這次結果存進帳號（同一個分頁、兩小時內有效）
const PENDING_KEY = "pending-quiz";
const PENDING_TTL = 2 * 60 * 60 * 1000;
type Pending = { scores: Scores; at: number };

function rememberPending(scores: Scores) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ scores, at: Date.now() }));
  } catch {
    // 無法暫存時，登入後就需要重新測驗
  }
}

function takePending(): Pending | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    sessionStorage.removeItem(PENDING_KEY);
    const pending = raw ? (JSON.parse(raw) as Pending) : null;
    return pending && Date.now() - pending.at < PENDING_TTL ? pending : null;
  } catch {
    return null;
  }
}

/** guestLoginHref 有值代表未登入：可以作答看結果，但不會記錄 */
export default function QuizApp({
  initialHistory,
  guestLoginHref,
  guestSignupHref,
}: {
  initialHistory: QuizRecord[];
  guestLoginHref?: string;
  guestSignupHref?: string;
}) {
  const today = useToday();
  const [history, setHistory] = useState(initialHistory);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedFromGuest, setSavedFromGuest] = useState(false);
  const [answers, setAnswers] = useState<Partial<Scores>>({});
  const [shown, setShown] = useState<Shown | null>(null);
  const quizRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const answered = questions.filter((q) => answers[q.key]).length;
  const complete = answered === questions.length;
  const latest = history.at(-1);

  function scrollTo(ref: React.RefObject<HTMLDivElement | null>) {
    requestAnimationFrame(() =>
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!complete) return;
    const scores = answers as Scores;
    setSavedFromGuest(false);
    if (guestLoginHref) {
      setShown({ scores });
      scrollTo(resultRef);
      rememberPending(scores);
      return;
    }

    // 最近一筆的 30 天內：更新那一筆，對照再前一筆；否則新增一筆，對照最近一筆
    const todayKey = dateKey();
    const sameRecord = latest !== undefined && isInWindow(latest.startDay, todayKey);
    const record: QuizRecord = {
      takenAt: new Date().toISOString(),
      startDay: sameRecord ? latest.startDay : todayKey,
      scores,
      stage: evaluate(scores).stage.key,
    };
    setShown({ scores, previous: (sameRecord ? history.at(-2) : latest)?.scores, startDay: record.startDay });
    scrollTo(resultRef);

    const before = history;
    // 先更新畫面，再存到帳號；以伺服器回傳的紀錄為準
    setHistory(sameRecord ? [...history.slice(0, -1), record] : [...history, record]);
    setSaveError(null);
    saveQuizResult(scores)
      .then((res) => {
        if (res.ok) setHistory(res.data);
        else {
          setHistory(before);
          setSaveError(res.error);
        }
      })
      .catch(() => {
        setHistory(before);
        setSaveError("測驗結果沒有儲存成功，請檢查網路後重新測驗一次。");
      });
  }

  // 剛從註冊／登入回來：把路人時做的那次結果存進帳號，並直接顯示
  useEffect(() => {
    if (guestLoginHref) return;
    const pending = takePending();
    if (!pending) return;
    saveQuizResult(pending.scores)
      .then((res) => {
        if (!res.ok) return setSaveError(res.error);
        setHistory(res.data);
        setShown({ scores: pending.scores, previous: res.data.at(-2)?.scores, startDay: res.data.at(-1)?.startDay });
        setSavedFromGuest(true);
        scrollTo(resultRef);
      })
      .catch(() => setSaveError("剛剛的測驗結果沒有存成功，請重新測驗一次。"));
  }, [guestLoginHref]);

  function showLatest() {
    if (!latest) return;
    setShown({ scores: latest.scores, previous: history.at(-2)?.scores, startDay: latest.startDay });
    setSavedFromGuest(false);
    scrollTo(resultRef);
  }

  function retake() {
    setAnswers({});
    setShown(null);
    scrollTo(quizRef);
  }

  // 用瀏覽器的日期判斷（伺服器端為 null，畫面先不顯示依日期而定的文字）
  const latestInWindow = today !== null && latest !== undefined && isInWindow(latest.startDay, today);

  return (
    <>
      {guestLoginHref && (
        <div className="mt-8">
          <GuestNotice loginHref={guestLoginHref}>可以直接作答看結果；登入後，每次的結果都會幫你記錄成成長曲線。</GuestNotice>
        </div>
      )}
      {latest && !shown && (
        <div className="mx-auto mt-8 flex max-w-2xl flex-col items-center gap-3 rounded-2xl border border-gold/30 bg-white/60 px-5 py-4 text-sm tracking-wide text-ink/80 backdrop-blur sm:flex-row sm:justify-between">
          <p>
            上次測驗：{formatDate(latest.takenAt)}・
            <span className="font-serif font-bold" style={{ color: stageByKey(latest.stage).color }}>
              {stageByKey(latest.stage).name}
            </span>
            <span className="ml-2 text-muted">
              {latestInWindow
                ? `${shortDay(recordWindow(latest.startDay).lastDay)}\u00a0前重測會更新這筆紀錄`
                : "已經超過 30 天，來測測現在的你"}
            </span>
          </p>
          <button type="button" onClick={showLatest} className="shrink-0 text-gold underline underline-offset-4">
            查看上次結果
          </button>
        </div>
      )}

      {/* 測驗 */}
      <div ref={quizRef} className="mx-auto max-w-2xl scroll-mt-6">
        {!shown && (
          <form onSubmit={submit} className="mt-10 space-y-6">
            <div className="sticky top-3 z-20 mx-auto flex max-w-xs items-center gap-3 rounded-full border border-ink/10 bg-white/85 px-4 py-2 shadow-sm backdrop-blur">
              <span className="whitespace-nowrap text-xs tracking-[0.2em] text-muted">
                進度 {answered}/{questions.length}
              </span>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose to-lavender transition-all duration-500"
                  style={{ width: `${(answered / questions.length) * 100}%` }}
                />
              </div>
            </div>

            {questions.map((q, qi) => (
              <fieldset
                key={q.key}
                className={`rounded-[1.75rem] border bg-white/70 p-6 backdrop-blur transition sm:p-8 ${
                  answers[q.key] ? "border-lavender/50 shadow-[0_24px_50px_-36px_rgb(80_60_100/0.6)]" : "border-white/70"
                }`}
              >
                <legend className="sr-only">{`第 ${qi + 1} 題：${q.title}`}</legend>
                <div className="mb-6 flex items-baseline gap-4">
                  <span className="text-aura font-serif text-4xl leading-none">0{qi + 1}</span>
                  <div>
                    <p className="text-xs tracking-[0.3em] text-gold">{q.label}</p>
                    <p className="mt-1 font-serif text-base font-bold leading-relaxed tracking-wide text-ink sm:text-lg">
                      {q.title}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {q.options.map((opt, oi) => {
                    const value = oi + 1;
                    const checked = answers[q.key] === value;
                    return (
                      <label
                        key={opt}
                        className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-lavender ${
                          checked
                            ? "border-lavender bg-white font-bold text-[#5e4b6b] shadow-[0_12px_28px_-16px_rgb(143_162_203/0.9)]"
                            : "border-ink/10 bg-white/60 text-ink/80 hover:-translate-y-0.5 hover:border-lavender/60"
                        }`}
                      >
                        <input
                          type="radio"
                          name={q.key}
                          value={value}
                          checked={checked}
                          onChange={() => setAnswers((a) => ({ ...a, [q.key]: value }))}
                          className="sr-only"
                        />
                        <span
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs ${
                            checked ? "bg-gradient-to-br from-rose to-lavender text-white" : "bg-cream text-muted"
                          }`}
                        >
                          {value}
                        </span>
                        {opt}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <button
              type="submit"
              disabled={!complete}
              className="flex w-full items-center justify-center gap-3 rounded-full bg-ink py-5 text-sm tracking-[0.25em] text-white shadow-[0_24px_48px_-24px_rgb(34_31_42/0.7)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:text-base"
            >
              {complete ? "看見我的修行位置 →" : `還有 ${questions.length - answered} 題沒回答`}
            </button>
          </form>
        )}
      </div>

      {/* 結果 */}
      <div ref={resultRef} className="mx-auto mt-10 max-w-3xl scroll-mt-6">
        {shown && (
          <>
            {saveError && (
              <p role="alert" className="mb-4 rounded-2xl bg-[#b0573f]/10 px-5 py-3 text-center text-sm text-[#9a4632]">
                {saveError}
              </p>
            )}
            {savedFromGuest && (
              <p role="status" className="mb-4 rounded-2xl bg-[#6f9a5b]/12 px-5 py-3 text-center text-sm tracking-wide text-[#4f7a3f]">
                ✦ 已把剛剛的測驗結果存進你的帳號
              </p>
            )}
            <ResultView scores={shown.scores} previous={shown.previous} />
          </>
        )}
      </div>

      {/* 成長軌跡 */}
      {history.length > 0 && (
        <section className="mx-auto mt-16 max-w-3xl rounded-[2rem] border border-white/70 bg-white/60 p-6 backdrop-blur sm:p-10">
          <p className="text-xs tracking-[0.4em] text-gold">成長軌跡</p>
          <h2 className="mt-3 font-serif text-2xl font-bold tracking-wider text-ink">我的金錢能量曲線</h2>
          <p className="mt-2 text-balance break-keep text-sm leading-relaxed tracking-wide text-muted">
            每 30 天記錄一筆：從第一次測驗那天起，30 天內重測會更新，之後再測會新增一筆。
          </p>
          <div className="mt-6">
            <TrajectoryChart records={history} />
          </div>
          <ul className="mt-6 divide-y divide-ink/8 border-y border-ink/8">
            {[...history].reverse().map((r) => {
              const s = stageByKey(r.stage);
              return (
                <li key={r.takenAt} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm tracking-wide">
                  <span className="text-muted">{r.startDay.split("-").map(Number).join("/")} 起</span>
                  <span className="font-serif font-bold" style={{ color: s.color }}>
                    {s.name}
                  </span>
                  <span className="text-xs text-muted">
                    情緒 {r.scores.emotion}・信念 {r.scores.belief}・行為 {r.scores.action}・資產 {r.scores.asset}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 收尾：依狀況提醒下一步 */}
      {shown && (
        <section className="mx-auto mt-10 max-w-3xl text-center">
          {guestLoginHref ? (
            <>
              <p className="text-balance break-keep font-serif text-lg leading-relaxed tracking-wider text-ink sm:text-xl">
                這次的結果還沒有存起來。
              </p>
              <p className="mx-auto mt-2 max-w-md text-balance break-keep text-sm leading-relaxed tracking-wide text-muted sm:text-base">
                註冊或登入，就能存進你的帳號，幫你畫出成長曲線。
              </p>
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={guestSignupHref}
                  className="rounded-full bg-ink px-8 py-3.5 text-sm tracking-[0.25em] text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5"
                >
                  註冊並存起來
                </a>
                <a
                  href={guestLoginHref}
                  className="rounded-full border border-ink/25 bg-white/60 px-8 py-3.5 text-sm tracking-[0.25em] text-ink transition hover:bg-white"
                >
                  我有帳號，登入
                </a>
              </div>
              <button
                type="button"
                onClick={retake}
                className="mt-5 text-sm tracking-widest text-muted underline underline-offset-4 hover:text-ink"
              >
                重新測驗
              </button>
            </>
          ) : today && shown.startDay && !isInWindow(shown.startDay, today) ? (
            <>
              <p className="text-balance break-keep font-serif text-lg leading-relaxed tracking-wider text-ink sm:text-xl">
                距離上次記錄已經超過 30 天，來測測現在的你。
              </p>
              <button
                type="button"
                onClick={retake}
                className="mt-6 rounded-full bg-ink px-8 py-3.5 text-sm tracking-[0.25em] text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5"
              >
                開始新的測驗
              </button>
            </>
          ) : (
            <>
              <p className="text-balance break-keep font-serif text-lg leading-relaxed tracking-wider text-ink sm:text-xl">
                這次的結果已經記錄下來了。
              </p>
              {shown.startDay && (
                <p className="mx-auto mt-2 max-w-md text-balance break-keep text-sm leading-relaxed tracking-wide text-muted sm:text-base">
                  這筆紀錄從 {shortDay(shown.startDay)} 開始。
                  <br />
                  {shortDay(recordWindow(shown.startDay).lastDay)}&nbsp;前重測會更新它，
                  {shortDay(recordWindow(shown.startDay).nextDay)}&nbsp;之後再測會新增一筆。
                </p>
              )}
              <button
                type="button"
                onClick={retake}
                className="mt-6 rounded-full border border-ink/25 bg-white/60 px-8 py-3.5 text-sm tracking-[0.25em] text-ink transition hover:-translate-y-0.5 hover:bg-white"
              >
                重新測驗
              </button>
            </>
          )}
        </section>
      )}
    </>
  );
}
