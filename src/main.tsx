import { debug, error, info, trace, warn } from '@tauri-apps/plugin-log';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import SettingsProvider from './components/SettingsProvider';
import router from './utils/router';

function forwardConsole(
  fnName: 'log' | 'debug' | 'info' | 'warn' | 'error',
  logger: (message: string) => Promise<void>,
) {
  const original = console[fnName];
  if (fnName === 'log') {
    console.log = function (...args) {
      const filtered = args.filter((arg) => {
        return !(typeof arg === 'string' && /^DECORUM/.test(arg));
      });
      if (filtered.length) {
        original(...filtered);
        logger(JSON.stringify(filtered[0]));
      }
    };
    return;
  }

  console[fnName] = (message) => {
    original(message);
    logger(message);
  };
}

forwardConsole('log', trace);
forwardConsole('debug', debug);
forwardConsole('info', info);
forwardConsole('warn', warn);
forwardConsole('error', error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </React.StrictMode>,
);
