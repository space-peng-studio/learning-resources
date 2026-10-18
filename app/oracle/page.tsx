import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Sparkle from "@/components/Sparkle";
import OracleDraw from "./OracleDraw";

export const metadata: Metadata = {
  title: "今日豐盛指引｜豐盛健康愛",
  description: "今天，來抽一張屬於你的豐盛指引吧！",
};

export default function OraclePage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <SiteHeader />

      {/* 背景星星 */}
      <Sparkle className="animate-twinkle absolute left-[8%] top-[30%] w-4 text-rose" />
      <Sparkle
        className="animate-twinkle absolute right-[10%] top-[18%] w-7 text-lavender"
        style={{ animationDelay: "1.2s" }}
      />
      <Sparkle
        className="animate-twinkle absolute bottom-[14%] right-[16%] w-5 text-gold"
        style={{ animationDelay: "0.6s" }}
      />

      <main className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-4 pb-16 pt-6 text-center sm:pt-10">
        <p className="flex items-center gap-4 text-xs tracking-[0.5em] text-gold sm:text-sm">
          <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
          今日豐盛指引
          <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
        </p>
        <h1 className="mt-5 break-keep font-serif text-[1.65rem] font-bold leading-snug tracking-wider text-ink sm:text-5xl sm:leading-tight">
          今天，來抽一張
          <br />
          屬於你的<span className="text-aura">「豐盛指引」</span>吧！
        </h1>

        <OracleDraw />
      </main>
    </div>
  );
}
