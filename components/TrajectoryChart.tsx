"use client";

import { useEffect, useRef, useState } from "react";
import type { Dimension } from "@/lib/moneyMap";
import { dimensionLabel } from "@/lib/moneyMap";
import { shortDay, type QuizRecord } from "@/lib/quizHistory";

// 圖的寬度跟著容器走（不是整張縮放），手機上文字和記號才不會縮到看不清楚
const DEFAULT_W = 640;
const H = 260;
const PAD = { top: 20, right: 28, bottom: 36, left: 44 };

type Shape = "circle" | "triangle" | "square" | "cross";

// 記號沿用修行地圖：● 情緒 ▲ 信念 ■ 行為 ✕ 資產；
// offset 讓同分的四個點左右錯開，不會疊成一個
const SERIES: { key: Dimension; color: string; shape: Shape; offset: number; dash?: string }[] = [
  { key: "emotion", color: "#d58e9e", shape: "circle", offset: -9 },
  { key: "belief", color: "#8f84c2", shape: "triangle", offset: -3 },
  { key: "action", color: "#b39468", shape: "square", offset: 3 },
  { key: "asset", color: "#8fa2cb", shape: "cross", offset: 9, dash: "5 4" },
];

function Marker({ shape, x, y, color }: { shape: Shape; x: number; y: number; color: string }) {
  const s = 5;
  switch (shape) {
    case "circle":
      return <circle cx={x} cy={y} r={s} fill={color} stroke="#fff" strokeWidth={1.5} />;
    case "triangle":
      return (
        <polygon
          points={`${x},${y - s - 1} ${x + s + 1},${y + s} ${x - s - 1},${y + s}`}
          fill={color}
          stroke="#fff"
          strokeWidth={1.5}
        />
      );
    case "square":
      return <rect x={x - s} y={y - s} width={s * 2} height={s * 2} fill={color} stroke="#fff" strokeWidth={1.5} />;
    case "cross":
      return (
        <path
          d={`M${x - s},${y - s}L${x + s},${y + s}M${x + s},${y - s}L${x - s},${y + s}`}
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      );
  }
}

/** 成長軌跡：最近 12 筆紀錄（每筆 30 天），四條折線 */
export default function TrajectoryChart({ records }: { records: QuizRecord[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(DEFAULT_W);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setW(Math.round(entry.contentRect.width)));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const data = records.slice(-12);
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) =>
    PAD.left + (data.length === 1 ? innerW / 2 : (innerW / (data.length - 1)) * i);
  const y = (score: number) => PAD.top + innerH - ((score - 1) / 5) * innerH;
  // 手機上月份太擠時，月份標籤隔一個顯示一次（最後一個月一定顯示）
  const labelEvery = data.length > 1 && innerW / (data.length - 1) < 36 ? 2 : 1;
  const showLabel = (i: number) => i === data.length - 1 || (data.length - 1 - i) % labelEvery === 0;

  return (
    <div ref={ref}>
      <ul className="mb-3 flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs tracking-widest text-muted">
        {SERIES.map((s) => (
          <li key={s.key} className="flex items-center gap-2">
            <svg aria-hidden width="26" height="12">
              <line x1="0" y1="6" x2="26" y2="6" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} />
              <Marker shape={s.shape} x={13} y={6} color={s.color} />
            </svg>
            {dimensionLabel[s.key]}
          </li>
        ))}
      </ul>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="每月四維分數的成長軌跡" className="w-full">
        {[1, 2, 3, 4, 5, 6].map((s) => (
          <g key={s}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(s)} y2={y(s)} stroke="rgb(34 31 42 / 0.07)" />
            <text x={PAD.left - 20} y={y(s)} textAnchor="end" dominantBaseline="middle" className="fill-muted text-[12px]">
              {s}
            </text>
          </g>
        ))}
        {data.map((r, i) => showLabel(i) && (
          <text key={r.takenAt} x={x(i)} y={H - 12} textAnchor="middle" className="fill-muted text-[12px]">
            {shortDay(r.startDay)}
          </text>
        ))}
        {SERIES.map((s) => (
          <g key={s.key}>
            {data.length > 1 && (
              <polyline
                points={data.map((r, i) => `${x(i) + s.offset},${y(r.scores[s.key])}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dash}
                strokeLinejoin="round"
                opacity={0.85}
              />
            )}
            {data.map((r, i) => (
              <Marker key={r.takenAt} shape={s.shape} x={x(i) + s.offset} y={y(r.scores[s.key])} color={s.color} />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
