import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { type } from '@tauri-apps/plugin-os';
import { useEffect, useState } from 'react';

const isWindows = type() === 'windows';
const icons = isWindows
  ? ['\u0030', '\u0031', '\u0032', '\u0072']
  : ['🗕', '🗖', '🗗', '🗙'];
const commonProps = {
  tabIndex: -1,
  className: 'decorum-tb-btn',
  style: {
    fontSize: '1rem',
    fontFamily: isWindows ? 'Webdings' : undefined,
  },
};

export default function PlainControlButtons() {
  const appWindow = getCurrentWebviewWindow();
  const [isMax, setIsMax] = useState(false);
  const [maxDisabled, setMaxDisabled] = useState(false);

  useEffect(() => {
    const handleMaximize = () => {
      appWindow
        .isMaximized()
        .then(setIsMax)
        .catch((err) => console.error('Failed to get window state: ' + err));

      appWindow
        .isFullscreen()
        .then((val) => {
          setMaxDisabled(val);
          appWindow.setResizable(!val);
        })
        .catch((err) => console.error('Failed to get window state: ' + err));
    };

    const unlisten = appWindow.onResized(handleMaximize).catch((err) => {
      console.error('Can not listen window resize event: ' + err);
    });

    return () => {
      unlisten.then((fn) => fn?.());
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
        onClick={() => appWindow.minimize()}
        {...commonProps}
      >
        {icons[0]}
      </button>
      <button
        id='decorum-tb-maximize'
        onClick={() => appWindow.toggleMaximize()}
        disabled={maxDisabled}
        {...commonProps}
      >
        {isMax ? icons[2] : icons[1]}
      </button>
      <button
        id='decorum-tb-close'
        onClick={() => appWindow.close()}
        {...commonProps}
      >
        {icons[3]}
      </button>
    </>
  );
}
