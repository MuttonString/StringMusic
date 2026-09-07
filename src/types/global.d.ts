declare global {
  interface KeyboardEvent {
    /**
     * 主修饰键是否被按下，Windows/Linux为Ctrl，Mac为Cmd
     */
    primaryKey: readonly boolean;
  }
}

import 'react';
declare module 'react' {
  export interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}
