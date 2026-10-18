import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import TrajectoryChart from "@/components/TrajectoryChart";
import { getStudentDetail } from "@/lib/adminData";
import { getCurrentUser } from "@/lib/auth";
import { dateKey, daysBetween, taipeiDate } from "@/lib/date";
import { frequencyLabel, stageByKey } from "@/lib/moneyMap";
import { completedTasks, isDone, practiceById } from "@/lib/practice";
import { formatDate } from "@/lib/quizHistory";
import { orBusy } from "@/components/orBusy";
import BusyNotice from "@/components/BusyNotice";

// 管理員查看單一學員的紀錄（唯讀）

const card = "rounded-[2rem] border border-white/70 bg-white/60 p-6 backdrop-blur sm:p-8";
const RECENT_DAYS = 28;

// YYYY-MM-DD → 2026/10/17（直接拆字串，不經過時區換算）
const ymd = (key: string) => key.split("-").map(Number).join("/");

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/70 px-4 py-3">
      <p className="text-xs tracking-widest text-muted">{label}</p>
      <p className="mt-1 font-serif text-lg font-bold text-ink">{value}</p>
    </div>
  );
}

async function StudentContent({ params }: { params: Promise<{ id: string }> }) {
  return orBusy(async () => {
    const admin = await getCurrentUser();
    if (!admin?.isAdmin) notFound();

    const detail = await getStudentDetail((await params).id);
    if (!detail) notFound();
    const { summary: s, history, practice } = detail;

    const today = taipeiDate();
    const stage = s.stage && stageByKey(s.stage);
    const idle = s.lastCheckIn ? daysBetween(s.lastCheckIn, today) : null;
    const finished = completedTasks(practice);

    // 最近 28 天的打卡格子
    const [y, m, d] = today.split("-").map(Number);
    const recent = Array.from({ length: RECENT_DAYS }, (_, i) => {
      const key = dateKey(new Date(y, m - 1, d - (RECENT_DAYS - 1 - i)));
      return { key, done: (practice.log[key]?.length ?? 0) > 0 };
    });

    return (
      <div className="space-y-5">
        <Link href="/admin" className="text-sm tracking-widest text-muted transition hover:text-ink">
          ← 學員名單
        </Link>

        <section className={card}>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-3xl font-bold tracking-[0.15em] text-ink">{s.name}</h1>
            {stage ? (
              <span className="rounded-full px-3 py-1 text-xs tracking-wider text-white" style={{ backgroundColor: stage.color }}>
                {stage.name}
              </span>
            ) : (
              <span className="rounded-full bg-ink/8 px-3 py-1 text-xs tracking-wider text-muted">尚未測驗</span>
            )}
          </div>
          <p className="mt-1 text-sm text-muted">
            {s.email}・加入於 {ymd(s.joinedAt)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="累積修行" value={`${s.practiceDays} 天`} />
            <Stat
              label="最後打卡"
              value={idle === null ? "還沒打過卡" : idle === 0 ? "今天" : `${idle} 天前`}
            />
            <Stat label="最近測驗" value={s.lastQuizAt ? ymd(s.lastQuizAt) : "—"} />
            <Stat label="目前練習" value={`${s.selectedCount} 項`} />
          </div>

          <p className="mt-6 text-xs tracking-widest text-muted">最近 {RECENT_DAYS} 天打卡</p>
          <ol className="mt-2 grid grid-cols-14 gap-1.5">
            {recent.map((r) => (
              <li
                key={r.key}
                title={`${r.key}${r.done ? " 有打卡" : ""}`}
                className={`aspect-square rounded-md ${
                  r.done ? "bg-gradient-to-br from-rose to-lavender" : r.key === today ? "border border-dashed border-gold/60" : "bg-ink/6"
                }`}
              />
            ))}
          </ol>
        </section>

        <section className={card}>
          <h2 className="font-serif text-xl font-bold tracking-wider text-ink">金錢能量曲線</h2>
          {history.length === 0 ? (
            <p className="mt-4 text-sm text-muted">還沒有測驗紀錄。</p>
          ) : (
            <>
              <div className="mt-5">
                <TrajectoryChart records={history} />
              </div>
              <ul className="mt-5 divide-y divide-ink/8 border-y border-ink/8">
                {[...history].reverse().map((r) => {
                  const rs = stageByKey(r.stage);
                  return (
                    <li key={r.startDay} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <span className="text-muted">{formatDate(r.takenAt)}</span>
                      <span className="font-serif font-bold" style={{ color: rs.color }}>
                        {rs.name}
                      </span>
                      <span className="text-xs text-muted">
                        情緒 {r.scores.emotion}・信念 {r.scores.belief}・行為 {r.scores.action}・資產 {r.scores.asset}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <section className={card}>
          <h2 className="font-serif text-xl font-bold tracking-wider text-ink">目前的練習</h2>
          {practice.selected.length === 0 ? (
            <p className="mt-4 text-sm text-muted">還沒有挑選練習。</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {practice.selected.map((id) => {
                const p = practiceById.get(id)?.practice;
                if (!p) return null;
                const done = isDone(practice, id, today);
                return (
                  <li key={id} className="flex items-start gap-3 rounded-2xl bg-white/60 px-4 py-3 text-sm">
                    <span aria-hidden className={done ? "text-gold" : "text-ink/25"}>
                      {done ? "✓" : "○"}
                    </span>
                    <span className="flex-1 leading-relaxed text-ink/85">
                      {p.text}
                      <span className="ml-2 text-xs text-muted">
                        {frequencyLabel[p.frequency]}
                        {done && "・本期已完成"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {finished.length > 0 && (
            <>
              <h3 className="mt-7 font-serif text-lg font-bold tracking-wider text-ink">已完成的任務</h3>
              <ul className="mt-3 space-y-2">
                {finished.map(({ practice: p, date }) => (
                  <li key={p.id} className="flex items-start gap-3 text-sm leading-relaxed text-ink/75">
                    <span aria-hidden className="text-gold">✦</span>
                    <span className="flex-1">
                      {p.text}
                      <span className="ml-2 text-xs text-muted">{ymd(date)} 完成</span>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    );
  }, <BusyNotice />);
}

export default function StudentPage({ params }: PageProps<"/admin/students/[id]">) {
  return (
    <div className="relative flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-20 pt-6 sm:px-8 sm:pt-10">
        <Suspense fallback={<div className="h-96" />}>
          <StudentContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}
