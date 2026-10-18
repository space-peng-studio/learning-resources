"use client";

import { useEffect, useState } from "react";
import {
  CARD_H,
  GOLD,
  MUTED,
  auraFill,
  createCard,
  loadCardFonts,
  shareOrDownload,
  sparkle,
  spaced,
  toPng,
  wrap,
} from "@/lib/cardCanvas";

// 分享修行紀錄的圖卡：名字＋天數，不放練習內容（保護隱私）。
// 按「分享」直接開啟手機的分享選單，要分享到哪裡由學員自己決定。

const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
const QUOTE = "每一次練習，都替豐盛多存了一點。";

type Props = { name: string; checkedIn: boolean; totalDays: number; monthDays: number; today: string };

async function drawShareCard({ name, checkedIn, totalDays, monthDays, today }: Props) {
  const [y, m, d] = today.split("-").map(Number);
  const weekday = WEEKDAYS[new Date(y, m - 1, d).getDay()];
  const title = checkedIn ? "今日修行完成" : "我的修行紀錄";
  const dateLine = `${m} 月 ${d} 日・星期${weekday}`;
  const { serif, sans } = await loadCardFonts(
    `${name}${title}${dateLine}累積修行本月天${totalDays}${monthDays}${QUOTE}豐盛健康愛`,
  );
  const { canvas, ctx, cx } = createCard();

  ctx.fillStyle = GOLD;
  ctx.font = `400 40px ${sans}`;
  spaced(ctx, title, cx, 180, 16);
  sparkle(ctx, cx, 250, 46);

  // 名字：太長時縮小字級，維持一行
  let nameSize = 64;
  do {
    ctx.font = `700 ${nameSize}px ${serif}`;
  } while (ctx.measureText(name).width + 6 * (name.length - 1) > 820 && (nameSize -= 4) > 32);
  ctx.fillStyle = "rgb(34 31 42 / 0.88)";
  spaced(ctx, name, cx, 355, 6);

  ctx.fillStyle = MUTED;
  ctx.font = `400 34px ${serif}`;
  spaced(ctx, dateLine, cx, 425, 4);

  // 累積天數：大數字（漸層）＋「天」
  ctx.fillStyle = GOLD;
  ctx.font = `400 40px ${sans}`;
  spaced(ctx, "累積修行", cx, 560, 14);
  ctx.font = `700 240px ${serif}`;
  const num = String(totalDays);
  const numW = ctx.measureText(num).width;
  ctx.font = `700 72px ${serif}`;
  const unitW = ctx.measureText("天").width;
  const gap = 20;
  const left = cx - (numW + gap + unitW) / 2;
  ctx.textAlign = "left";
  ctx.font = `700 240px ${serif}`;
  ctx.fillStyle = auraFill(ctx, left + numW / 2, numW);
  ctx.fillText(num, left, 810);
  ctx.font = `700 72px ${serif}`;
  ctx.fillStyle = "rgb(34 31 42 / 0.8)";
  ctx.fillText("天", left + numW + gap, 810);
  ctx.textAlign = "center";

  ctx.fillStyle = MUTED;
  ctx.font = `400 40px ${sans}`;
  spaced(ctx, `本月修行 ${monthDays} 天`, cx, 905, 6);

  ctx.fillStyle = "rgb(179 148 104 / 0.5)";
  ctx.fillRect(cx - 76, 980, 152, 2);

  ctx.fillStyle = "rgb(34 31 42 / 0.85)";
  ctx.font = `400 50px ${serif}`;
  wrap(ctx, QUOTE, 760).forEach((line, i) => ctx.fillText(line, cx, 1085 + i * 84));

  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${sans}`;
  spaced(ctx, "豐盛健康愛", cx, CARD_H - 110, 12);

  return toPng(canvas);
}

export default function ShareCheckIn(props: Props) {
  const { name, checkedIn, totalDays, monthDays, today } = props;
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [preview, setPreview] = useState(false);

  // 事先畫好圖卡：手機的分享選單必須在點擊當下立刻開啟，不能等畫圖
  useEffect(() => {
    let url = "";
    let cancelled = false;
    drawShareCard({ name, checkedIn, totalDays, monthDays, today })
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ blob, url });
      })
      .catch((err) => console.error(err));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [name, checkedIn, totalDays, monthDays, today]);

  const filename = `修行紀錄-${today}.png`;
  const text = `我已經累積修行 ${totalDays} 天 ✦ 豐盛健康愛`;

  async function share() {
    if (!image) return;
    const file = new File([image.blob], filename, { type: "image/png" });
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], text: `${text} ${window.location.origin}` });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        console.error(err);
      }
    }
    // 電腦或不支援分享選單的瀏覽器（例如部分 LINE 內建瀏覽器）：改顯示圖卡讓學員儲存
    setPreview(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={share}
        disabled={!image}
        className="mt-5 rounded-full border border-gold/40 bg-white/70 px-6 py-2.5 text-sm tracking-[0.2em] text-gold transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-50"
      >
        ✦ 分享我的修行
      </button>

      {preview && image && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="分享我的修行"
          onClick={() => setPreview(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-[2rem] bg-cream p-5 text-center shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setPreview(false)}
              aria-label="關閉"
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-xl text-muted hover:bg-ink/5"
            >
              ×
            </button>
            <p className="font-serif text-lg font-bold tracking-widest text-ink">分享我的修行</p>
            <div className="mx-auto mt-4 aspect-[4/5] w-[min(70vw,280px)] overflow-hidden rounded-2xl shadow-lg">
              {/* 一般 <img>：手機上可以直接長按儲存 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={`${name}累積修行 ${totalDays} 天的分享圖卡`} className="size-full object-cover" />
            </div>
            <p className="mt-3 text-xs tracking-wide text-muted">長按圖片儲存，再分享到你想分享的地方</p>
            <button
              type="button"
              onClick={() => shareOrDownload(image.blob, filename).catch((err) => console.error(err))}
              className="mt-4 w-full rounded-full bg-ink py-3.5 text-sm tracking-[0.25em] text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5"
            >
              存圖片
            </button>
          </div>
        </div>
      )}
    </>
  );
}
