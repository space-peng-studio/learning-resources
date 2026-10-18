"use client";

import { useRef, useState } from "react";
import { updatePractice } from "@/app/actions/data";
import { applyPracticeOp, type PracticeOp, type PracticeState } from "./practice";

/**
 * 練習狀態：按下去畫面立刻更新，同時送到伺服器儲存；
 * 以伺服器回傳的結果為準，失敗時退回上一次成功儲存的狀態。
 * persist 為 false 時是未登入的試用模式，只在畫面上作用。
 */
export function usePractice(initial: PracticeState, persist = true) {
  const [state, setState] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const confirmed = useRef(initial);
  const latest = useRef(0);

  function dispatch(op: PracticeOp, today: string) {
    setError(null);
    setState((s) => applyPracticeOp(s, op, today));
    // 試用模式（未登入）只改畫面，不存到伺服器
    if (!persist) return;
    const n = ++latest.current;

    const fail = (message: string) => {
      if (n === latest.current) setState(confirmed.current);
      setError(message);
    };
    updatePractice(op, today)
      .then((res) => {
        if (!res.ok) return fail(res.error);
        confirmed.current = res.data;
        // 連續點擊時，只採用最後一次的回應，避免畫面跳回中間狀態
        if (n === latest.current) setState(res.data);
      })
      .catch(() => fail("沒有儲存成功，請檢查網路後再試一次。"));
  }

  return { state, dispatch, error };
}
