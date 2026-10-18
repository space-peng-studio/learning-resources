import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Sparkle from "@/components/Sparkle";
import CardCarousel from "./CardCarousel";

export const metadata: Metadata = {
  title: "金錢靈氣轉念小卡｜豐盛健康愛",
  description: "10 個金錢靈氣萬用咒語，讓金錢焦慮瞬間轉念的小練習。",
};

const slides = [
  { src: "/mindset-cards/cover.png", alt: "金錢靈氣轉念小卡封面" },
  ...Array.from({ length: 10 }, (_, i) => ({
    src: `/mindset-cards/card-${String(i + 1).padStart(2, "0")}.jpg`,
    alt: `轉念小卡第 ${i + 1} 張`,
  })),
];

export default function CardsPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <SiteHeader />

      <Sparkle className="animate-twinkle absolute left-[7%] top-[22%] w-5 text-lavender" />
      <Sparkle
        className="animate-twinkle absolute right-[9%] top-[30%] w-4 text-rose"
        style={{ animationDelay: "1s" }}
      />

      <main className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col items-center pb-16 pt-6 text-center sm:pt-10">
        <p className="flex items-center gap-4 px-4 text-xs tracking-[0.5em] text-gold sm:text-sm">
          <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
          情緒轉念練習
          <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
        </p>
        <h1 className="mt-5 px-4 font-serif text-3xl font-bold leading-snug tracking-wider text-ink sm:text-5xl">
          <span className="text-aura">金錢靈氣</span>轉念小卡
        </h1>
        <p className="mt-4 max-w-md px-4 text-sm leading-relaxed tracking-widest text-muted sm:text-base">
          金錢焦慮浮現時，滑一張、念一句，
          <br />
          讓心回到豐盛的頻率。
        </p>

        <CardCarousel slides={slides} />

        <a
          href="/mindset-cards/mindset-cards.pdf"
          download="金錢靈氣轉念小卡.pdf"
          className="mt-10 inline-flex items-center gap-3 rounded-full bg-ink px-8 py-4 tracking-[0.3em] text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5"
        >
          <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5">
            <path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          下載完整 PDF
        </a>
        <p className="mt-3 text-xs tracking-widest text-muted">共 11 頁・約 3.4 MB</p>
      </main>
    </div>
  );
}
