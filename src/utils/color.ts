import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export const DEFAULT_COLOR = '#92c586';

/**
 * 获取操作系统主题色
 */
export async function getPrimaryColor() {
  try {
    return (await invoke('get_accent_color')) as string;
  } catch (err) {
    console.error('Getting primary color failed: ' + err);
    return DEFAULT_COLOR;
  }
}

/**
 * 监听操作系统主题色变化
 * @param callback 操作系统主题色变化时的回调函数
 * @returns 取消监听的函数
 */
export async function listenPrimaryColor(
  callback: (primaryColor: string) => void,
) {
  try {
    const unlisten = await listen('system-accent-changed', (event) => {
      callback(event.payload as string);
    });
    return unlisten;
  } catch (err) {
    console.error('Can not listen system accent color changed event: ' + err);
    return () => {};
  }
}

/**
 * 检查是否为深色模式
 */
export function isDarkMode() {
  return window.matchMedia('(prefers-color-scheme:dark)').matches;
}

/**
 * 监听颜色模式变化
 * @param callback 颜色模式变化时的回调函数
 * @returns 取消监听的函数
 */
export function listenColorMode(callback: (isDarkMode: boolean) => void) {
  getCurrentWebviewWindow().setTheme(null);
  const media = window.matchMedia('(prefers-color-scheme:dark)');
  const fn = (e: MediaQueryListEvent) => callback(e.matches);
  media.addEventListener('change', fn);
  return () => media.removeEventListener('change', fn);
}
