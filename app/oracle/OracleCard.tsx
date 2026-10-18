import Image from "next/image";
import Sparkle from "@/components/Sparkle";
import type { OracleMessage } from "@/lib/oracleMessages";

// 牌卡以 4:5 比例排版，字級用容器寬度（cqw）計算，卡片放多大字就跟著縮放。
// 下載圖片（drawCard.ts）照同一份版面畫出來，兩邊修改時要一起調整。

export const cardNumber = (index: number) => `No. ${String(index + 1).padStart(2, "0")}`;

export function CardFront({ message, index }: { message: OracleMessage; index: number }) {
  return (
    <div className="@container relative size-full overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#fbf6f1_0%,#f6e7ec_55%,#e9e5f4_100%)] text-center">
      <div aria-hidden className="absolute inset-[3.5%] rounded-xl border border-gold/50" />
      <div className="relative flex size-full flex-col items-center px-[11%] pb-[9%] pt-[10%]">
        <p className="text-[3.4cqw] tracking-[0.4em] text-gold">今日豐盛指引</p>
        <p className="mt-[1.5%] font-serif text-[3cqw] tracking-[0.2em] text-muted">{cardNumber(index)}</p>

        <Sparkle className="mt-[7%] w-[5cqw] text-gold" />
        <p className="text-aura mt-[2%] font-serif text-[13cqw] font-bold leading-tight tracking-[0.15em]">
          {message.keyword}
        </p>
        <span aria-hidden className="mt-[4%] h-px w-[18%] bg-gold/50" />

        <p className="mt-[6%] flex-1 text-balance font-serif text-[5.2cqw] leading-[1.75] tracking-wider text-ink/85">
          {message.message}
        </p>

        <div className="w-full rounded-[3cqw] bg-white/65 px-[6%] py-[4%]">
          <p className="text-[3cqw] tracking-[0.35em] text-gold">今天試試</p>
          <p className="mt-[1.5%] text-balance text-[4.2cqw] leading-relaxed tracking-wide text-ink/80">{message.action}</p>
        </div>
        <p className="mt-[5%] text-[2.8cqw] tracking-[0.4em] text-muted">豐盛健康愛</p>
      </div>
    </div>
  );
}

export function CardBack() {
  return (
    <div className="@container relative size-full overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#dcb9c4_0%,#b9aed5_55%,#a7b3d8_100%)]">
      <div aria-hidden className="absolute inset-[3.5%] rounded-xl border border-white/60" />
      <div aria-hidden className="absolute inset-[6%] rounded-lg border border-white/25" />
      <Sparkle className="absolute left-[16%] top-[14%] w-[5cqw] text-white/70" />
      <Sparkle className="absolute right-[18%] top-[22%] w-[3cqw] text-white/60" />
      <Sparkle className="absolute bottom-[18%] left-[22%] w-[3.5cqw] text-white/60" />
      <Sparkle className="absolute bottom-[13%] right-[15%] w-[5.5cqw] text-white/70" />
      <div className="relative flex size-full flex-col items-center justify-center">
        <span className="flex size-[34cqw] items-center justify-center rounded-full bg-white/85 shadow-[0_0_40px_rgb(255_255_255/0.6)]">
          <Image src="/logo.png" alt="" width={160} height={160} className="size-[24cqw]" />
        </span>
        <p className="mt-[8%] font-serif text-[6.5cqw] font-bold tracking-[0.5em] text-white">豐盛指引</p>
        <p className="mt-[2%] text-[3cqw] tracking-[0.4em] text-white/80">豐盛健康愛</p>
      </div>
    </div>
  );
}
