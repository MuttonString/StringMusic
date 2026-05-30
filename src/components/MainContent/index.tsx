import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { message } from '@tauri-apps/plugin-dialog';
import { arch, locale, platform, version } from '@tauri-apps/plugin-os';
import { exit } from '@tauri-apps/plugin-process';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useOutlet } from 'react-router';
import { CSSTransition, SwitchTransition } from 'react-transition-group';
import useDetailHistory from '../../hooks/useDetailHistory';
import useSettings from '../../hooks/useSettings';
import { PageAnimation } from '../../types/history';
import Message from '../Message';
import styles from './index.module.less';

const getAnimation = (animationType?: PageAnimation) => {
  switch (animationType) {
    case PageAnimation.Forward:
      return {
        exit: styles.pageExitForward,
        exitActive: styles.pageExitActiveForward,
        enter: styles.pageEnterForward,
        enterActive: styles.pageEnterActiveForward,
      };
    case PageAnimation.Back:
      return {
        exit: styles.pageExitBack,
        exitActive: styles.pageExitActiveBack,
        enter: styles.pageEnterBack,
        enterActive: styles.pageEnterActiveBack,
      };
    case PageAnimation.New:
      return {
        exit: styles.pageExitNew,
        exitActive: styles.pageExitActiveNew,
        enter: styles.pageEnterNew,
        enterActive: styles.pageEnterActiveNew,
      };
  }
};

export default function MainContent() {
  const outlet = useOutlet();
  const { animation } = useDetailHistory();
  const nodeRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const [settings] = useSettings();
  const [warningOpen, setWarningOpen] = useState(false);
  const { t } = useTranslation();
  const onceRef = useRef(false);

  useEffect(() => {
    if (!settings || onceRef.current) return;
    onceRef.current = true;

    const showMainWindow = async () => {
      const mainWindow = getCurrentWindow();
      try {
        await mainWindow.show();
        if (settings!.windowState.main.maximized) {
          // 为防止最大化按钮图标出错，在显示窗口后再最大化
          mainWindow.maximize();
        }
        const startTime = (window as any).startTimestamp;
        if (startTime !== undefined) {
          console.info(`Page loaded within ${Date.now() - startTime}ms.`);
          delete (window as any).startTimestamp;

          try {
            console.info(`OS info: ${platform()} ${version()} (${arch()})`);
            console.info('WebView version: ' + (await invoke('webview_ver')));
            console.info('Locale: ' + (await locale()));
          } catch (err) {
            console.error('Getting system infomation failed: ' + err);
          }
        }
      } catch (err) {
        console.error('Launch failed: ' + err);
        message(`Launch failed.\n${err}`, {
          title: 'String Music',
          kind: 'error',
        }).finally(exit);
      }
    };
    showMainWindow();

    if (
      !CSS.supports(
        `(${['gap: 0', 'overflow: visible', 'background: linear-gradient(#000)', 'mix-blend-mode: difference', 'width: fit-content', 'selector(:focus-visible)'].join(') and (')})`,
      )
    ) {
      setWarningOpen(true);
    }
  }, [settings]);

  return (
    <main className={styles.mainContent}>
      <SwitchTransition>
        <CSSTransition
          nodeRef={nodeRef}
          key={location.key}
          timeout={225}
          classNames={getAnimation(animation)}
        >
          <div ref={nodeRef}>{outlet}</div>
        </CSSTransition>
      </SwitchTransition>
      <Message
        open={warningOpen}
        onClose={() => setWarningOpen(false)}
        type='warning'
        autoHideDuration={10000}
        message={t('msg.webviewVersionWarning')}
      />
    </main>
  );
}
