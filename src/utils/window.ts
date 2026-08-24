import { emit } from '@tauri-apps/api/event';
import {
  getAllWebviewWindows,
  WebviewWindow,
} from '@tauri-apps/api/webviewWindow';
import { IS_APPLE } from '../constants/os';
import { MAIN_WINDOW } from '../constants/window';
import { BackendEvent } from '../types/backend';

/**
 * 页面布局是否是从右到左
 */
export function isRTL() {
  return document.documentElement.dir === 'rtl';
}

/**
 * 应用是否是深色模式
 */
export function isDarkMode() {
  return window.matchMedia('(prefers-color-scheme:dark)').matches;
}

/**
 * 销毁所有窗口，退出应用
 */
export async function destroyAll() {
  if (!IS_APPLE) await MAIN_WINDOW.setFullscreen(false);
  const windows = await getAllWebviewWindows();
  windows.forEach((win) => win.destroy());
}

/**
 * 展示主窗口
 */
export async function showMainWindow() {
  await MAIN_WINDOW.show();
  await MAIN_WINDOW.unminimize();
  await MAIN_WINDOW.setFocus();
  setTimeout(() => emit(BackendEvent.ShowMainWindow));
}

/**
 * 展示程序当前窗口
 */
export async function raise() {
  const miniWindow = await WebviewWindow.getByLabel('mini');
  if (await miniWindow?.isVisible()) {
    await miniWindow!.setFocus();
    return;
  }
  await showMainWindow();
}
