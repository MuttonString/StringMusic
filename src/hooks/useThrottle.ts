import { useCallback, useEffect, useRef } from 'react';

/**
 * 将传入的函数封装为节流函数。
 */
export default function useThrottle(
  fn: (...args: any[]) => any,
  delay: number,
) {
  const fnRef = useRef(fn);
  const timerRef = useRef<number | null>(null);

  useEffect(() => (fnRef.current = fn), [fn]);

  return useCallback(
    (...args: any[]) => {
      if (timerRef.current) return;
      fnRef.current(...args);

      timerRef.current = setTimeout(() => {
        timerRef.current = null;
      }, delay);
    },
    [delay],
  );
}
