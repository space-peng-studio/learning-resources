import Link from "next/link";
import { Suspense } from "react";
import { getCurrentUser, guestLink } from "@/lib/auth";
import { getPracticeState, getQuizHistory } from "@/lib/userData";
import SiteHeader from "@/components/SiteHeader";
import Sparkle from "@/components/Sparkle";
import HomeCheckIn from "./HomeCheckIn";
import { orBusy } from "@/components/orBusy";
import BusyNotice from "@/components/BusyNotice";

// 每張卡的色塊顏色（淡底、深字），讓六個功能一眼就能分辨
const tools = [
  {
    href: "/quiz",
    label: "從這裡開始",
    title: "我的金錢能量走到哪了？",
    body: (
      <>
        4&nbsp;題，看見你的修行階段與<span className="whitespace-nowrap">能量儀表板</span>。
      </>
    ),
    chip: "bg-[#f4dfe5] text-[#9a5468]",
  },
  {
    href: "/practice",
    label: "每日練習",
    title: "今天，為豐盛做一件小事",
    body: "挑 1–5 項練習，完成一項就打卡成功。",
    chip: "bg-[#f2e6d2] text-[#87663a]",
  },
  {
    href: "/oracle",
    label: "今日豐盛指引",
    title: "宇宙今天想對你說什麼？",
    body: "深呼吸，憑直覺抽一張屬於你的指引。",
    chip: "bg-[#e7e2f3] text-[#65558a]",
  },
  {
    href: "/cards",
    label: "轉念練習",
    title: "焦慮來時，念一句就好",
    body: "10 個萬用咒語，滑一張、念一句。",
    chip: "bg-[#f5e4da] text-[#9b5d45]",
  },
  {
    href: "/meditation",
    label: "冥想練習",
    title: "3 分鐘，回到安定與豐盛",
    body: "跟著老師的聲音，讓呼吸慢下來。",
    chip: "bg-[#dfe7f3] text-[#4b668e]",
  },
  {
    href: "/courses",
    label: "更多學習",
    title: "陪你走得更深、更穩",
    body: "分享會、30\u00a0天練習與一對一諮詢。",
    chip: "bg-[#e1ebdd] text-[#52704c]",
  },
];

function ToolCard({ tool: t }: { tool: (typeof tools)[number] }) {
  return (
    <Link
      href={t.href}
      className="group flex h-full flex-col rounded-[2rem] border border-white/70 bg-white/60 p-6 shadow-[0_20px_50px_-36px_rgb(80_60_100/0.55)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/85 hover:shadow-[0_28px_60px_-34px_rgb(80_60_100/0.6)] sm:p-7"
    >
      <span className={`w-fit rounded-full px-4 py-1.5 text-[15px] font-bold tracking-[0.2em] ${t.chip}`}>{t.label}</span>
      <span className="mt-5 text-balance font-serif text-2xl font-bold leading-snug tracking-wider text-ink">
        {t.title}
      </span>
      <span className="mt-3 flex-1 text-pretty text-[15px] leading-relaxed tracking-wide text-ink/65">
        {t.body}
      </span>
      <span
        aria-hidden
        className="mt-5 flex size-10 items-center justify-center self-end rounded-full border border-ink/12 text-ink/60 transition group-hover:border-ink/30 group-hover:bg-white group-hover:text-ink"
      >
        <span className="transition group-hover:translate-x-0.5">→</span>
      </span>
    </Link>
  );
}

async function Greeting() {
  return orBusy(async () => {
    const user = await getCurrentUser();
    return user ? <>歡迎回來，{user.name}</> : null;
  }, null);
}

// 路人看到的邀請：測驗與打卡需要登入，其他工具直接用
async function GuestInvite() {
  const [signupHref, loginHref] = await Promise.all([guestLink("/signup"), guestLink("/login")]);
  return (
    <section className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-white/65 p-6 text-center shadow-[0_24px_60px_-40px_rgb(80_60_100/0.55)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:text-left">
      <div>
        <p className="font-serif text-xl font-bold tracking-widest text-ink">登入，開始記錄你的修行</p>
        <p className="mt-2 text-sm leading-relaxed tracking-wider text-muted">
          每個工具都可以直接使用；
          <br className="sm:hidden" />
          登入後，測驗結果與打卡會幫你記錄下來。
        </p>
      </div>
      <div className="flex shrink-0 justify-center gap-3">
        <a
          href={signupHref}
          className="rounded-full border border-ink/20 bg-white/60 px-6 py-3 text-sm tracking-[0.2em] text-ink transition hover:-translate-y-0.5 hover:bg-white"
        >
          建立帳號
        </a>
        <a
          href={loginHref}
          className="rounded-full bg-ink px-6 py-3 text-sm tracking-[0.2em] text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5"
        >
          登入
        </a>
      </div>
    </section>
  );
}

async function CheckInLoader() {
  return orBusy(async () => {
    const user = await getCurrentUser();
    if (!user) return <GuestInvite />;
    const [state, history] = await Promise.all([getPracticeState(user.id), getQuizHistory(user.id)]);
    return <HomeCheckIn state={state} quizStage={history.at(-1)?.stage} />;
  }, <BusyNotice compact />);
}

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <SiteHeader isHome />

      <Sparkle className="animate-twinkle absolute left-[8%] top-[22%] w-4 text-rose" />
      <Sparkle
        className="animate-twinkle absolute right-[12%] top-[12%] w-7 text-lavender"
        style={{ animationDelay: "1.2s" }}
      />
      <Sparkle
        className="animate-twinkle absolute right-[20%] top-[38%] w-4 text-gold"
        style={{ animationDelay: "0.6s" }}
      />

      <main className="relative mx-auto w-full max-w-6xl flex-1 px-4 pb-20 pt-8 sm:px-8 sm:pt-14">
        <div className="text-center">
          <p className="min-h-[1.75em] font-serif text-lg tracking-[0.2em] text-ink/80 sm:text-xl">
            <Suspense fallback={null}>
              <Greeting />
            </Suspense>
          </p>
          <div className="relative mx-auto mt-4 w-fit">
            {/* 大標背後呼吸般的光暈 */}
            <div
              aria-hidden
              className="animate-halo pointer-events-none absolute left-1/2 top-1/2 h-[140%] w-[150%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(236_196_206/0.75),rgb(200_186_226/0.45)_55%,transparent)] blur-2xl"
            />
            <Sparkle className="animate-twinkle absolute -right-6 -top-3 w-7 text-gold sm:-right-10 sm:-top-2 sm:w-10" />
            <Sparkle
              className="animate-twinkle absolute -left-5 top-[38%] w-4 text-lavender sm:-left-9 sm:w-5"
              style={{ animationDelay: "1.1s" }}
            />
            <Sparkle
              className="animate-twinkle absolute -bottom-5 -right-3 w-3 text-rose sm:-right-6 sm:w-4"
              style={{ animationDelay: "2s" }}
            />

            <h1 className="relative font-serif font-bold text-ink">
              {/* 進場動畫與流光分在兩層，兩個動畫才不會互相覆蓋 */}
              <span className="animate-rise block">
                <span className="text-shimmer block text-6xl leading-tight tracking-[0.18em] sm:text-8xl">
                  金錢靈氣
                </span>
              </span>
              <span
                className="animate-rise mt-2 block text-3xl leading-snug tracking-[0.3em] sm:mt-3 sm:text-5xl"
                style={{ animationDelay: "0.25s" }}
              >
                陪伴你的日常
              </span>
            </h1>
          </div>
          <p
            className="animate-rise mx-auto mt-8 flex items-center justify-center gap-3 text-sm tracking-[0.35em] text-gold sm:gap-4 sm:text-base"
            style={{ animationDelay: "0.5s" }}
          >
            <span aria-hidden className="h-px w-8 bg-gold/50 sm:w-14" />
            從焦慮回到安穩的日常練習
            <span aria-hidden className="h-px w-8 bg-gold/50 sm:w-14" />
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl">
          <Suspense fallback={<div className="h-40 rounded-[2rem] bg-white/40 sm:h-28" />}>
            <CheckInLoader />
          </Suspense>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {tools.map((t) => (
            <li key={t.href}>
              <ToolCard tool={t} />
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
