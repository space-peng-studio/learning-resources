"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logout } from "@/app/actions/auth";

const itemClass =
  "block w-full rounded-xl px-4 py-2.5 text-left text-sm tracking-wider text-ink transition hover:bg-cream";

export default function UserMenuButton({ name, isAdmin }: { name: string; isAdmin: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 點選單外面或按 Esc 就關閉
  useEffect(() => {
    if (!open) return;
    function onPointer(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-ink/12 bg-white/60 py-1.5 pl-1.5 pr-4 text-sm tracking-wider text-ink backdrop-blur transition hover:bg-white"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-rose to-lavender font-serif text-xs text-white">
          {name.slice(0, 1)}
        </span>
        <span className="max-w-[7rem] truncate">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-44 rounded-2xl border border-ink/8 bg-white/95 p-1.5 shadow-xl backdrop-blur"
        >
          <Link href="/account" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
            帳號設定
          </Link>
          {isAdmin && (
            <Link href="/admin" role="menuitem" className={itemClass} onClick={() => setOpen(false)}>
              管理後台
            </Link>
          )}
          <form action={logout}>
            <button type="submit" role="menuitem" className={`${itemClass} text-muted`}>
              登出
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
