import { invoke } from '@tauri-apps/api/core';
import {
  getAllWebviewWindows,
  WebviewWindow,
} from '@tauri-apps/api/webviewWindow';
import { type } from '@tauri-apps/plugin-os';
import { IS_APPLE } from '../constants/os';
import { MAIN_WINDOW } from '../constants/window';

export function isRTL() {
  return document.documentElement.dir === 'rtl';
}

export function isDarkMode() {
  return window.matchMedia('(prefers-color-scheme:dark)').matches;
}

export async function destroyAll() {
  if (!IS_APPLE) await MAIN_WINDOW.setFullscreen(false);
  const windows = await getAllWebviewWindows();
  windows.forEach((win) => win.destroy());
}

export async function showMainWindow() {
  await MAIN_WINDOW.show();
  await MAIN_WINDOW.unminimize();
  MAIN_WINDOW.setFocus();

  if (type() === 'windows') {
    invoke('init_taskbar_buttons');
  }
}

export async function raise() {
  const miniWindow = await WebviewWindow.getByLabel('mini');
  if (await miniWindow?.isVisible()) {
    miniWindow!.setFocus();
    return;
  }

  showMainWindow();
}
