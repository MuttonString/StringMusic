import useSettings from './useSettings';

/**
 * 等待动画结束。动画禁用时不会等待。
 */
export default function useWaitAnimation(delay = 250) {
  const [settings] = useSettings();
  const isAnimationDisabled = settings?.personalization.disableAnimation;

  return async () =>
    await new Promise((resolve) =>
      setTimeout(resolve, isAnimationDisabled ? 0 : delay),
    );
}
