import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import classNames from '../../utils/classNames';
import styles from './index.module.less';

interface IProps {
  children: ReactNode;
  vertical?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function AutoSlideText(props: IProps) {
  const { children, vertical, className, style } = props;
  const parentRef = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parent = parentRef.current!;
    const child = childRef.current!;

    const observer = new ResizeObserver(() => {
      if (vertical) {
        const val = Math.max(child.clientHeight - parent.clientHeight, 0);
        parent.style.setProperty('--d', -val + 'px');
        parent.style.setProperty(
          '--t',
          Math.min(Math.max(val * 50, 1000), 8000) + 'ms',
        );
      } else {
        const val = Math.max(child.clientWidth - parent.clientWidth, 0);
        parent.style.setProperty('--d', -val + 'px');
        parent.style.setProperty(
          '--t',
          Math.min(Math.max(val * 50, 1000), 8000) + 'ms',
        );
      }
    });

    observer.observe(parent);
    observer.observe(child);
    return () => observer.disconnect();
  }, [vertical]);

  return (
    <div
      className={classNames(styles.autoScrollText, className)}
      ref={parentRef}
      style={style}
    >
      <div
        className={classNames(
          styles.slider,
          vertical ? styles.vertical : styles.horizontal,
        )}
        ref={childRef}
      >
        {children}
      </div>
    </div>
  );
}
