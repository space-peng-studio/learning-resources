import type { OracleMessage } from "@/lib/oracleMessages";
import { cardNumber } from "./OracleCard";

// 把牌卡畫成 1080×1350 的 PNG，給「存下來」用。版面對照 OracleCard.tsx 的 CardFront。

const W = 1080;
const H = 1350;
const PAD_X = 119;
const GOLD = "#b39468";
const MUTED = "#6e6873";

// 不放在行首的標點
const NO_LINE_START = "，。、！？；：」』）…";

function wrapGreedy(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  let line = "";
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxWidth && line && !NO_LINE_START.includes(ch)) {
      lines.push(line);
      line = ch;
    } else {
      line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// 行數不變的前提下把寬度縮到最小，讓每行長度平均，避免最後一行只剩一兩個字
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines = wrapGreedy(ctx, text, maxWidth);
  let width = maxWidth;
  while (width > maxWidth / 2 && wrapGreedy(ctx, text, width - 8).length === lines.length) width -= 8;
  return wrapGreedy(ctx, text, width);
}

// 逐字畫出加大字距的置中文字（canvas 的 letterSpacing 不是每個瀏覽器都支援）
function spaced(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = "center";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function sparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  ctx.fill(new Path2D("M12 0C12.6 7 17 11.4 24 12C17 12.6 12.6 17 12 24C11.4 17 7 12.6 0 12C7 11.4 11.4 7 12 0Z"));
  ctx.restore();
}

export async function drawCard(message: OracleMessage, index: number): Promise<Blob> {
  const css = getComputedStyle(document.documentElement);
  const serif = `${css.getPropertyValue("--font-noto-serif-tc").trim() || "serif"}, serif`;
  const sans = `${css.getPropertyValue("--font-noto-sans-tc").trim() || "sans-serif"}, sans-serif`;
  const allText = `今日豐盛指引豐盛健康愛今天試試${cardNumber(index)}${message.keyword}${message.message}${message.action}`;
  // 中文字型是依需要載入的，畫之前先確保用到的字都載好
  await Promise.all([
    document.fonts.load(`700 140px ${serif}`, allText),
    document.fonts.load(`400 56px ${serif}`, allText),
    document.fonts.load(`400 45px ${sans}`, allText),
  ]).catch(() => {});

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // 背景與金色細框
  const bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
  bg.addColorStop(0, "#fbf6f1");
  bg.addColorStop(0.55, "#f6e7ec");
  bg.addColorStop(1, "#e9e5f4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "rgb(179 148 104 / 0.5)";
  ctx.lineWidth = 2;
  roundRect(ctx, 38, 47, W - 76, H - 94, 28);
  ctx.stroke();

  const cx = W / 2;

  // 標題與編號
  ctx.fillStyle = GOLD;
  ctx.font = `400 37px ${sans}`;
  spaced(ctx, "今日豐盛指引", cx, 150, 15);
  ctx.fillStyle = MUTED;
  ctx.font = `400 32px ${serif}`;
  spaced(ctx, cardNumber(index), cx, 205, 6);

  // 星星與關鍵詞（漸層字）
  ctx.fillStyle = GOLD;
  sparkle(ctx, cx, 275, 54);
  ctx.font = `700 140px ${serif}`;
  const kwWidth = ctx.measureText(message.keyword).width + 21 * (message.keyword.length - 1);
  const kwGrad = ctx.createLinearGradient(cx - kwWidth / 2, 0, cx + kwWidth / 2, 0);
  kwGrad.addColorStop(0, "#d9a7b3");
  kwGrad.addColorStop(0.6, "#b8a3cf");
  kwGrad.addColorStop(1, "#9fa6cf");
  ctx.fillStyle = kwGrad;
  spaced(ctx, message.keyword, cx, 450, 21);

  // 分隔線
  ctx.fillStyle = "rgb(179 148 104 / 0.5)";
  ctx.fillRect(cx - 76, 505, 152, 2);

  // 指引內容
  ctx.fillStyle = "rgb(34 31 42 / 0.85)";
  // 內容較長時縮小字級，維持在三行內
  let size = 56;
  let lines: string[];
  do {
    ctx.font = `400 ${size}px ${serif}`;
    lines = wrap(ctx, message.message, W - PAD_X * 2);
  } while (lines.length > 3 && (size -= 4) >= 40);
  lines.forEach((line, i) => ctx.fillText(line, cx, 615 + i * size * 1.75));

  // 今天試試
  ctx.font = `400 45px ${sans}`;
  const actionLines = wrap(ctx, message.action, W - PAD_X * 2 - 100);
  const boxH = 80 + 32 + 22 + actionLines.length * 72;
  const boxTop = H - 170 - boxH;
  ctx.fillStyle = "rgb(255 255 255 / 0.65)";
  roundRect(ctx, PAD_X, boxTop, W - PAD_X * 2, boxH, 32);
  ctx.fill();
  ctx.fillStyle = GOLD;
  ctx.font = `400 32px ${sans}`;
  spaced(ctx, "今天試試", cx, boxTop + 40 + 30, 11);
  ctx.fillStyle = "rgb(34 31 42 / 0.8)";
  ctx.font = `400 45px ${sans}`;
  actionLines.forEach((line, i) => ctx.fillText(line, cx, boxTop + 40 + 32 + 22 + 45 + i * 72));

  // 品牌
  ctx.fillStyle = MUTED;
  ctx.font = `400 30px ${sans}`;
  spaced(ctx, "豐盛健康愛", cx, H - 110, 12);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("無法產生圖片"))), "image/png"),
  );
}
