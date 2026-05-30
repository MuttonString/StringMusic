import type { MouseEvent, MouseEventHandler } from 'react';
import { useRef } from 'react';

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
