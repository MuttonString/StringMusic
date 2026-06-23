import type { MouseEvent, MouseEventHandler } from 'react';
import { useRef } from 'react';

/**
 * 处理鼠标长按事件，通常将该hook返回值直接传递给对应组件即可。
 */
export default function useLongClick(
  onLongClick: MouseEventHandler,
  onClick?: MouseEventHandler,
  threshold = 500,
) {
  const timerRef = useRef<number>(null);
  const longPressTriggeredRef = useRef(false);

  const onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    longPressTriggeredRef.current = false;
    timerRef.current = setTimeout(() => {
      onLongClick(e);
      longPressTriggeredRef.current = true;
    }, threshold);
  };

  const onMouseUp = (e: MouseEvent) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!longPressTriggeredRef.current && e.button === 0) {
      onClick?.(e);
    }
  };

  const onMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return { onMouseDown, onMouseUp, onMouseLeave, onContextMenu: onLongClick };
}
