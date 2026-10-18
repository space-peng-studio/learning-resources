import Image from "next/image";
import Sparkle from "@/components/Sparkle";

export const inputClass =
  "w-full rounded-full border border-ink/15 bg-white/80 px-5 py-3.5 text-sm tracking-wide text-ink outline-none transition placeholder:text-muted/70 focus:border-lavender focus:ring-2 focus:ring-lavender/30";

export const primaryButtonClass =
  "w-full rounded-full bg-ink py-3.5 text-sm tracking-[0.3em] text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0";

/** 登入、註冊、設定密碼共用的置中卡片 */
export default function AuthCard({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <Sparkle className="animate-twinkle absolute left-[12%] top-[18%] w-5 text-rose" />
      <Sparkle
        className="animate-twinkle absolute bottom-[22%] right-[12%] w-7 text-lavender"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative w-full max-w-sm rounded-[2rem] border border-white/70 bg-white/65 px-7 py-10 text-center shadow-[0_30px_80px_-40px_rgb(80_60_100/0.6)] backdrop-blur sm:px-10">
        <Image src="/logo.png" alt="豐盛健康愛" width={72} height={72} preload className="mx-auto size-16" />
        <p className="mt-4 text-xs tracking-[0.5em] text-gold">{kicker}</p>
        <h1 className="mt-3 font-serif text-2xl font-bold tracking-[0.2em] text-ink">{title}</h1>
        {subtitle && <p className="mt-3 text-sm leading-relaxed tracking-wider text-muted">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

export function FormMessage({ error, ok }: { error?: string; ok?: string }) {
  if (!error && !ok) return null;
  return (
    <p
      role={error ? "alert" : "status"}
      className={`rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed ${
        error ? "bg-[#b0573f]/10 text-[#9a4632]" : "bg-[#6f9a5b]/12 text-[#4f7a3f]"
      }`}
    >
      {error ?? ok}
    </p>
  );
}

export const LINE_URL = "https://line.me/R/ti/p/@104onvjd";
