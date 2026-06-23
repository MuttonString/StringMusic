import { useEffect, useRef, useState } from 'react';
import useSettings from './useSettings';

/**
 * 延迟state更新，一般用于希望等关闭动画结束后再更新state的弹出菜单、弹窗等组件。动画禁用时不会延迟更新state。
 */
export default function useDelayedState<T>(
  state: T,
  delay = 250,
): [T, boolean] {
  const [settings] = useSettings();
  const isAnimationDisabled = settings?.personalization.disableAnimation;
  const [delayedState, setDelayedState] = useState(state);
  const [isPending, setIsPending] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isAnimationDisabled) {
      setDelayedState(state);
      setIsPending(false);
      return;
    }

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setIsPending(true);
    timerRef.current = setTimeout(() => {
      setDelayedState(state);
      setIsPending(false);
    }, delay);
  }, [delay, isAnimationDisabled, state]);

  return [delayedState, isPending];
}
