import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import Sparkle from "@/components/Sparkle";
import { getCurrentUser, guestLink } from "@/lib/auth";
import { getQuizHistory } from "@/lib/userData";
import QuizApp from "./QuizApp";
import { orBusy } from "@/components/orBusy";
import BusyNotice from "@/components/BusyNotice";

export const metadata: Metadata = {
  title: "金錢能量測驗｜豐盛健康愛",
  description: "4 題・約 1 分鐘，看見你的修行階段與金錢能量儀表板。",
};

// 讀取登入者自己的測驗紀錄；路人可以作答，只是不會記錄
async function QuizLoader() {
  return orBusy(async () => {
    const user = await getCurrentUser();
    if (!user) {
      const stale = (await guestLink("/login")) === "/logout";
      return (
        <QuizApp
          initialHistory={[]}
          guestLoginHref={stale ? "/logout" : "/login?next=%2Fquiz"}
          guestSignupHref={stale ? "/logout" : "/signup?next=%2Fquiz"}
        />
      );
    }
    return <QuizApp initialHistory={await getQuizHistory(user.id)} />;
  }, <BusyNotice />);
}

export default function QuizPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <SiteHeader />

      <Sparkle className="animate-twinkle absolute left-[7%] top-[24%] w-4 text-rose" />
      <Sparkle
        className="animate-twinkle absolute right-[10%] top-[14%] w-7 text-lavender"
        style={{ animationDelay: "1.2s" }}
      />

      <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-6 sm:px-8 sm:pt-10">
        <div className="text-center">
          <p className="flex items-center justify-center gap-4 text-xs tracking-[0.5em] text-gold sm:text-sm">
            <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
            從哪裡開始
            <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
          </p>
          <h1 className="mt-5 font-serif text-[1.75rem] font-bold leading-snug tracking-wider text-ink sm:text-5xl sm:leading-tight">
            你的<span className="text-aura">「金錢能量」</span>
            <br />
            在哪個階段？
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-sm leading-loose tracking-widest text-muted sm:text-base">
            4 題・約 1 分鐘，跟著直覺選就好。
          </p>
        </div>

        <Suspense fallback={<div className="mt-10 h-96" />}>
          <QuizLoader />
        </Suspense>
      </main>
    </div>
  );
}
