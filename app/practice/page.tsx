import type { Metadata } from "next";
import { Suspense } from "react";
import SiteHeader from "@/components/SiteHeader";
import Sparkle from "@/components/Sparkle";
import { getCurrentUser, guestLink } from "@/lib/auth";
import { EMPTY_PRACTICE } from "@/lib/practice";
import { getPracticeState, getQuizHistory } from "@/lib/userData";
import PracticeApp from "./PracticeApp";
import { orBusy } from "@/components/orBusy";
import BusyNotice from "@/components/BusyNotice";

export const metadata: Metadata = {
  title: "每日練習｜豐盛健康愛",
  description: "從你的階段挑 1–5 項練習，每天完成一項就打卡成功。",
};

// 讀取登入者自己的練習紀錄與最近一次測驗的階段；路人可以試用，只是不會記錄
async function PracticeLoader() {
  return orBusy(async () => {
    const user = await getCurrentUser();
    if (!user) {
      const stale = (await guestLink("/login")) === "/logout";
      return <PracticeApp initialState={EMPTY_PRACTICE} guestLoginHref={stale ? "/logout" : "/login?next=%2Fpractice"} />;
    }
    const [state, history] = await Promise.all([getPracticeState(user.id), getQuizHistory(user.id)]);
    return <PracticeApp initialState={state} quizStage={history.at(-1)?.stage} />;
  }, <BusyNotice />);
}

export default function PracticePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <SiteHeader />

      <Sparkle className="animate-twinkle absolute left-[6%] top-[20%] w-5 text-gold" />
      <Sparkle
        className="animate-twinkle absolute right-[9%] top-[13%] w-6 text-rose"
        style={{ animationDelay: "1s" }}
      />

      <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-6 sm:px-8 sm:pt-10">
        <div className="text-center">
          <p className="flex items-center justify-center gap-4 text-xs tracking-[0.5em] text-gold sm:text-sm">
            <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
            每日練習
            <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
          </p>
          <h1 className="mt-5 font-serif text-3xl font-bold leading-snug tracking-wider text-ink sm:text-5xl sm:leading-tight">
            今天，為<span className="text-aura">豐盛</span>
            <br className="sm:hidden" />
            做一件小事
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-loose tracking-widest text-muted sm:text-base">
            挑 1–5 項你喜歡的練習，
            <br className="sm:hidden" />
            完成一項就能打卡。
          </p>
        </div>

        <Suspense fallback={<div className="mt-10 h-96" />}>
          <PracticeLoader />
        </Suspense>
      </main>
    </div>
  );
}
