import { notFound } from "next/navigation";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import { getStudentSummaries } from "@/lib/adminData";
import { getCurrentUser } from "@/lib/auth";
import { daysBetween, taipeiDate } from "@/lib/date";
import { stages } from "@/lib/moneyMap";
import AdminPanel from "./AdminPanel";
import { orBusy } from "@/components/orBusy";
import BusyNotice from "@/components/BusyNotice";

// 刻意不設定頁面標題：非管理員看到的就是「找不到頁面」，不會知道這裡有管理頁

function Stat({ label, value, note }: { label: string; value: number; note?: string }) {
  return (
    <div className="rounded-3xl border border-white/70 bg-white/60 p-5 text-center backdrop-blur">
      <p className="text-xs tracking-[0.3em] text-muted">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold text-ink">{value}</p>
      {note && <p className="mt-1 text-xs text-muted">{note}</p>}
    </div>
  );
}

async function AdminContent() {
  return orBusy(async () => {
    // 路人與一般學員都只會看到「找不到頁面」
    const admin = await getCurrentUser();
    if (!admin?.isAdmin) notFound();

    const students = await getStudentSummaries();
    const today = taipeiDate();
    const activeThisWeek = students.filter((s) => s.lastCheckIn && daysBetween(s.lastCheckIn, today) <= 6).length;
    const checkedInToday = students.filter((s) => s.lastCheckIn === today).length;
    const untested = students.filter((s) => !s.stage).length;

    return (
      <>
        <h1 className="text-center font-serif text-3xl font-bold tracking-[0.2em] text-ink">管理後台</h1>

        <section aria-label="總覽" className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="學員" value={students.length} />
          <Stat label="本週有打卡" value={activeThisWeek} note="最近 7 天" />
          <Stat label="今天打卡" value={checkedInToday} />
        </section>

        <section aria-label="階段分布" className="mt-3 rounded-3xl border border-white/70 bg-white/60 p-5 backdrop-blur">
          <p className="text-xs tracking-[0.3em] text-muted">階段分布（依最近一次測驗）</p>
          <ul className="mt-3 grid grid-cols-5 gap-2 text-center">
            {stages.map((s) => (
              <li key={s.key}>
                <p className="font-serif text-sm font-bold tracking-wider" style={{ color: s.color }}>
                  {s.name}
                </p>
                <p className="mt-1 font-serif text-2xl text-ink">{students.filter((x) => x.stage === s.key).length}</p>
              </li>
            ))}
            <li>
              <p className="font-serif text-sm font-bold tracking-wider text-muted">未測驗</p>
              <p className="mt-1 font-serif text-2xl text-ink">{untested}</p>
            </li>
          </ul>
        </section>

        <div className="mt-6">
          <AdminPanel students={students} today={today} />
        </div>
      </>
    );
  }, <BusyNotice />);
}

export default function AdminPage() {
  return (
    <div className="relative flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 pb-20 pt-6 sm:px-8 sm:pt-10">
        <Suspense fallback={<div className="h-96" />}>
          <AdminContent />
        </Suspense>
      </main>
    </div>
  );
}
