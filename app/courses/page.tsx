import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";
import Sparkle from "@/components/Sparkle";
import { nextSteps, quarterlySession, retake } from "@/lib/courses";
import CopyCode from "./CopyCode";

export const metadata: Metadata = {
  title: "更多學習｜豐盛健康愛",
  description: "金錢靈氣三階段課程是起點，豐盛是一輩子的練習。陪你走得更深、更穩的下一步。",
};

const svg = {
  "aria-hidden": true,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "size-6",
};

const icons = {
  habit: (
    <svg {...svg}>
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4M9 14.5l2 2 4-4" />
    </svg>
  ),
  person: (
    <svg {...svg}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </svg>
  ),
  moon: (
    <svg {...svg}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
    </svg>
  ),
  loop: (
    <svg {...svg}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.5M20 4v4.5h-4.5M20 12a8 8 0 0 1-13.7 5.6L4 15.5M4 20v-4.5h4.5" />
    </svg>
  ),
};

function ExternalLink({
  href,
  children,
  variant = "solid",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm tracking-[0.25em] transition hover:-translate-y-0.5 ${
        variant === "solid"
          ? "bg-ink text-white shadow-lg shadow-ink/15"
          : "border border-ink/25 bg-white/60 text-ink hover:bg-white"
      }`}
    >
      {children} <span aria-hidden>→</span>
    </a>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-4 font-serif text-lg tracking-[0.3em] text-ink sm:text-xl">
      {children}
      <span aria-hidden className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent" />
    </h2>
  );
}

export default function CoursesPage() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <SiteHeader />

      <Sparkle className="animate-twinkle absolute left-[6%] top-[22%] w-5 text-rose" />
      <Sparkle
        className="animate-twinkle absolute right-[9%] top-[12%] w-6 text-lavender"
        style={{ animationDelay: "1.2s" }}
      />

      <main className="relative mx-auto w-full max-w-5xl flex-1 px-4 pb-20 pt-6 sm:px-8 sm:pt-10">
        <div className="text-center">
          <p className="flex items-center justify-center gap-4 text-xs tracking-[0.5em] text-gold sm:text-sm">
            <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
            更多學習
            <span aria-hidden className="h-px w-10 bg-gold/50 sm:w-16" />
          </p>
          <h1 className="mt-5 font-serif text-3xl font-bold leading-snug tracking-wider text-ink sm:text-5xl sm:leading-tight">
            陪你走得
            <span className="text-aura">更深、更穩</span>
            <br />
            的下一步
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed tracking-widest text-muted sm:text-base">
            金錢靈氣三階段課程是起點，豐盛是一輩子的練習。
            <br />
            這裡整理了接下來可以陪伴你的每一條路。
          </p>
        </div>

        {/* 你的下一步 */}
        <section className="mt-16">
          <SectionTitle>你的下一步</SectionTitle>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {nextSteps.map((c) => (
              <article
                key={c.title}
                className="flex flex-col rounded-3xl border border-white/70 bg-white/60 p-7 shadow-[0_20px_50px_-30px_rgb(80_60_100/0.45)] backdrop-blur sm:p-8"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose/25 to-lavender/30 text-[#6a5a8c]">
                  {icons[c.icon]}
                </div>
                <p className="mt-5 text-xs tracking-[0.3em] text-gold">{c.tag}</p>
                <h3 className="mt-2 font-serif text-2xl font-bold tracking-wider text-ink">{c.title}</h3>
                <p className="mt-4 flex-1 text-[15px] leading-loose tracking-wide text-ink/75">{c.body}</p>
                <p className="mt-5 rounded-2xl bg-cream/80 px-4 py-3 text-sm leading-relaxed tracking-wide text-muted">
                  <span className="mr-2 text-gold">適合</span>
                  {c.fit}
                </p>
                <div className="mt-6">
                  <ExternalLink href={c.href}>{c.cta}</ExternalLink>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 每季回來充電 */}
        <section className="mt-16">
          <SectionTitle>每季回來充電</SectionTitle>
          <article className="mt-6 overflow-hidden rounded-3xl border border-white/70 bg-gradient-to-br from-[#f6e6ea]/80 via-white/60 to-[#e6e2f3]/80 shadow-[0_20px_50px_-30px_rgb(80_60_100/0.45)] backdrop-blur">
            <div className="grid gap-8 p-7 sm:p-10 md:grid-cols-[1.4fr_1fr] md:items-center">
              <div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-white/70 text-[#6a5a8c]">
                  {icons.moon}
                </div>
                <p className="mt-5 text-xs tracking-[0.3em] text-gold">{quarterlySession.tag}</p>
                <h3 className="mt-2 font-serif text-2xl font-bold tracking-wider text-ink">
                  {quarterlySession.title}
                </h3>
                <p className="mt-4 text-[15px] leading-loose tracking-wide text-ink/75">{quarterlySession.body}</p>
              </div>

              <div className="rounded-2xl bg-white/70 p-6 text-center">
                <p className="text-xs tracking-[0.4em] text-gold">本季場次</p>
                <p className="mt-2 font-serif text-lg tracking-widest text-ink">{quarterlySession.season}</p>
                <p className="mt-1 font-serif text-2xl font-bold tracking-wider text-ink">{quarterlySession.date}</p>

                <div className="mt-5 border-t border-ink/10 pt-5">
                  <p className="text-sm leading-relaxed tracking-wide text-muted">
                    學員輸入折扣碼即可<span className="text-ink">免費報名</span>
                  </p>
                  <div className="mt-3">
                    <CopyCode code={quarterlySession.couponCode} />
                  </div>
                </div>

                <div className="mt-6">
                  <ExternalLink href={quarterlySession.href}>{quarterlySession.cta}</ExternalLink>
                </div>
              </div>
            </div>
          </article>
        </section>

        {/* 回到起點，再走一次 */}
        <section className="mt-16">
          <SectionTitle>回到起點，再走一次</SectionTitle>
          <article className="mt-6 flex flex-col gap-6 rounded-3xl border border-gold/25 bg-white/40 p-7 backdrop-blur sm:p-8 md:flex-row md:items-center">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold">
              {icons.loop}
            </div>
            <div className="flex-1">
              <h3 className="font-serif text-xl font-bold tracking-wider text-ink">{retake.title}</h3>
              <p className="mt-2 text-[15px] leading-loose tracking-wide text-ink/75">{retake.body}</p>
            </div>
            <div className="shrink-0">
              <ExternalLink href={retake.href} variant="outline">
                {retake.cta}
              </ExternalLink>
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}
