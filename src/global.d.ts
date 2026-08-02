type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface Window {
  /**
   * 是否是桌面操作系统
   */
  desktop: boolean;
}

interface KeyboardEvent {
  /**
   * 主修饰键是否被按下，Windows/Linux为Ctrl，Mac为Cmd
   */
  primaryKey: readonly boolean;
}
