"use client";

import { useState } from "react";
import { oracleMessages } from "@/lib/oracleMessages";
import { CardBack, CardFront, cardNumber } from "./OracleCard";
import { drawCard } from "./drawCard";

// 扇形展開的牌數與每張間隔角度
const FAN_SIZE = 7;
const FAN_STEP_DEG = 7;

// 選中的牌浮起、其他牌退下的時間
const PICK_MS = 650;
// 放大的牌背停留一下再翻開
const SETTLE_MS = 650;

type Phase = "fan" | "picking" | "drawing" | "revealed";

// 抽過的牌記在這台裝置；全部抽過一輪之前不會重複
const SEEN_KEY = "oracle-seen";

function readSeen(): number[] {
  try {
    const seen = JSON.parse(localStorage.getItem(SEEN_KEY) ?? "[]");
    return Array.isArray(seen) ? seen : [];
  } catch {
    return [];
  }
}

function pickCard(current: number | null) {
  const all = oracleMessages.map((_, i) => i);
  let seen = readSeen().filter((i) => i < all.length);
  if (seen.length >= all.length) seen = [];
  const pool = all.filter((i) => !seen.includes(i) && i !== current);
  const choice = (pool.length ? pool : all.filter((i) => i !== current))[
    Math.floor(Math.random() * (pool.length || all.length - 1))
  ];
  try {
    localStorage.setItem(SEEN_KEY, JSON.stringify([...seen, choice]));
  } catch {
    // 無法記錄時照樣抽，只是可能較快重複
  }
  return choice;
}

const cardShadow = "shadow-[0_18px_40px_-14px_rgb(80_60_100/0.45)]";

export default function OracleDraw() {
  const [phase, setPhase] = useState<Phase>("fan");
  const [card, setCard] = useState<number | null>(null);
  const [chosenSlot, setChosenSlot] = useState<number | null>(null);
  // 每次重抽換一個 key，讓牌陣重新發牌
  const [round, setRound] = useState(0);
  const [saving, setSaving] = useState(false);

  function pick(slot: number) {
    if (phase !== "fan") return;
    setChosenSlot(slot);
    setCard(pickCard(card));
    setPhase("picking");
    setTimeout(() => setPhase("drawing"), PICK_MS);
    setTimeout(() => setPhase("revealed"), PICK_MS + SETTLE_MS);
  }

  function redraw() {
    setChosenSlot(null);
    setRound((r) => r + 1);
    setPhase("fan");
  }

  async function save() {
    if (card === null || saving) return;
    setSaving(true);
    const filename = `豐盛指引-${cardNumber(card).replace(/\W/g, "")}.png`;
    try {
      const blob = await drawCard(oracleMessages[card], card);
      const file = new File([blob], filename, { type: blob.type });

      // 手機上用分享選單，才能直接「儲存影像」到相簿
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      if (isTouch && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      // 使用者自己關掉分享選單，不算錯誤
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error(err);
        alert("圖片沒有產生成功，請再試一次。");
      }
    } finally {
      setSaving(false);
    }
  }

  const message = {
    fan: "深呼吸，憑直覺選一張。",
    picking: "正在為你連結宇宙的頻率⋯",
    drawing: "正在為你連結宇宙的頻率⋯",
    revealed: "宇宙已接收你的頻率，這是專屬的指引",
  }[phase];

  const showFan = phase === "fan" || phase === "picking";
  const middle = (FAN_SIZE - 1) / 2;

  return (
    <div className="mt-4 flex w-full flex-col items-center">
      <p
        aria-live="polite"
        className={`min-h-[2em] max-w-md text-sm leading-relaxed tracking-widest sm:text-base ${
          phase === "revealed" ? "font-serif text-gold" : "text-muted"
        }`}
      >
        {message}
      </p>

      {/* 牌桌：扇形牌陣與放大單張共用同一塊區域，切換時不跳動 */}
      <div className="relative mt-4 h-[calc(min(78vw,340px)*1.25+3rem)] w-full">
        <div
          aria-hidden
          className={`animate-halo absolute left-1/2 h-[80%] transition-[top,opacity] duration-700 ${
            showFan ? "top-[35%]" : "top-1/2"
          } w-[min(90vw,560px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-rose/45 via-lavender/40 to-gold/25 blur-3xl ${
            phase === "revealed" ? "opacity-100" : "opacity-60"
          }`}
        />

        {/* 扇形牌陣 */}
        <div
          key={round}
          className={`fan absolute left-1/2 top-8 -translate-x-1/2 transition-opacity duration-500 ${
            showFan ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {Array.from({ length: FAN_SIZE }, (_, i) => {
            const state =
              chosenSlot === null ? "idle" : chosenSlot === i ? "chosen" : "away";
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={phase !== "fan"}
                aria-label={`選第 ${i + 1} 張牌`}
                data-state={state}
                className={`fan-card group cursor-pointer overflow-hidden rounded-xl disabled:cursor-default ${cardShadow}`}
                style={
                  {
                    "--angle": `${(i - middle) * FAN_STEP_DEG}deg`,
                    "--delay": `${i * 60}ms`,
                  } as React.CSSProperties
                }
              >
                <CardBack />
                <span className="absolute inset-0 rounded-xl ring-2 ring-gold/0 transition group-hover:ring-gold/60 group-focus-visible:ring-gold/80" />
              </button>
            );
          })}
        </div>

        {/* 選中後放大、翻開的單張牌 */}
        <div
          className="single-card absolute left-1/2 top-1/2 w-[min(78vw,340px)] -translate-x-1/2 -translate-y-1/2"
          data-show={!showFan}
        >
          <div className="flip-scene">
            <div
              className="flip-inner aspect-[4/5] w-full"
              data-flipped={phase === "revealed"}
            >
              <div className={`flip-face overflow-hidden rounded-2xl ${cardShadow}`}>
                <CardBack />
              </div>
              <div
                className={`flip-face flip-face-front overflow-hidden rounded-2xl ${cardShadow}`}
              >
                {card !== null && (
                  <CardFront message={oracleMessages[card]} index={card} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex min-h-14 flex-wrap items-center justify-center gap-3">
        {phase === "revealed" && (
          <>
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="rounded-full bg-ink px-8 py-3.5 tracking-[0.3em] text-white shadow-lg shadow-ink/20 transition hover:-translate-y-0.5 disabled:opacity-60"
            >
              {saving ? "儲存中⋯" : "存下來"}
            </button>
            <button
              type="button"
              onClick={redraw}
              className="rounded-full border border-ink/25 bg-white/50 px-8 py-3.5 tracking-[0.3em] text-ink backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/80"
            >
              再抽一次
            </button>
          </>
        )}
      </div>
    </div>
  );
}
