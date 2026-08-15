import { invoke } from '@tauri-apps/api/core';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { type, version } from '@tauri-apps/plugin-os';
import ReactDOM from 'react-dom/client';
import PlainControlButtons from '../components/shared/PlainControlButtons';
import { IS_DESKTOP } from '../constants/os';

if (IS_DESKTOP) {
  document.documentElement.classList.add('desktop');
  if (!document.querySelector('vody > div[data-tauri-decorum-tb]')) {
    invoke('create_titlebar');
  }
}

const appWindow = getCurrentWebviewWindow();

// 窗口失去焦点时的样式变化
appWindow.isFocused().then((val) => {
  if (!val) document.body.classList.add('lose-focus');
});

appWindow.onFocusChanged((e) => {
  if (e.payload) {
    document.body.classList.remove('lose-focus');
  } else {
    document.body.classList.add('lose-focus');
  }
});

// 全屏时的样式变化
appWindow.onResized(async () => {
  const fullscreen = await appWindow.isFullscreen();
  if (fullscreen) document.body.classList.add('fullscreeen');
  else document.body.classList.remove('fullscreeen');
});

if (['windows', 'linux'].includes(type())) {
  const observer = new MutationObserver(() => {
    const container = document.querySelector(
      'body > div[data-tauri-decorum-tb]',
    );
    if (!container) return;

    if (type() === 'windows' && parseInt(version()) >= 10) {
      const maxBtn: HTMLButtonElement | null = container.querySelector(
        '#decorum-tb-maximize',
      );
      if (!maxBtn) return;
      observer.disconnect();

      // 禁止窗口三按键被Tab选中
      container.querySelectorAll('button').forEach((btn) => {
        btn.tabIndex = -1;
        btn.classList.add('original');
      });

      // 修复最大化窗口的还原按钮图标bug
      appWindow.isMaximized().then((val) => {
        if (val) {
          container.querySelector('#decorum-tb-maximize')!.innerHTML = '\ue923';
        }
      });

      appWindow.onResized(() =>
        appWindow.isFullscreen().then((val) => {
          maxBtn.disabled = val;
          appWindow.setResizable(!val);
        }),
      );
    } else {
      observer.disconnect();

      // 对于未预装新Segoe图标字体的Windows系统，及Linux系统，覆盖掉decorum生成的三按钮以避免bug
      container.innerHTML = '';
      ReactDOM.createRoot(container).render(<PlainControlButtons />);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
  });
}
