import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Sparkle from "@/components/Sparkle";
import MeditationPlayer from "./MeditationPlayer";

export const metadata: Metadata = {
  title: "3 分鐘安定與豐盛冥想｜豐盛健康愛",
  description: "跟著 Peggie 老師的引導，用 3 分鐘讓呼吸慢下來，回到安定與豐盛。",
};

const tips = [
  "找一個安靜的角落，坐著或躺著都可以",
  "戴上耳機，聲音的陪伴會更完整",
  "允許自己什麼都不做，只是感受",
];

export default function MeditationPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <SiteHeader />

      <Sparkle className="animate-twinkle absolute left-[6%] top-[26%] w-5 text-gold" />
      <Sparkle
        className="animate-twinkle absolute right-[8%] top-[14%] w-6 text-lavender"
        style={{ animationDelay: "1.4s" }}
      />

      <main className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
        <div className="text-center">
          <p className="flex items-center justify-center gap-4 text-xs tracking-[0.5em] text-gold sm:text-sm">
            <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
            冥想練習
            <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
          </p>
          <h1 className="mt-5 font-serif text-3xl font-bold leading-snug tracking-wider text-ink sm:text-5xl sm:leading-tight">
            3 分鐘，回到
            <br className="sm:hidden" />
            <span className="text-aura">「安定與豐盛」</span>
          </h1>
        </div>

        <div className="mt-10 flex w-full flex-col items-center gap-10 md:mt-14 md:flex-row md:items-center md:justify-center md:gap-16">
          <MeditationPlayer />

          <div className="max-w-sm text-center md:text-left">
            <p className="font-serif text-lg leading-loose tracking-wider text-ink/85 sm:text-xl">
              不需要任何準備，
              <br />
              跟著老師的聲音，讓呼吸慢下來，
              <br />
              讓豐盛的能量重新流動。
            </p>

            <p className="mt-8 text-sm tracking-[0.4em] text-gold">開始之前</p>
            <ol className="mt-4 space-y-3 text-left">
              {tips.map((t, i) => (
                <li key={t} className="flex items-start gap-3 text-sm leading-relaxed tracking-wider text-muted sm:text-base">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-gold/40 font-serif text-xs text-gold">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>

            <dl className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 border-t border-ink/10 pt-5 text-sm tracking-wider text-muted md:justify-start">
              <div className="flex gap-2">
                <dt>時長</dt>
                <dd className="text-ink">3 分 14 秒</dd>
              </div>
              <div className="flex gap-2">
                <dt>能量引導</dt>
                <dd className="text-ink">大天使 Peggie 老師</dd>
              </div>
            </dl>
          </div>
        </div>
      </main>
    </div>
  );
}
