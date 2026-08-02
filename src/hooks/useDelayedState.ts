import { useEffect, useRef, useState } from 'react';

/**
 * 延迟state更新，一般用于希望等关闭动画结束后再响应state更新的弹出菜单等组件。
 */
export default function useDelayedState<T>(
  state: T,
  delay = 250,
): [T, boolean] {
  const [delayedState, setDelayedState] = useState(state);
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsPending(true);
    timerRef.current = setTimeout(() => {
      setDelayedState(state);
      setIsPending(false);
    }, delay);
  }, [delay, state]);

  return [delayedState, isPending];
}
