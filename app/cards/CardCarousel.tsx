"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type Slide = { src: string; alt: string };

const SLIDE_WIDTH = "min(70vw,340px)";

const arrowBtn =
  "flex size-11 items-center justify-center rounded-full border border-ink/15 bg-white/70 text-ink shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-30";

function Arrow({ dir }: { dir: "left" | "right" }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5">
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CardCarousel({ slides }: { slides: Slide[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState<number | null>(null);
  const last = slides.length - 1;

  function scrollToSlide(i: number) {
    const track = trackRef.current;
    const idx = Math.max(0, Math.min(last, i));
    const el = track?.children[idx] as HTMLElement | undefined;
    if (!track || !el) return;
    track.scrollTo({
      left: el.offsetLeft - (track.clientWidth - el.clientWidth) / 2,
      behavior: "smooth",
    });
  }

  // 找出最靠近中間的那張，當作目前這張
  function onScroll() {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const track = trackRef.current;
      if (!track) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let best = 0;
      let bestDist = Infinity;
      Array.from(track.children).forEach((child, i) => {
        const el = child as HTMLElement;
        const dist = Math.abs(el.offsetLeft + el.clientWidth / 2 - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive(best);
    });
  }

  function zoomTo(i: number) {
    const idx = Math.max(0, Math.min(last, i));
    setZoomed(idx);
    scrollToSlide(idx);
  }

  // 放大檢視時：鎖住背景捲動，支援 Esc 與左右鍵
  useEffect(() => {
    if (zoomed === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoomed(null);
      if (e.key === "ArrowLeft" && zoomed! > 0) zoomTo(zoomed! - 1);
      if (e.key === "ArrowRight" && zoomed! < last) zoomTo(zoomed! + 1);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  });

  const label = (i: number) => (i === 0 ? "封面" : `第 ${i} 張・共 ${last} 張`);

  return (
    <div className="mt-8 w-full">
      <div className="relative">
        <div
          ref={trackRef}
          onScroll={onScroll}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") {
              e.preventDefault();
              scrollToSlide(active - 1);
            }
            if (e.key === "ArrowRight") {
              e.preventDefault();
              scrollToSlide(active + 1);
            }
          }}
          tabIndex={0}
          aria-label="轉念小卡，可左右滑動"
          className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto py-6 outline-none [scrollbar-width:none] sm:gap-6 [&::-webkit-scrollbar]:hidden"
          style={{ paddingInline: `calc(50% - ${SLIDE_WIDTH} / 2)` }}
        >
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => (i === active ? setZoomed(i) : scrollToSlide(i))}
              aria-label={i === active ? `放大檢視${label(i)}` : `前往${label(i)}`}
              className={`relative aspect-[4/5] shrink-0 snap-center overflow-hidden rounded-2xl shadow-[0_18px_40px_-14px_rgb(80_60_100/0.45)] transition duration-500 ${
                i === active ? "scale-100 cursor-zoom-in opacity-100" : "scale-90 opacity-55"
              }`}
              style={{ width: SLIDE_WIDTH }}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                sizes="(max-width: 485px) 70vw, 340px"
                preload={i === 0}
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 mx-auto hidden max-w-4xl items-center justify-between px-6 sm:flex">
          <button
            type="button"
            onClick={() => scrollToSlide(active - 1)}
            disabled={active === 0}
            aria-label="上一張"
            className={`pointer-events-auto ${arrowBtn}`}
          >
            <Arrow dir="left" />
          </button>
          <button
            type="button"
            onClick={() => scrollToSlide(active + 1)}
            disabled={active === last}
            aria-label="下一張"
            className={`pointer-events-auto ${arrowBtn}`}
          >
            <Arrow dir="right" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex justify-center gap-2" role="tablist" aria-label="選擇小卡">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-label={label(i)}
            onClick={() => scrollToSlide(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === active ? "w-6 bg-gold" : "w-2 bg-ink/15 hover:bg-ink/30"
            }`}
          />
        ))}
      </div>
      <p aria-live="polite" className="mt-3 text-sm tracking-widest text-muted">
        {label(active)}
        <span className="ml-2 text-xs text-muted/70">・點卡片可放大</span>
      </p>

      {zoomed !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label(zoomed)}
          onClick={() => setZoomed(null)}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-ink/80 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setZoomed(null)}
            aria-label="關閉"
            className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-white/15 text-2xl text-white transition hover:bg-white/25"
          >
            ×
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative aspect-[4/5] overflow-hidden rounded-2xl shadow-2xl"
            style={{ width: "min(92vw, calc(80svh * 0.8))" }}
          >
            <Image
              src={slides[zoomed].src}
              alt={slides[zoomed].alt}
              fill
              sizes="(max-width: 640px) 92vw, 720px"
              className="object-cover"
            />
          </div>
          <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-6 text-white">
            <button
              type="button"
              onClick={() => zoomTo(zoomed - 1)}
              disabled={zoomed === 0}
              aria-label="上一張"
              className="flex size-11 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 disabled:opacity-30"
            >
              <Arrow dir="left" />
            </button>
            <span className="min-w-28 text-sm tracking-widest">{label(zoomed)}</span>
            <button
              type="button"
              onClick={() => zoomTo(zoomed + 1)}
              disabled={zoomed === last}
              aria-label="下一張"
              className="flex size-11 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25 disabled:opacity-30"
            >
              <Arrow dir="right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
