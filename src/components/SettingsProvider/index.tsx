import { invoke } from '@tauri-apps/api/core';
import { message } from '@tauri-apps/plugin-dialog';
import { relaunch } from '@tauri-apps/plugin-process';
import type { Store } from '@tauri-apps/plugin-store';
import { load } from '@tauri-apps/plugin-store';
import type { ReactNode } from 'react';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ISettings } from '../../types/settings';
import { BackgroundType } from '../../types/settings';
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
          return value;
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
        config.personalization?.primaryColor?.auto ?? false;

      // 对于异常颜色值，使用默认颜色
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

      // 读取设置，对于不存在的设置项，填充默认值
      // 注意：枚举值元素数量发生变动时，必须修改getProperNumber的max参数
      const loadedSettings: ISettings = {
        common: {
          autorun: getProperBool(config.common?.autorun, false),
          closeWindow: getProperNumber(config.common?.closeWindow, 2),
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
          colorMode: getProperNumber(config.personalization?.colorMode, 2),
          primaryColor: {
            auto: autoPrimaryColor,
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
            picturePath: config.personalization?.background?.picturePath || '',
            folderPath: config.personalization?.background?.folderPath || '',
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
            picturePath:
              config.personalization?.backgroundMini?.picturePath || '',
            folderPath:
              config.personalization?.backgroundMini?.folderPath || '',
          },
          font: {
            global: config.personalization?.font?.global || '',
            zh: config.personalization?.font?.zh || '',
            ja: config.personalization?.font?.ja || '',
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
          checkUpdate: getProperNumber(config.about?.checkUpdate, 3),
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

      // 应用设置
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

      const startTime = window.startTimestamp;
      if (startTime !== undefined) {
        console.info(`Page loaded within ${Date.now() - startTime}ms.`);
        delete window.startTimestamp;
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
