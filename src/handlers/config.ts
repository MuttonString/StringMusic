import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { join } from '@tauri-apps/api/path';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Effect } from '@tauri-apps/api/window';
import { exists, readDir } from '@tauri-apps/plugin-fs';
import { type } from '@tauri-apps/plugin-os';
import bg from '../assets/bg.webp';
import { MAIN_WINDOW, WINDOW_LABEL } from '../constants/window';
import type { AppConfig } from '../types/config';
import { BackgroundType, ColorMode } from '../types/config';
import { listenDevKey } from '../utils/shortcutKey';
import { setLang } from './lang';

const appWindow = getCurrentWebviewWindow();

/**
 * 映射为应用某设置项的对应函数
 */
export const applyConfigFnMap: {
  [key in keyof AppConfig]?: (value: AppConfig[key]) => void;
} = {
  language(value) {
    setTimeout(() =>
      setLang(value).then(() => {
        if (WINDOW_LABEL === 'main')
          MAIN_WINDOW.show().then(() => {
            if (type() === 'windows') invoke('init_taskbar_buttons');
          });
      }),
    );
  },

  colorMode(value) {
    switch (value) {
      case ColorMode.Light:
        appWindow.setTheme('light');
        break;
      case ColorMode.Dark:
        appWindow.setTheme('dark');
        break;
      default:
        appWindow.setTheme(null);
        break;
    }
  },
  async backgroundMainWindow({ type, opacity, path }) {
    if (WINDOW_LABEL !== 'main') return;
    const style = document.body.style;

    const setBgColor = () => {
      style.backgroundColor = `rgb(var(--mui-palette-AppBar-defaultBgChannel) / ${opacity}%)`;
      style.setProperty(
        '--bg-color',
        `rgb(var(--mui-palette-background-defaultChannel) / ${Math.pow(opacity / 100, 5)})`,
      );
      appWindow.clearEffects();
    };

    const setEffects = (effects: Effect[]) => {
      style.backgroundImage = '';
      style.removeProperty('--bg-color');
      style.backgroundColor = 'transparent';
      appWindow.setEffects({
        effects,
      });
    };

    switch (type) {
      case BackgroundType.Standard:
        style.backgroundImage = '';
        setBgColor();
        break;
      case BackgroundType.Blur:
        setEffects([Effect.Blur, Effect.Sidebar]);
        break;
      case BackgroundType.Acrylic:
        setEffects([Effect.Acrylic]);
        break;
      case BackgroundType.Mica:
        setEffects([Effect.Mica]);
        break;
      case BackgroundType.RandomPictures:
        setBgColor();
        if (!path) {
          style.backgroundImage = `url(${bg})`;
          break;
        }

        try {
          if (!(await exists(path))) {
            style.backgroundImage = bg;
            break;
          }
          const entries = await readDir(path);
          const files = entries
            .filter((entry) => entry.isFile)
            .map((file) => file.name);
          if (files.length === 0) {
            style.backgroundImage = `url(${bg})`;
            break;
          }
          const img = files[Math.floor(Math.random() * files.length)];
          const fullPath = await join(path, img);
          style.backgroundImage = `url(${convertFileSrc(fullPath)}`;
        } catch (err) {
          console.error('Failed to get random picture: ' + err);
          style.backgroundImage = `url(${bg})`;
        }
        break;
      default:
        setBgColor();
        style.backgroundImage = `url(${path ? convertFileSrc(path) : bg})`;
        break;
    }
  },
  async backgroundMiniWindow() {
    // [Effect.Blur, Effect.ContentBackground, Effect.Popover]
  },
  advancedMaterial(val) {
    if (val) document.body.classList.add('advanced-material');
    else document.body.classList.remove('advanced-material');
  },
  sharpStyle(val) {
    if (val) document.body.classList.add('sharp-corner');
    else document.body.classList.remove('sharp-corner');
  },
  animationDuration(val) {
    document.body.style.setProperty('--duration', String(val));
  },
  globalFont(value) {
    document.body.style.setProperty('--font', value);
  },

  enableDevOptions(value) {
    if (value) window.addEventListener('keydown', listenDevKey, true);
    else window.removeEventListener('keydown', listenDevKey, true);
  },
} as const;
