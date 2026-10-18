"use client";

import { useEffect, useState } from "react";
import { dimensionLabel, type Dimension, type Scores } from "@/lib/moneyMap";

// 金錢能量儀表板：沿用《學習地圖》測驗網站的深色雷達圖設計，改用 SVG 繪製。
// 上：情緒、右：信念、下：行為、左：資產

const AXES: Dimension[] = ["emotion", "belief", "action", "asset"];
const SIZE = 400;
const C = SIZE / 2;
const R = 140;

function point(i: number, score: number) {
  const angle = -Math.PI / 2 + (i * Math.PI) / 2;
  const r = (R / 6) * score;
  return [C + r * Math.cos(angle), C + r * Math.sin(angle)] as const;
}
const toPoints = (scores: Scores) => AXES.map((d, i) => point(i, scores[d]).join(",")).join(" ");
const toPath = (scores: Scores) => `M${AXES.map((d, i) => point(i, scores[d]).join(",")).join("L")}Z`;

/** 數字從 0 跳到目標值 */
function useCountUp(target: number, ms = 1400) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    // 減少動態效果時直接顯示最終數字
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : ms;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = duration ? Math.min((now - start) / duration, 1) : 1;
      setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, ms]);
  return value;
}

function Chip({ dim, score }: { dim: Dimension; score: number }) {
  const shown = useCountUp(score);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-lavender/50">
      <div className="flex items-baseline justify-between">
        <span className="text-xs tracking-[0.2em] text-white/60">{dimensionLabel[dim]}</span>
        <span>
          <b className="font-serif text-3xl font-normal text-white">{shown}</b>
          <span className="text-[11px] text-white/40"> / 6</span>
        </span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/8">
        <i
          className="dash-bar block h-full rounded-full bg-gradient-to-r from-rose via-lavender to-[#8fa2cb]"
          style={{ width: `${(score / 6) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function EnergyDashboard({ scores, previous }: { scores: Scores; previous?: Scores }) {
  const path = toPath(scores);
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-ink px-4 py-8 text-white shadow-[0_40px_80px_-40px_rgb(34_31_42/0.8)] sm:px-8 sm:py-10">
      <div aria-hidden className="dash-glow pointer-events-none absolute -inset-[20%]" />

      <div className="relative text-center">
        <p className="inline-flex items-center gap-3 text-[11px] tracking-[0.4em] text-gold">
          <span className="h-px w-8 bg-gold/50" />
          能量解析
          <span className="h-px w-8 bg-gold/50" />
        </p>
        <h3 className="mt-2 font-serif text-xl font-bold tracking-[0.15em] sm:text-2xl">金錢能量儀表板</h3>
      </div>

      <div className="relative mx-auto mt-4 aspect-square w-full max-w-[440px]">
        <div aria-hidden className="dash-ring absolute inset-[4%] rounded-full border border-dashed border-gold/35" />
        <div aria-hidden className="dash-ring-reverse absolute inset-[11%] rounded-full border border-white/6 shadow-[inset_0_0_60px_rgb(187_165_198/0.15)]" />

        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`金錢能量：${AXES.map((d) => `${dimensionLabel[d]} ${scores[d]} 分`).join("、")}`}
          className="relative size-full overflow-visible"
        >
          <defs>
            <radialGradient id="energy-fill">
              <stop offset="0%" stopColor="rgb(233 183 186 / 0.55)" />
              <stop offset="60%" stopColor="rgb(187 165 198 / 0.4)" />
              <stop offset="100%" stopColor="rgb(143 162 203 / 0.3)" />
            </radialGradient>
            <linearGradient id="energy-stroke" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f3c9cb" />
              <stop offset="50%" stopColor="#cdb8d8" />
              <stop offset="100%" stopColor="#a9bbe0" />
            </linearGradient>
            <filter id="energy-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* 格線：外圈金色，內圈淡白 */}
          {[1, 2, 3, 4, 5, 6].map((l) => (
            <polygon
              key={l}
              points={AXES.map((_, i) => point(i, l).join(",")).join(" ")}
              fill="none"
              stroke={l === 6 ? "rgb(184 154 104 / 0.55)" : "rgb(255 255 255 / 0.09)"}
              strokeWidth={l === 6 ? 1.2 : 1}
            />
          ))}
          {AXES.map((_, i) => {
            const [x, y] = point(i, 6);
            return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="rgb(255 255 255 / 0.12)" />;
          })}

          {/* 上一次的結果（虛線） */}
          {previous && (
            <polygon
              points={toPoints(previous)}
              fill="none"
              stroke="rgb(255 255 255 / 0.45)"
              strokeWidth={1.5}
              strokeDasharray="5 5"
            />
          )}

          {/* 這一次的能量形狀：從中心長出來 */}
          <g className="dash-grow">
            <polygon
              points={toPoints(scores)}
              fill="url(#energy-fill)"
              stroke="url(#energy-stroke)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              filter="url(#energy-glow)"
            />
            {/* 沿著邊緣流動的光點 */}
            {[0, 1.6].map((begin) => (
              <circle key={begin} className="dash-flow" r={5} fill="white" opacity={0.9} filter="url(#energy-glow)">
                <animateMotion dur="3.2s" begin={`${begin}s`} repeatCount="indefinite" path={path} />
              </circle>
            ))}
            {AXES.map((d, i) => {
              const [x, y] = point(i, scores[d]);
              return (
                <g key={d}>
                  <title>{`${dimensionLabel[d]} ${scores[d]} 分`}</title>
                  <circle className="dash-pulse" cx={x} cy={y} r={9} fill="rgb(233 183 186 / 0.35)" />
                  <circle cx={x} cy={y} r={5} fill="#fff" filter="url(#energy-glow)" />
                  {/* 比圓點大的感應範圍，方便滑鼠移上去看分數 */}
                  <circle cx={x} cy={y} r={16} fill="transparent" />
                </g>
              );
            })}
          </g>

          {/* 軸標籤與分數 */}
          {AXES.map((d, i) => {
            const [x, y] = point(i, 7.35);
            return (
              <text key={d} x={x} y={y} textAnchor="middle">
                <tspan x={x} dy="-0.35em" className="fill-white/85 font-serif text-[16px] font-bold">
                  {dimensionLabel[d]}
                </tspan>
                <tspan x={x} dy="1.35em" className="fill-gold text-[13px]">
                  {scores[d]} 級
                </tspan>
              </text>
            );
          })}
        </svg>
      </div>

      {previous && (
        <p className="relative -mt-1 mb-3 flex items-center justify-center gap-2 text-xs tracking-wider text-white/55">
          <svg aria-hidden width="22" height="6">
            <line x1="0" y1="3" x2="22" y2="3" stroke="rgb(255 255 255 / 0.55)" strokeWidth="1.5" strokeDasharray="5 5" />
          </svg>
          虛線是上一次的你
        </p>
      )}

      <div className="relative mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {AXES.map((d) => (
          <Chip key={d} dim={d} score={scores[d]} />
        ))}
      </div>
    </section>
  );
}
