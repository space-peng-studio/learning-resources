"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { resetPassword } from "@/app/actions/auth";
import { inputClass } from "@/components/AuthCard";
import type { StudentSummary } from "@/lib/adminData";
import { daysBetween } from "@/lib/date";
import { stageByKey } from "@/lib/moneyMap";

// 超過這麼多天沒打卡就標示提醒
const INACTIVE_DAYS = 7;

const FILTERS = {
  all: "全部",
  inactive: `${INACTIVE_DAYS} 天以上沒打卡`,
  untested: "尚未測驗",
  tempPassword: "臨時密碼中",
} as const;
type Filter = keyof typeof FILTERS;

const shortDate = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

export default function AdminPanel({ students, today }: { students: StudentSummary[]; today: string }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [result, setResult] = useState<{ row: StudentSummary; tempPassword?: string; error?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const idle = (s: StudentSummary) => (s.lastCheckIn ? daysBetween(s.lastCheckIn, today) : null);
  const isInactive = (s: StudentSummary) => {
    const d = idle(s);
    return d === null || d >= INACTIVE_DAYS;
  };

  const q = query.trim().toLowerCase();
  const shown = students
    .filter((s) => !q || s.email.includes(q) || s.name.toLowerCase().includes(q))
    .filter((s) =>
      filter === "inactive"
        ? isInactive(s)
        : filter === "untested"
          ? !s.stage
          : filter === "tempPassword"
            ? s.mustChangePassword
            : true,
    );

  function reset(row: StudentSummary) {
    if (!confirm(`確定要幫「${row.name}」（${row.email}）重設密碼嗎？\n對方所有裝置都會被登出。`)) return;
    setCopied(false);
    startTransition(async () => {
      setResult({ row, ...(await resetPassword(row.id)) });
    });
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // 無法複製時，管理員可以直接看著畫面輸入
    }
  }

  return (
    <div className="space-y-6">
      {result && (
        <div
          role="status"
          className={`rounded-[2rem] border p-6 sm:p-8 ${
            result.error ? "border-[#b0573f]/30 bg-[#b0573f]/8" : "border-gold/40 bg-white/80"
          }`}
        >
          {result.error ? (
            <p className="text-[#9a4632]">重設失敗：{result.error}</p>
          ) : (
            <>
              <p className="text-sm tracking-wider text-muted">
                已為 <b className="text-ink">{result.row.name}</b>（{result.row.email}）產生臨時密碼
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <code className="rounded-xl bg-cream px-5 py-3 font-mono text-2xl tracking-widest text-ink">
                  {result.tempPassword}
                </code>
                <button
                  type="button"
                  onClick={() => copy(result.tempPassword!)}
                  className="rounded-full bg-ink px-5 py-2.5 text-sm tracking-widest text-white"
                >
                  {copied ? "已複製" : "複製"}
                </button>
              </div>
              <p className="mt-4 text-sm leading-relaxed tracking-wide text-ink/75">
                請透過 LINE 把這組臨時密碼傳給學員。對方用它登入後，會被要求立刻設定新密碼。
                <br />
                這組密碼只會顯示這一次，關掉頁面就看不到了。
              </p>
            </>
          )}
        </div>
      )}

      <div className="rounded-[2rem] border border-white/70 bg-white/60 p-6 backdrop-blur sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-serif text-xl font-bold tracking-wider text-ink">
            學員名單 <span className="text-sm font-normal text-muted">{shown.length} 位</span>
          </h2>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜尋名字或 Email"
            className={`${inputClass} sm:max-w-xs`}
          />
        </div>

        <div role="group" aria-label="篩選" className="mt-4 flex flex-wrap gap-2">
          {(Object.keys(FILTERS) as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs tracking-wider transition ${
                filter === f ? "bg-ink text-white" : "border border-ink/15 bg-white/60 text-ink/70 hover:bg-white"
              }`}
            >
              {FILTERS[f]}
            </button>
          ))}
        </div>

        <ul className="mt-5 divide-y divide-ink/8 border-y border-ink/8">
          {shown.map((s) => {
            const stage = s.stage && stageByKey(s.stage);
            const d = idle(s);
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/students/${s.id}`}
                      className="font-serif font-bold tracking-wider text-ink underline-offset-4 hover:underline"
                    >
                      {s.name}
                    </Link>
                    {stage ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[11px] tracking-wider text-white"
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.name}
                      </span>
                    ) : (
                      <span className="rounded-full bg-ink/8 px-2 py-0.5 text-[11px] tracking-wider text-muted">尚未測驗</span>
                    )}
                    {s.mustChangePassword && (
                      <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] text-gold">臨時密碼中</span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted">{s.email}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted">
                    累積修行 <b className="text-ink">{s.practiceDays}</b> 天・
                    {d === null ? (
                      <span className="text-[#b0573f]">還沒打過卡</span>
                    ) : d === 0 ? (
                      <span className="text-[#4f7a3f]">今天有打卡</span>
                    ) : (
                      <span className={d >= INACTIVE_DAYS ? "text-[#b0573f]" : ""}>
                        最後打卡 {shortDate(s.lastCheckIn!)}（{d} 天前）
                      </span>
                    )}
                    {s.lastQuizAt && <>・最近測驗 {shortDate(s.lastQuizAt)}</>}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="rounded-full bg-ink px-4 py-2 text-sm tracking-wider text-white transition hover:-translate-y-0.5"
                  >
                    查看紀錄
                  </Link>
                  <button
                    type="button"
                    onClick={() => reset(s)}
                    disabled={pending}
                    className="rounded-full border border-ink/20 bg-white px-4 py-2 text-sm tracking-wider text-ink transition hover:border-ink/40 disabled:opacity-50"
                  >
                    重設密碼
                  </button>
                </div>
              </li>
            );
          })}
          {shown.length === 0 && <li className="py-8 text-center text-sm text-muted">沒有符合的學員</li>}
        </ul>
      </div>
    </div>
  );
}
