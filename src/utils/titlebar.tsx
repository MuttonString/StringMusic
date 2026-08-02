import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { type, version } from '@tauri-apps/plugin-os';
import ReactDOM from 'react-dom/client';
import PlainControlButtons from '../components/PlainControlButtons';

// 桌面环境下，打开弹窗时让标题栏可拖动
if (window.desktop) {
  document.documentElement.classList.add('desktop-env');
}

const appWindow = getCurrentWebviewWindow();

// 窗口失去焦点时的样式变化
appWindow
  .isFocused()
  .then((val) => {
    if (!val) document.body.classList.add('blur');
  })
  .catch((err) => console.error('Failed to get window focus state: ' + err));

appWindow
  .onFocusChanged((e) => {
    if (e.payload) {
      document.body.classList.remove('blur');
    } else {
      document.body.classList.add('blur');
    }
  })
  .catch((err) => console.error('Can not listen focus changed event: ' + err));

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
      container.parentElement!.querySelectorAll('button').forEach((btn) => {
        btn.tabIndex = -1;
        btn.classList.add('original');
      });

      // 修复最大化窗口的还原按钮图标bug
      appWindow
        .isMaximized()
        .then((val) => {
          if (val) {
            container.querySelector('#decorum-tb-maximize')!.innerHTML =
              '\ue923';
          }
        })
        .catch((err) => console.error('Failed to get window state: ' + err));

      appWindow.onResized(() =>
        appWindow
          .isFullscreen()
          .then((val) => {
            maxBtn.disabled = val;
            appWindow.setResizable(!val);
          })
          .catch((err) => console.error('Failed to get window state: ' + err)),
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
