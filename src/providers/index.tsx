import { StrictMode } from 'react';
import '../app/log';
import '../app/shortcutKey';
import type { ChildrenProp } from '../types/component';
import { ConfigProvider } from './ConfigProvider';
import StyleProvider from './StyleProvider';

export default function MainProvider({ children }: ChildrenProp) {
  return (
    <StrictMode>
      <ConfigProvider>
        <StyleProvider>{children}</StyleProvider>
      </ConfigProvider>
    </StrictMode>
  );
}
