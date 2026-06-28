import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import rtlPlugin from '@mui/stylis-plugin-rtl';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import i18next from 'i18next';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'simplebar-react/dist/simplebar.min.css';
import { prefixer } from 'stylis';
import './App.less';
import DetailHistoryProvider from './components/DetailHistoryProvider';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import SideBar from './components/SideBar';
import TitleBar from './components/TitleBar';
import useSettings from './hooks/useSettings';
import { ColorMode } from './types/settings';
import { isDarkMode, listenColorMode } from './utils/color';
import './utils/i18n';
import './utils/titleBarImpovement';

function App() {
  const { t } = useTranslation();
  const [settings] = useSettings();
  const [theme, setTheme] = useState(createTheme({ cssVariables: true }));

  const isDevOptEnabled = settings?.developerOptions.enabled;
  const dir = t('dir').toLowerCase(); // TODO 后续改成从JSON文件direction取值
  const direction =
    isDevOptEnabled && settings.developerOptions.forceRTL
      ? 'rtl'
      : ['ltr', 'rtl'].includes(dir)
        ? (dir as 'ltr' | 'rtl')
        : i18next.dir(t('lang')); // TODO 后续改成从JSON文件languageCode取值
  const colorMode = settings?.personalization.colorMode;
  const mainColor = settings?.personalization.primaryColor.hex;

  const updateTheme = useCallback(() => {
    if (!mainColor) return;

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
          primary: { main: mainColor },
          secondary: { main: mainColor },
        },
      }),
    );
  }, [direction, colorMode, mainColor]);

  useEffect(updateTheme, [updateTheme]);

  useEffect(() => {
    if (colorMode !== ColorMode.FollowSystem) return;
    return listenColorMode(updateTheme);
  }, [colorMode, updateTheme]);

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
          <ThemeProvider theme={theme}>
            <TitleBar onToggleMiniWindow={() => {}} />
            <div id='client-area'>
              <SideBar />
              <MainContent />
            </div>
            {settings.developerOptions.enabled &&
              settings.developerOptions.showFooter && <Footer />}
          </ThemeProvider>
        </CacheProvider>
      </DetailHistoryProvider>
    )
  );
}

export default App;
