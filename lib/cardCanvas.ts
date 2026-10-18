// 把卡片畫成 1080×1350 圖片的共用工具（豐盛指引卡、修行分享卡）

export const CARD_W = 1080;
export const CARD_H = 1350;
export const GOLD = "#b39468";
export const MUTED = "#6e6873";

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

/** 行數不變的前提下把寬度縮到最小，讓每行長度平均，避免最後一行只剩一兩個字 */
export function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines = wrapGreedy(ctx, text, maxWidth);
  let width = maxWidth;
  while (width > maxWidth / 2 && wrapGreedy(ctx, text, width - 8).length === lines.length) width -= 8;
  return wrapGreedy(ctx, text, width);
}

/** 逐字畫出加大字距的置中文字（canvas 的 letterSpacing 不是每個瀏覽器都支援） */
export function spaced(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, spacing: number) {
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

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** 四角星 */
export function sparkle(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  const s = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(s, s);
  ctx.fill(new Path2D("M12 0C12.6 7 17 11.4 24 12C17 12.6 12.6 17 12 24C11.4 17 7 12.6 0 12C7 11.4 11.4 7 12 0Z"));
  ctx.restore();
}

/** 網站使用的中文字型名稱，並先載入要畫的字（中文字型是依需要才下載的） */
export async function loadCardFonts(text: string) {
  const css = getComputedStyle(document.documentElement);
  const serif = `${css.getPropertyValue("--font-noto-serif-tc").trim() || "serif"}, serif`;
  const sans = `${css.getPropertyValue("--font-noto-sans-tc").trim() || "sans-serif"}, sans-serif`;
  await Promise.all([
    document.fonts.load(`700 140px ${serif}`, text),
    document.fonts.load(`400 56px ${serif}`, text),
    document.fonts.load(`400 45px ${sans}`, text),
  ]).catch(() => {});
  return { serif, sans };
}

/** 建立畫布，畫上米白到粉紫的漸層底與金色細框 */
export function createCard() {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  const bg = ctx.createLinearGradient(0, 0, CARD_W * 0.6, CARD_H);
  bg.addColorStop(0, "#fbf6f1");
  bg.addColorStop(0.55, "#f6e7ec");
  bg.addColorStop(1, "#e9e5f4");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = "rgb(179 148 104 / 0.5)";
  ctx.lineWidth = 2;
  roundRect(ctx, 38, 47, CARD_W - 76, CARD_H - 94, 28);
  ctx.stroke();

  return { canvas, ctx, cx: CARD_W / 2 };
}

/** 粉到紫的漸層填色（給大字用） */
export function auraFill(ctx: CanvasRenderingContext2D, cx: number, width: number) {
  const g = ctx.createLinearGradient(cx - width / 2, 0, cx + width / 2, 0);
  g.addColorStop(0, "#d9a7b3");
  g.addColorStop(0.6, "#b8a3cf");
  g.addColorStop(1, "#9fa6cf");
  return g;
}

export function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("無法產生圖片"))), "image/png"),
  );
}

/**
 * 手機上開啟分享選單（可直接選 LINE 或「儲存影像」），電腦上直接下載。
 * 回傳 false 代表使用者自己關掉了分享選單。
 */
export async function shareOrDownload(blob: Blob, filename: string, text?: string) {
  const file = new File([blob], filename, { type: blob.type });
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  try {
    if (isTouch && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], ...(text ? { text } : {}) });
      return true;
    }
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return false;
    throw err;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return true;
}
