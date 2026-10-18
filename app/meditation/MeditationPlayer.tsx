"use client";

import { useRef, useState } from "react";
import Sparkle from "@/components/Sparkle";

type State = "ready" | "playing" | "ended";

export default function MeditationPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<State>("ready");

  function play() {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    video.play();
  }

  return (
    <div className="relative w-[min(80vw,340px)] shrink-0">
      <div
        aria-hidden
        className="animate-halo absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-rose/45 via-lavender/40 to-gold/30 blur-3xl"
      />

      <div className="relative aspect-[9/16] overflow-hidden rounded-3xl bg-ink shadow-[0_24px_60px_-18px_rgb(60_45_90/0.55)]">
        <video
          ref={videoRef}
          src="/meditation/meditation.mp4"
          poster="/meditation/poster.jpg"
          preload="metadata"
          playsInline
          controls={state === "playing"}
          onPlay={() => setState("playing")}
          onEnded={() => setState("ended")}
          className="size-full object-cover"
        />

        {state === "ready" && (
          <button
            type="button"
            onClick={play}
            aria-label="開始冥想"
            className="group absolute inset-0 flex flex-col items-center justify-end gap-3 bg-gradient-to-t from-ink/45 via-transparent to-transparent pb-[32%] text-white"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-white/90 text-ink shadow-xl transition group-hover:scale-105">
              <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="ml-1 size-7">
                <path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5Z" />
              </svg>
            </span>
            <span className="rounded-full bg-ink/60 px-4 py-1.5 text-sm tracking-[0.4em] backdrop-blur-sm">開始冥想</span>
          </button>
        )}

        {state === "ended" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-cream/90 px-6 text-center backdrop-blur-sm">
            <Sparkle className="animate-twinkle w-7 text-gold" />
            <p className="font-serif text-2xl tracking-widest text-ink">練習完成了</p>
            <p className="text-sm leading-relaxed tracking-wider text-muted">
              謝謝你，今天願意
              <br />
              陪伴自己三分鐘。
            </p>
            <button
              type="button"
              onClick={play}
              className="mt-3 rounded-full border border-ink/25 bg-white/60 px-7 py-3 text-sm tracking-[0.3em] text-ink transition hover:-translate-y-0.5 hover:bg-white"
            >
              再聽一次
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
