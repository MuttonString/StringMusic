import { debug, error, info, trace, warn } from '@tauri-apps/plugin-log';

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
        // 重写原生console会导致浏览器控制台无法查看输出的准确来源，如有需要可在main.tsx中取消引用本文件
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
