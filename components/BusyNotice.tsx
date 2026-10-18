"use client";

// 資料庫等服務暫時連不上時的提示，取代原本會出現的錯誤畫面
export default function BusyNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="status"
      className={`mx-auto max-w-xl rounded-[2rem] border border-white/70 bg-white/65 text-center backdrop-blur ${
        compact ? "px-6 py-5" : "mt-10 px-6 py-10"
      }`}
    >
      <p className="font-serif text-lg tracking-widest text-ink">系統暫時忙碌</p>
      <p className="mt-2 text-sm leading-relaxed tracking-wide text-muted">
        你的紀錄都還在，請稍後再試一次。
        <br />
        抽卡、轉念小卡、冥想都可以照常使用。
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-5 rounded-full border border-ink/20 bg-white/70 px-6 py-2.5 text-sm tracking-[0.2em] text-ink transition hover:bg-white"
      >
        重新整理
      </button>
    </div>
  );
}
