"use client";

import { useState } from "react";

export default function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 不支援剪貼簿時，使用者仍可看著代碼手動輸入
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex items-center gap-3 rounded-full border border-dashed border-gold/60 bg-white/70 py-2 pl-5 pr-2 text-sm text-ink transition hover:bg-white"
    >
      <span className="font-mono text-base tracking-[0.2em]">{code}</span>
      <span
        aria-live="polite"
        className={`rounded-full px-3 py-1 text-xs tracking-widest text-white transition ${
          copied ? "bg-gold" : "bg-ink"
        }`}
      >
        {copied ? "已複製" : "複製"}
      </span>
    </button>
  );
}
