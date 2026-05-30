import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';

export const DEFAULT_COLOR = '#92c586';

export async function getPrimaryColor() {
  try {
    return (await invoke('get_accent_color')) as string;
  } catch (err) {
    console.error('Getting primary color failed: ' + err);
    return DEFAULT_COLOR;
  }
}

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

export function isDarkMode() {
  return window.matchMedia('(prefers-color-scheme:dark)').matches;
}

export function listenColorMode(callback: (isDarkMode: boolean) => void) {
  getCurrentWebviewWindow().setTheme(null);
  const media = window.matchMedia('(prefers-color-scheme:dark)');
  const fn = (e: MediaQueryListEvent) => callback(e.matches);
  media.addEventListener('change', fn);
  return () => media.removeEventListener('change', fn);
}
