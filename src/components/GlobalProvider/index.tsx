import type { Event } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { message } from '@tauri-apps/plugin-dialog';
import { load } from '@tauri-apps/plugin-store';
import type { ReactNode, RefObject } from 'react';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SettingsDrawerFn, SnackbarFn } from '../../types/globalSlot';
import { NoSavingState, type MusicState } from '../../types/music';
import type { ISettings } from '../../types/settings';
import { DEFAULT_COLOR } from '../../utils/color';
import SettingsDrawer from '../SettingsDrawer';
import SnackbarTemplate from '../SnackbarTemplate';

interface IProps {
  children: ReactNode;
}

interface IContext {
  settings: readonly [
    ISettings | undefined,
    (key: string, value: {}) => Promise<void>,
  ];
  musicState: readonly [
    MusicState | undefined,
    (key: keyof MusicState, value: any) => Promise<void>,
  ];
  snackbar: RefObject<SnackbarFn | null>;
  drawer: RefObject<SettingsDrawerFn | null>;
}

interface IStateChanged<T> {
  source: string;
  payload: T;
}

export const GlobalContext = createContext<IContext | null>(null);
export const SlotContext = createContext<ReactNode>(null);

export default function GlobalProvider({ children }: IProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ISettings>();
  const [audioState, setAudioState] = useState<MusicState>();
  const snackbarRef = useRef<SnackbarFn>(null);
  const drawerRef = useRef<SettingsDrawerFn>(null);
  const labelRef = useRef(getCurrentWebviewWindow().label);

  const updateSettings = useCallback(async (key: string, value: {}) => {
    console.info(
      `Change setting "${key}" to ${JSON.stringify(value).substring(0, 50)}`,
    );
    const keys = key.split('.');
    const k = keys[0] as keyof ISettings;
    let current: Record<string, {}>;

    setSettings((prev) => {
      const newSettings = { ...prev! };
      current = newSettings[k];
      for (let i = 1; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      current = newSettings[k];

      emit('settings_changed', {
        source: labelRef.current,
        payload: newSettings,
      } as IStateChanged<ISettings>).catch((err) =>
        console.error('Failed to emit settings changed event: ' + err),
      );
      return newSettings;
    });

    try {
      const store = await load('config.json');
      await store.set(k, current!);
    } catch (err: any) {
      snackbarRef.current?.(err, 'error');
      console.error('Save settings failed: ' + err);
    }
  }, []);

  const setMusicState = useCallback(
    async (key: keyof MusicState, value: {}) => {
      setAudioState((prev) => {
        const newState = { ...prev!, [key]: value };
        emit('music_state_changed', {
          source: labelRef.current,
          payload: newState,
        } as IStateChanged<MusicState>).catch();
        return newState;
      });
      if (NoSavingState.includes(key)) return;

      try {
        const store = await load('.music-state.json');
        await store.set(key, value);
      } catch {}
    },
    [],
  );

  // init
  useEffect(() => {
    const unlistenSettings = listen(
      'settings_changed',
      (e: Event<IStateChanged<ISettings>>) => {
        const ev = e.payload;
        if (ev.source !== labelRef.current) {
          setSettings(ev.payload);
        }
      },
    );

    const unlistenMusicState = listen(
      'music_state_changed',
      (e: Event<IStateChanged<MusicState>>) => {
        const ev = e.payload;
        if (ev.source !== labelRef.current) {
          setAudioState(ev.payload);
        }
      },
    );

    const init = async () => {
      const config: DeepPartial<ISettings> = {};
      try {
        const store = await load('config.json');
        const entries = await store.entries();
        entries.forEach(([k, v]) => {
          config[k as keyof ISettings] = v as any;
        });
      } catch (err) {
        console.error('Failed to load config from app data directory: ' + err);
        message(`Failed to load config from app data directory.\n${err}`, {
          title: 'String Music',
          kind: 'error',
        });
      }

      const musicState: Partial<MusicState> = {};
      try {
        const store = await load('.music-state.json');
        const entries = await store.entries();
        entries.forEach(([k, v]) => {
          musicState[k as keyof MusicState] = v as any;
        });
      } catch (err) {
        console.error(
          'Failed to load music state from app data directory: ' + err,
        );
      }

      // 对于异常数字，使用默认值
      const getProperNumber = (
        value: unknown,
        max: number,
        defaultValue = 0,
      ) => {
        if (typeof value === 'number') {
          if (value > max || value < 0) {
            return defaultValue;
          }
          return Math.floor(value);
        }
        return defaultValue;
      };

      // 对于异常布尔值，使用默认值
      const getProperBool = (value: unknown, defaultValue: boolean) => {
        if (typeof value === 'boolean') {
          return value;
        }
        return defaultValue;
      };

      const autoPrimaryColor =
        config.personalization?.primaryColor?.followSystem ?? false;

      // 对于异常颜色值，使用默认颜色
      const getProperPrimaryColor = async (value: unknown) => {
        if (typeof value === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(value)) {
          return value;
        }
        return DEFAULT_COLOR;
      };

      const primaryColor = await getProperPrimaryColor(
        config.personalization?.primaryColor?.hex,
      );

      // 读取设置，对于不存在的设置项，填充默认值
      // 注意：枚举值元素数量发生变动时，必须修改getProperNumber的max参数
      const loadedSettings: ISettings = {
        common: {
          language: config.common?.language || '',
          closeWindow: getProperNumber(config.common?.closeWindow, 2),
        },
        desktopLyric: {
          longitudinal: getProperBool(config.desktopLyric?.longitudinal, false),
        },
        personalization: {
          colorMode: getProperNumber(config.personalization?.colorMode, 2),
          primaryColor: {
            followSystem: autoPrimaryColor,
            hex: primaryColor,
          },
          background: {
            type: getProperNumber(config.personalization?.background?.type, 4),
            opacity: getProperNumber(
              config.personalization?.background?.opacity,
              100,
              80,
            ),
            blurEffect: getProperNumber(
              config.personalization?.background?.blurEffect,
              3,
            ),
            picture: config.personalization?.background?.picture || '',
            folder: config.personalization?.background?.folder || '',
          },
          backgroundMini: {
            type: getProperNumber(
              config.personalization?.backgroundMini?.type,
              4,
            ),
            opacity: getProperNumber(
              config.personalization?.backgroundMini?.opacity,
              100,
              80,
            ),
            blurEffect: getProperNumber(
              config.personalization?.backgroundMini?.blurEffect,
              3,
            ),
            picture: config.personalization?.backgroundMini?.picture || '',
            folder: config.personalization?.backgroundMini?.folder || '',
          },
          font: {
            global: config.personalization?.font?.global || '',
            zh: config.personalization?.font?.zh || '',
            ja: config.personalization?.font?.ja || '',
            other: config.personalization?.font?.other || '',
          },
          advancedMaterial: getProperBool(
            config.personalization?.advancedMaterial,
            true,
          ),
          disableRoundCorner: getProperBool(
            config.personalization?.disableRoundCorner,
            false,
          ),
          animationDuration: [0, 0.5, 1, 1.5, 2, 5, 10].includes(
            config.personalization?.animationDuration!,
          )
            ? config.personalization!.animationDuration!
            : 1,
        },
        playback: {
          coverRotate: getProperBool(config.playback?.coverRotate, true),
        },
        privacy: {
          recommendation: getProperBool(config.privacy?.recommendation, true),
          recent: getProperBool(config.privacy?.recent, true),
          searchHistory: getProperBool(config.privacy?.searchHistory, true),
          savePlaying: getProperBool(config.privacy?.savePlaying, true),
        },
        download: {
          autoClear: getProperBool(config.download?.autoClear, false),
          maxCount: getProperNumber(config.download?.maxCount, 10, 5) || 5,
          finishTip: getProperBool(config.download?.finishTip, true),
        },
        update: {
          checkUpdate: getProperNumber(config.update?.checkUpdate, 3),
          timestamp: getProperNumber(config.update?.timestamp, Infinity),
        },
        developerOptions: {
          enabled: getProperBool(config.developerOptions?.enabled, false),
          forceRTL: getProperBool(config.developerOptions?.forceRTL, false),
          showFooter: getProperBool(config.developerOptions?.showFooter, false),
          script: config.developerOptions?.script?.trim() || '',
        },
      };

      // 读取保存的音乐状态
      const loadedMusicState: MusicState = {
        playingIdx: getProperNumber(musicState.playingIdx, Infinity, -1),
        playQueue: Array.isArray(musicState.playQueue)
          ? musicState.playQueue.filter((item) => item?.pathOrId)
          : [],
        progress: getProperNumber(musicState.progress, Infinity),
        volume: getProperNumber(musicState.volume, 100),
        mute: getProperBool(musicState.mute, false),
        repeatMode: getProperNumber(musicState.repeatMode, 2),
        shuffle: getProperBool(musicState.shuffle, false),
        radio: false,
        loading: false,
        playing: false,
        lrc: '',
      };
      if (loadedMusicState.playQueue.length - 1 < loadedMusicState.playingIdx) {
        loadedMusicState.playingIdx = -1;
      }

      const devOpt = loadedSettings.developerOptions;
      if (devOpt.enabled && devOpt.script) {
        console.info('Running JS script.');

        setTimeout(() => {
          try {
            Function('"use strict";' + devOpt.script)();
          } catch (err) {
            console.error('Error while running JS script: ' + err);
          }
        }, 0);
      }

      setSettings(loadedSettings);
      setAudioState(loadedMusicState);
    };

    init();
    return () => {
      unlistenSettings.then((fn) => fn());
      unlistenMusicState.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    getCurrentWebviewWindow()
      .setTitle(t('common.stringMusic'))
      .catch((err) => console.error('Setting window title failed: ' + err));
  }, [t]);

  useEffect(() => {
    // PostCSS有警告，且可能对UI影响较明显的CSS特性，需检查是否支持
    if (
      labelRef.current === 'main' &&
      !CSS.supports(
        `(${[
          'overflow: clip',
          'width: fit-content',
          'selector(:has(a))',
          'clip-path: polygon(0 0, 100% 0, 50% 100%)',
          'gap: 1px',
          'background: linear-gradient(white, black)',
          'mix-blend-mode: difference',
          'margin-inline-end: 1px',
        ].join(') and (')})`,
      )
    ) {
      console.warn('WebView version too low.');
      snackbarRef.current?.(t('msg.webviewVersionWarning'), 'warning', 10000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GlobalContext.Provider
      value={
        {
          settings: [settings, updateSettings] as const,
          musicState: [audioState, setMusicState] as const,
          snackbar: snackbarRef,
          drawer: drawerRef,
        } as const
      }
    >
      <SlotContext.Provider
        value={
          <>
            <SnackbarTemplate
              sharp={settings?.personalization.disableRoundCorner}
              ref={snackbarRef}
            />
            <SettingsDrawer
              ref={drawerRef}
              settings={settings}
              updateSettings={updateSettings}
            />
          </>
        }
      >
        {children}
      </SlotContext.Provider>
    </GlobalContext.Provider>
  );
}
