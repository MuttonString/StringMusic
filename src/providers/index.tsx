import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { type } from '@tauri-apps/plugin-os';
import { StrictMode } from 'react';
import '../app/log';
import '../app/shortcutKey';
import { WINDOW_LABEL } from '../constants/window';
import type { ChildrenProp } from '../types/component';
import { AudioProvider } from './AudioProvider';
import { ConfigProvider } from './ConfigProvider';
import { SnackbarProvider } from './SnackbarProvider';
import StyleProvider from './StyleProvider';

await getCurrentWebviewWindow().show();
if (type() === 'windows' && WINDOW_LABEL === 'main') {
  await invoke('init_thumbnail_buttons');
}

export default function MainProvider({ children }: ChildrenProp) {
  return (
    <StrictMode>
      <ConfigProvider>
        <StyleProvider>
          <SnackbarProvider>
            <AudioProvider>{children}</AudioProvider>
          </SnackbarProvider>
        </StyleProvider>
      </ConfigProvider>
    </StrictMode>
  );
}
