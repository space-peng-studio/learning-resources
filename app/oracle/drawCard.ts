import { CARD_H as H, CARD_W as W, GOLD, MUTED, auraFill, createCard, loadCardFonts, roundRect, sparkle, spaced, toPng, wrap } from "@/lib/cardCanvas";
import type { OracleMessage } from "@/lib/oracleMessages";
import { cardNumber } from "./OracleCard";

// 把牌卡畫成 1080×1350 的 PNG，給「存下來」用。版面對照 OracleCard.tsx 的 CardFront。

export async function drawCard(message: OracleMessage, index: number): Promise<Blob> {
  const { serif, sans } = await loadCardFonts(
    `今日豐盛指引豐盛健康愛今天試試${cardNumber(index)}${message.keyword}${message.message}${message.action}`,
  );
  const { canvas, ctx, cx } = createCard();
  const PAD_X = 119;

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
  ctx.fillStyle = auraFill(ctx, cx, kwWidth);
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

  return toPng(canvas);
}
