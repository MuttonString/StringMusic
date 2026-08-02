import { useCallback, useEffect, useRef } from 'react';

/**
 * 将传入的函数封装为防抖函数。
 */
export default function useDebounce(
  fn: (...args: any[]) => any,
  delay: number,
) {
  const fnRef = useRef(fn);
  const timerRef = useRef<number | null>(null);

  useEffect(() => (fnRef.current = fn), [fn]);

  return useCallback(
    (...args: any[]) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
        timerRef.current = null;
      }, delay);
    },
    [delay],
  );
}
