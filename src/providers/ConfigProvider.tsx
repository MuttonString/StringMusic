import { emit, listen } from '@tauri-apps/api/event';
import { load } from '@tauri-apps/plugin-store';
import { createContext, useContext, useEffect, useReducer } from 'react';
import { WINDOW_LABEL } from '../constants/window';
import { applyConfigFnMap } from '../handlers/config';
import type { EventPayload } from '../types/backend';
import { BackendEvent } from '../types/backend';
import type { ChildrenProp } from '../types/component';
import type { AppConfig, ConfigContext } from '../types/config';
import {
  BackgroundType,
  CloseWindowAction,
  ColorMode,
  Colors,
  CyrillicToLatinMode,
  PlaybackMode,
  RomajiMode,
  ShowAudioWave,
} from '../types/config';
import { decompress } from '../utils/data';

const emitChanging = (obj: Partial<AppConfig>) => {
  emit<EventPayload<typeof obj>>(BackendEvent.ConfigChanged, {
    label: WINDOW_LABEL,
    data: obj,
  });

  // 只在主窗口执行写入文件操作
  if (WINDOW_LABEL === 'main') {
    const save = async () => {
      try {
        const store = await load('config.json');
        const entries = Object.entries(obj);
        for (const [key, value] of entries) {
          console.info(`Update config "${key}" to ${JSON.stringify(value)}`);
          await store.set(key, value);
        }
      } catch (err: any) {
        console.error('Failed to save config: ' + err);
      }
    };
    save();
  }
};

const initVal: AppConfig = {
  language: '',
  closeWindowAction: CloseWindowAction.Ask,
  autoCheckUpdate: true,

  colorMode: ColorMode.FollowSystem,
  primaryColor: Colors.Cyan,
  backgroundMainWindow: {
    type: BackgroundType.SinglePicture,
    opacity: 80,
    path: '',
  },
  backgroundMiniWindow: {
    type: BackgroundType.SinglePicture,
    opacity: 80,
  },
  globalFont: '',
  advancedMaterial: true,
  sharpStyle: false,
  animationDuration: 1,

  enableDesktopLyric: false,
  lockDesktopLyric: false,
  lyricFont: '',
  longitudinal: false,
  textStroke: false,
  textShadow: true,

  pronFromApiFirst: false,
  jpRomaji: RomajiMode.ByWord,
  yahooAppId: '0',
  furigana: false,
  katakanaRuby: false,
  kanjiFix: true,
  removeParenthesisPron: true,
  hangulPron: false,
  cyrillicPron: CyrillicToLatinMode.Disable,
  otherPron: false,

  audioDevice: '',
  showAudioWave: ShowAudioWave.OnHover,
  coverRotate: true,
  useCoverAsIcon: true,
  useMusicTitleAsWindowTitle: true,
  seekBySentence: true,
  replaceWholeList: false,
  replayDelay: 2,
  volume: 100,
  dynamicVolume: false,
  canVolumnOver100: false,
  speed: 1,
  audioFade: false,
  enableEqualizer: false,
  equalizerSliderMoveTogether: true,
  equalizer: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  detune: 0,
  playbackMode: PlaybackMode.RepeatQueue,

  recommendation: true,
  recentPlayed: true,
  searchHistory: true,
  savePlaybackStatus: true,
  keepDownloadHistory: true,

  enableDevOptions: false,
  forceRTL: false,
  showFooter: false,
  script: '',
};

const reducer = (prev: AppConfig, action: Partial<AppConfig>) => {
  Object.entries(action).forEach(([key, value]) => {
    applyConfigFnMap[key as keyof AppConfig]?.(value as never);
  });
  return { ...prev, ...action };
};

const Context = createContext<ConfigContext>([initVal, emitChanging]);

export const useConfig = () => useContext(Context);

export function ConfigProvider({ children }: ChildrenProp) {
  const [config, dispatch] = useReducer(reducer, initVal);

  useEffect(() => {
    const unlisten = listen<EventPayload<Partial<AppConfig>>>(
      BackendEvent.ConfigChanged,
      (e) => dispatch(e.payload.data),
    );

    const loadConfig = async () => {
      const store = await load('config.json');
      const entries = await store.entries<AppConfig[keyof AppConfig]>();
      const loaded = Object.fromEntries(entries) as Partial<AppConfig>;
      dispatch({ ...initVal, ...loaded });

      // 执行启动脚本
      if (WINDOW_LABEL === 'main' && loaded.enableDevOptions && loaded.script) {
        setTimeout(() => {
          try {
            Function('"use strict";' + decompress(loaded.script!))();
          } catch (err) {
            console.error('Error while running JS script: ' + err);
          }
        });
      }
    };
    loadConfig();

    return () => {
      unlisten.then((fn) => fn());
    };
  }, []);

  return (
    <Context.Provider value={[config, emitChanging]}>
      {children}
    </Context.Provider>
  );
}
