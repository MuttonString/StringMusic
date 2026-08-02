import { getCurrentWindow } from '@tauri-apps/api/window';

let listenerCnt = 0;
const appWindow = getCurrentWindow();

/**
 * 添加窗口关闭事件的监听器
 */
export async function addCloseListener(fn: () => Promise<void>) {
  listenerCnt++;
  const unlisten = await appWindow.onCloseRequested(async (e) => {
    e.preventDefault();
    await fn();
    if (--listenerCnt === 0) {
      appWindow.destroy();
    }
  });

  return () => {
    unlisten();
    listenerCnt--;
  };
}
