import "server-only";
import { unstable_rethrow } from "next/navigation";
import type { ReactNode } from "react";

/**
 * 執行需要資料庫的區塊；連不上時記錄錯誤並改顯示 fallback，頁面其他部分照常運作。
 * redirect()、notFound() 這類 Next.js 內部機制會原樣往外拋，不受影響。
 */
export async function orBusy(load: () => Promise<ReactNode>, fallback: ReactNode): Promise<ReactNode> {
  try {
    return await load();
  } catch (err) {
    unstable_rethrow(err);
    console.error(err);
    return fallback;
  }
}
