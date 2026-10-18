"use client";

import { useSyncExternalStore } from "react";
import { dateKey } from "./date";

const noopSubscribe = () => () => {};

/** 今天的日期鍵（學員所在時區）；伺服器端為 null，避免時區不同造成畫面不一致 */
export function useToday() {
  return useSyncExternalStore(noopSubscribe, () => dateKey(), () => null);
}
