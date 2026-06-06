import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { message } from '@tauri-apps/plugin-dialog';
import { arch, locale, platform, type, version } from '@tauri-apps/plugin-os';
import { relaunch } from '@tauri-apps/plugin-process';
import type { Store } from '@tauri-apps/plugin-store';
import { load } from '@tauri-apps/plugin-store';
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type DeepPartial from '../../types/deepPartial';
import type { ISettings } from '../../types/settings';
import {
  BackgroundType,
  BlurEffect,
  CheckFrequency,
  CloseWindowAction,
  ColorMode,
} from '../../types/settings';
import { DEFAULT_COLOR, getPrimaryColor } from '../../utils/color';
import { changeTitle, setBlurEffect } from '../../utils/windowOperation';
import Message from '../Message';

interface IProps {
  children: ReactNode;
}

export const SettingsContext = createContext<
  | readonly [ISettings | undefined, (key: string, value: any) => Promise<void>]
  | null
>(null);

export default function SettingsProvider({ children }: IProps) {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ISettings>();
  const [count, setCount] = useState(5);
  const [msgOpen, setMsgOpen] = useState(false);
  const [warningOpen, setWarningOpen] = useState(false);
  const [errMsg, setErrMsg] = useState('');
  const timerRef = useRef<number>(null);

  const updateSettings = useCallback(async (key: string, value: any) => {
    console.info(`Change setting "${key}" to ${JSON.stringify(value)}`);
    const keys = key.split('.');
    const k = keys[0] as keyof ISettings;
    let current: { [k: string]: any };

    setSettings((prev) => {
      const newSettings = { ...(prev as ISettings) };
      current = newSettings[k];
      for (let i = 1; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      current = newSettings[k];
      return newSettings;
    });

    try {
      const store = await load('config.json');
      await store.set(k, current!);
    } catch (err: any) {
      setErrMsg(err);
      console.error('Save settings failed: ' + err);
    }
  }, []);

  // init
  useEffect(() => {
    // 修复最大化窗口的还原按钮图标bug
    if (type() === 'windows') {
      const appWindow = getCurrentWebviewWindow();
      const observer = new MutationObserver(() => {
        const maxBtn = document.getElementById('decorum-tb-maximize');
        if (maxBtn) {
          observer.disconnect();
          appWindow
            .isMaximized()
            .then((val) => {
              if (val) {
                maxBtn.innerHTML = '\ue923';
              }
            })
            .catch((err) =>
              console.error('Failed to get window state: ' + err),
            );
        }
      });
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: false,
      });
    }

    const init = async () => {
      let store: Store;
      const config: DeepPartial<ISettings> = {};
      try {
        store = await load('config.json');
        const entries = await store.entries();
        entries.forEach((entry) => {
          config[entry[0] as keyof ISettings] =
            entry[1] as ISettings[keyof ISettings];
        });
      } catch (err) {
        console.error('Failed to load config from app data directory: ' + err);
        message(`Failed to load config from app data directory.\n${err}`, {
          title: 'String Music',
          kind: 'error',
        });
      }

      const getProperNumber = (
        value: unknown,
        enumType?: { [key: string | number]: number | string },
      ) => {
        if (typeof value === 'number') {
          if (enumType) {
            if (Object.values(enumType).includes(value)) {
              return value;
            }
            return 0;
          }
          return value;
        }
        return 0;
      };

      const getProperBool = (value: unknown, defaultValue: boolean) => {
        if (typeof value === 'boolean') {
          return value;
        }
        return defaultValue;
      };

      const getProperOpacity = (value: unknown) => {
        if (typeof value === 'number' && value >= 0 && value <= 100) {
          return value;
        }
        return 80;
      };

      const autoPrimaryColor =
        config.personalization?.primaryColor?.auto ?? false;

      const getProperPrimaryColor = async (value: unknown) => {
        if (autoPrimaryColor) {
          return await getPrimaryColor();
        }
        if (typeof value === 'string' && /^#([0-9A-F]{3}){1,2}$/i.test(value)) {
          return value;
        }
        return DEFAULT_COLOR;
      };

      const primaryColor = await getProperPrimaryColor(
        config.personalization?.primaryColor?.hex,
      );

      const loadedSettings: ISettings = {
        common: {
          autorun: getProperBool(config.common?.autorun, false),
          closeWindow: getProperNumber(
            config.common?.closeWindow,
            CloseWindowAction,
          ),
        },
        internationalization: {
          language: config.internationalization?.language || '',
          detectNameLanguage: getProperBool(
            config.internationalization?.detectNameLanguage,
            true,
          ),
          detectLyricLanguage: getProperBool(
            config.internationalization?.detectLyricLanguage,
            true,
          ),
        },
        desktopLyric: {
          longitudinal: getProperBool(config.desktopLyric?.longitudinal, false),
        },
        personalization: {
          colorMode: getProperNumber(
            config.personalization?.colorMode,
            ColorMode,
          ),
          primaryColor: {
            auto: autoPrimaryColor,
            hex: primaryColor,
          },
          background: {
            type: getProperNumber(
              config.personalization?.background?.type,
              BackgroundType,
            ),
            opacity: getProperOpacity(
              config.personalization?.background?.opacity,
            ),
            blurEffect: getProperNumber(
              config.personalization?.background?.blurEffect,
              BlurEffect,
            ),
            picturePath: config.personalization?.background?.picturePath || '',
            folderPath: config.personalization?.background?.folderPath || '',
          },
          backgroundMini: {
            type: getProperNumber(
              config.personalization?.backgroundMini?.type,
              BackgroundType,
            ),
            opacity: getProperOpacity(
              config.personalization?.backgroundMini?.opacity,
            ),
            blurEffect: getProperNumber(
              config.personalization?.backgroundMini?.blurEffect,
              BlurEffect,
            ),
            picturePath:
              config.personalization?.backgroundMini?.picturePath || '',
            folderPath:
              config.personalization?.backgroundMini?.folderPath || '',
          },
          font: {
            global: config.personalization?.font?.global || '',
            sc: config.personalization?.font?.sc || '',
            tc: config.personalization?.font?.tc || '',
            jp: config.personalization?.font?.jp || '',
            kr: config.personalization?.font?.kr || '',
          },
          advancedMaterial: getProperBool(
            config.personalization?.advancedMaterial,
            true,
          ),
          disableAnimation: getProperBool(
            config.personalization?.disableAnimation,
            false,
          ),
          disableRoundCorner: getProperBool(
            config.personalization?.disableRoundCorner,
            false,
          ),
        },
        about: {
          checkUpdate: getProperNumber(
            config.about?.checkUpdate,
            CheckFrequency,
          ),
        },
        developerOptions: {
          enabled: getProperBool(config.developerOptions?.enabled, false),
          forceRTL: getProperBool(config.developerOptions?.forceRTL, false),
          showFooter: getProperBool(config.developerOptions?.showFooter, false),
          showUnsupportedOperations: getProperBool(
            config.developerOptions?.showUnsupportedOperations,
            false,
          ),
        },
      };

      const personalization = loadedSettings.personalization;
      if (personalization.disableAnimation) {
        document.documentElement.classList.add('no-animation');
      }
      if (personalization.disableRoundCorner) {
        document.body.classList.add('sharp');
      }
      switch (personalization.background.type) {
        case BackgroundType.Blur:
          setBlurEffect(personalization.background.blurEffect);
          break;
      }

      if (
        !CSS.supports(
          `(${['gap: 0', 'overflow: visible', 'background: linear-gradient(#000)', 'mix-blend-mode: difference', 'width: fit-content', 'selector(:focus-visible)'].join(') and (')})`,
        )
      ) {
        console.warn('WebView version too low.');
        setWarningOpen(true);
      }

      try {
        console.info(`OS info: ${platform()} ${version()} (${arch()})`);
        console.info('WebView version: ' + (await invoke('webview_ver')));
        console.info('Locale: ' + (await locale()));
      } catch (err) {
        console.error('Getting system infomation failed: ' + err);
      }

      const startTime = (window as any).startTimestamp;
      if (startTime !== undefined) {
        console.info(`Page loaded within ${Date.now() - startTime}ms.`);
        delete (window as any).startTimestamp;
      }

      setSettings(loadedSettings);
    };
    init();
  }, []);

  // Developer options
  const isDevOptEnabled = settings?.developerOptions.enabled;
  useEffect(() => {
    if (isDevOptEnabled === undefined) return;

    const title = t('titleBar.stringMusic');
    changeTitle(title);

    const handleDevKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'F12':
          e.preventDefault();
          if (isDevOptEnabled) {
            invoke('open_devtools').catch((err) => {
              console.error('Failed to open DevTools: ' + err);
              message(`${t('msg.openDevToolsFailed')}\n${err}`, {
                title,
                kind: 'error',
              });
            });
          } else {
            if (timerRef.current) {
              clearTimeout(timerRef.current);
              timerRef.current = null;
            }

            setCount((prev) => {
              if (prev === 1) {
                updateSettings('developerOptions.enabled', true);
                if (timerRef.current) {
                  clearTimeout(timerRef.current);
                  timerRef.current = null;
                }
              }
              return Math.max(0, prev - 1);
            });

            setMsgOpen(true);
            timerRef.current = setTimeout(() => {
              setCount(5);
            }, 6000);
          }
          break;
        case 'F5':
          e.preventDefault();
          if (isDevOptEnabled) {
            if (e.ctrlKey && e.altKey) {
              relaunch();
              break;
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleDevKey);

    return () => {
      window.removeEventListener('keydown', handleDevKey);
    };
  }, [isDevOptEnabled, t, updateSettings]);

  return (
    <SettingsContext.Provider value={[settings, updateSettings] as const}>
      {children}
      <Message
        type='error'
        open={Boolean(errMsg)}
        onClose={() => setErrMsg('')}
        message={
          <>
            {t('msg.saveSettingsError')}
            <br />
            {errMsg}
          </>
        }
      />
      <Message
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        type='warning'
        autoHideDuration={10000}
        message={t('msg.webviewVersionWarning')}
      />
      <Message
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        message={
          count
            ? t('msg.pressToEnableDevOpt', { n: count })
            : t('msg.devOptEnabled')
        }
      />
    </SettingsContext.Provider>
  );
}
