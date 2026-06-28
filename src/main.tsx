import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import SettingsProvider from './components/SettingsProvider';
import router from './utils/router';

// 如需在浏览器控制台查看输出的准确来源，注释下一行以关闭日志功能
import './utils/log';

console.info('Creating React DOM...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </React.StrictMode>,
);
