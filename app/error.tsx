"use client";

import Link from "next/link";

// 全站的最後防線：其他沒有預料到的錯誤，顯示溫和的訊息而不是錯誤畫面
export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/65 px-8 py-12 text-center backdrop-blur">
        <p className="font-serif text-2xl tracking-widest text-ink">系統暫時忙碌</p>
        <p className="mt-3 text-sm leading-relaxed tracking-wide text-muted">請稍後再試一次，你的紀錄都還在。</p>
        <div className="mt-7 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => retry()}
            className="rounded-full bg-ink px-6 py-2.5 text-sm tracking-[0.2em] text-white transition hover:-translate-y-0.5"
          >
            再試一次
          </button>
          <Link
            href="/"
            className="rounded-full border border-ink/20 bg-white/70 px-6 py-2.5 text-sm tracking-[0.2em] text-ink transition hover:bg-white"
          >
            回首頁
          </Link>
        </div>
      </div>
    </div>
  );
}
