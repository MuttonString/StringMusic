import { useContext } from 'react';
import { GlobalContext } from '../components/GlobalProvider';
import type { ISettings } from '../types/settings';

/**
 * 保存在AppData的config.json内的应用程序全局设置。
 */
export default function useSettings() {
  const context = useContext(GlobalContext);
  if (!context) {
    // 热重载时可能为null导致问题，直接刷新页面
    location.reload();

    // 防止类型报错
    return undefined as unknown as readonly [
      ISettings | undefined,
      (key: string, value: {}) => Promise<void>,
    ];
  }

  return context.settings;
}
