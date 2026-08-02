import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { prefixer } from 'stylis';
import './App.less';
import DetailHistoryProvider from './components/DetailHistoryProvider';
import useSettings from './hooks/useSettings';
import { ColorMode } from './types/settings';
import {
  getPrimaryColor,
  isDarkMode,
  listenColorMode,
  listenPrimaryColor,
} from './utils/color';
import i18n from './utils/i18n';

interface IProps {
  children: ReactNode;
}

export default function App({ children }: IProps) {
  const [settings] = useSettings();
  const [theme, setTheme] = useState(createTheme());

  const isDevOptEnabled = settings?.developerOptions.enabled;
  const direction =
    isDevOptEnabled && settings.developerOptions.forceRTL ? 'rtl' : i18n.dir();
  const colorMode = settings?.personalization.colorMode;
  const autoColor = settings?.personalization.primaryColor.followSystem;
  const duration = settings?.personalization.animationDuration ?? 1;

  const updateTheme = useCallback(async () => {
    let hex = settings?.personalization.primaryColor.hex;
    if (!hex) return;

    if (autoColor) {
      try {
        hex = await getPrimaryColor();
      } catch (err) {
        console.error('Failed to get system promary color: ' + err);
      }
    }

    document.documentElement.dir = direction;
    let defaultColorScheme: 'dark' | 'light';
    switch (colorMode) {
      case ColorMode.FollowSystem:
        defaultColorScheme = isDarkMode() ? 'dark' : 'light';
        break;
      case ColorMode.Light:
        defaultColorScheme = 'light';
        break;
      case ColorMode.Dark:
        defaultColorScheme = 'dark';
        break;
      default:
        defaultColorScheme = 'light';
    }

    if (colorMode !== ColorMode.FollowSystem) {
      getCurrentWebviewWindow().setTheme(defaultColorScheme);
    }

    setTheme(
      createTheme({
        cssVariables: true,
        direction,
        defaultColorScheme,
        palette: {
          primary: { main: hex },
          secondary: { main: hex },
        },
        shape: {
          borderRadius: 8,
        },
        transitions: {
          duration: {
            shortest: 150 * duration,
            shorter: 200 * duration,
            short: 250 * duration,
            standard: 300 * duration,
            complex: 375 * duration,
            enteringScreen: 225 * duration,
            leavingScreen: 195 * duration,
          },
        },
        components: {
          MuiPopover: {
            defaultProps: { transitionDuration: 150 * duration },
          },

          MuiButton: {
            styleOverrides: {
              root: { textTransform: 'unset' },
            },
          },
          MuiDrawer: {
            defaultProps: {
              sx: {
                '& .MuiBackdrop-root': { backgroundColor: 'transparent' },
              },
            },
            styleOverrides: {
              paper: {
                border: '1px solid var(--mui-palette-divider)',
                borderRadius: '8px',
                height: 'calc(100% - 16px)',
                margin: '8px',
                boxShadow: 'var(--mui-shadows-24)',
              },
            },
          },
          MuiSlider: {
            styleOverrides: {
              valueLabel: {
                borderRadius: '8px',
              },
            },
          },
        },
      }),
    );
  }, [
    settings?.personalization.primaryColor.hex,
    autoColor,
    direction,
    colorMode,
    duration,
  ]);

  useEffect(() => {
    updateTheme();
  }, [updateTheme]);

  useEffect(() => {
    if (colorMode !== ColorMode.FollowSystem) return;
    return listenColorMode(updateTheme);
  }, [colorMode, updateTheme]);

  useEffect(() => {
    if (!autoColor) return;
    const unlisten = listenPrimaryColor(updateTheme);
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [autoColor, updateTheme]);

  const cache = useMemo(
    () =>
      createCache({
        key: direction,
        stylisPlugins: direction === 'rtl' ? [prefixer, rtlPlugin] : [prefixer],
      }),
    [direction],
  );

  return (
    settings && (
      <DetailHistoryProvider>
        <CacheProvider value={cache}>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </CacheProvider>
      </DetailHistoryProvider>
    )
  );
}
