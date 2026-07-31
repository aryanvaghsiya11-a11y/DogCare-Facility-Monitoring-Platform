"use client";

import { useEffect, useMemo, useRef } from "react";

// Tiny internal hook. Avoids pulling in another dep just for this.
export function useDebouncedCallback<T extends (...args: never[]) => void>(fn: T, ms: number) {
  const ref = useRef(fn);
  ref.current = fn;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return useMemo(
    () =>
      ((...args: Parameters<T>) => {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => ref.current(...args), ms);
      }) as T,
    [ms],
  );
}
