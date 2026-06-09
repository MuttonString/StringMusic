import { useCallback, useEffect, useRef } from 'react';

export default function useDebounce(
  fn: (...args: any[]) => any,
  delay: number,
) {
  const fnRef = useRef<(...args: any[]) => any>(fn);
  const timerRef = useRef<number | null>(null);

  useEffect(() => (fnRef.current = fn), [fn]);

  return useCallback(
    function f(this: any, ...args: any[]) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        fnRef.current.call(this, ...args);
        timerRef.current = null;
      }, delay);
    },
    [delay],
  );
}
