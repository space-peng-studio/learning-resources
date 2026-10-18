import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser, guestLink } from "@/lib/auth";
import UserMenuButton from "./UserMenuButton";
import { orBusy } from "@/components/orBusy";

// 讀取登入者是請求當下才知道的資料，放在 Suspense 裡，頁面其他部分不用等
async function UserMenu() {
  return orBusy(async () => {
    const user = await getCurrentUser();
    if (user) return <UserMenuButton name={user.name} isAdmin={user.isAdmin} />;

    const loginHref = await guestLink("/login");
    return (
      <a
        href={loginHref}
        className="rounded-full bg-ink px-6 py-2.5 text-sm tracking-[0.2em] text-white shadow-lg shadow-ink/15 transition hover:-translate-y-0.5"
      >
        登入
      </a>
    );
  }, null);
}

export default function SiteHeader({ isHome = false }: { isHome?: boolean }) {
  return (
    <header className="relative z-40 mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-8">
      <Link
        href="/"
        className="flex shrink-0 items-center gap-3 font-serif text-lg tracking-[0.3em] text-ink"
      >
        <Image src="/logo.png" alt="" width={40} height={40} preload className="size-9 sm:size-10" />
        <span className={isHome ? "" : "hidden sm:inline"}>豐盛健康愛</span>
      </Link>
      <div className="flex items-center gap-4">
        {!isHome && (
          <Link href="/" className="text-sm tracking-widest text-muted transition hover:text-ink">
            ← 回首頁
          </Link>
        )}
        <Suspense fallback={<span className="block h-10 w-24 rounded-full bg-white/40" />}>
          <UserMenu />
        </Suspense>
      </div>
    </header>
  );
}
