import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { type } from '@tauri-apps/plugin-os';
import { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

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

if (type() === 'windows') {
  // 修复最大化窗口的还原按钮图标bug
  const observer = new MutationObserver(() => {
    const maxBtn = document.getElementById('decorum-tb-maximize');
    if (maxBtn) {
      observer.disconnect();
      appWindow
        .isMaximized()
        .then((val) => {
          if (val) {
            maxBtn.innerHTML = '\ue923';
          }
        })
        .catch((err) => console.error('Failed to get window state: ' + err));
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
  });
} else if (type() === 'linux') {
  // decorum为Linux生成的三按钮可能有bug，覆盖掉
  const observer = new MutationObserver(() => {
    const container = document.querySelector(
      'body > div[data-tauri-decorum-tb]',
    )!;
    if (container) {
      observer.disconnect();
      container.innerHTML = '';

      const Controls = () => {
        const appWindow = getCurrentWebviewWindow();
        const [isMax, setIsMax] = useState(false);

        useEffect(() => {
          const handleMaximize = () =>
            appWindow
              .isMaximized()
              .then(setIsMax)
              .catch((err) =>
                console.error('Failed to get window state: ' + err),
              );

          const unlisten = appWindow.onResized(handleMaximize).catch((err) => {
            console.error('Can not listen window resize event: ' + err);
          });

          return () => {
            unlisten.then((val) => val?.());
          };
        }, [appWindow]);

        return (
          <>
            <div
              data-tauri-drag-region
              style={{
                width: '100%',
                height: '100%',
                background: 'transparent',
              }}
            />
            <button
              id='decorum-tb-minimize'
              className='decorum-tb-btn'
              onClick={() => appWindow.minimize()}
            >
              🗕
            </button>
            <button
              id='decorum-tb-maximize'
              className='decorum-tb-btn'
              onClick={() => appWindow.toggleMaximize()}
            >
              {isMax ? '🗗' : '🗖'}
            </button>
            <button
              id='decorum-tb-close'
              className='decorum-tb-btn'
              onClick={() => appWindow.close()}
            >
              🗙
            </button>
          </>
        );
      };

      ReactDOM.createRoot(container).render(<Controls />);
    }
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
  });
}
