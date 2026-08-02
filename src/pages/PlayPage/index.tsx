import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowBackIosNewSharpIcon from '@mui/icons-material/ArrowBackIosNewSharp';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import CloseFullscreenSharpIcon from '@mui/icons-material/CloseFullscreenSharp';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import OpenInFullSharpIcon from '@mui/icons-material/OpenInFullSharp';
import Backdrop from '@mui/material/Backdrop';
import IconButton from '@mui/material/IconButton';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { type } from '@tauri-apps/plugin-os';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Tip from '../../components/Tip';
import useSettings from '../../hooks/useSettings';
import { addCloseListener } from '../../utils/closeListener';
import { KeyCode, showShortcutKey } from '../../utils/shortcutKey';
import styles from './index.module.less';

interface IProps {
  open: boolean;
  onClose: () => void;
}

const isMac = type() === 'macos';

export default function PlayPage({ open, onClose }: IProps) {
  const { t } = useTranslation();
  const [settings, _updateSettings] = useSettings();
  const sharp = settings!.personalization.disableRoundCorner;
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (open) document.body.classList.add(styles.hideLogo);
    const unlisten = addCloseListener(async () => {
      await getCurrentWebviewWindow().setFullscreen(false);
    });

    return () => {
      document.body.classList.remove(styles.hideLogo);
      unlisten.then((fn) => fn());
    };
  }, [open]);

  return (
    <Backdrop open={open} invisible>
      <div className={styles.playPage}>
        <header data-tauri-drag-region={!fullscreen} className={styles.header}>
          <Tip
            disabled={!open}
            title={showShortcutKey(t('playPage.back'), KeyCode.Esc)}
          >
            <IconButton
              aria-label={t('playPage.back')}
              style={isMac ? { marginInlineStart: '64px' } : undefined}
              onClick={async () => {
                if (fullscreen) {
                  try {
                    await getCurrentWebviewWindow().setFullscreen(false);
                    setFullscreen(false);
                  } catch (err) {
                    console.error(
                      'Failed to set window fullscreen state: ' + err,
                    );
                  }
                }
                onClose();
              }}
            >
              {sharp ? (
                <ArrowBackIosNewSharpIcon />
              ) : (
                <ArrowBackIosNewRoundedIcon />
              )}
            </IconButton>
          </Tip>
          {window.desktop && !isMac && (
            <Tip
              title={showShortcutKey(
                fullscreen
                  ? t('playPage.exitFullscreen')
                  : t('playPage.fullscreen'),
                'F11',
              )}
            >
              <IconButton
                aria-label={
                  fullscreen
                    ? t('playPage.exitFullscreen')
                    : t('playPage.fullscreen')
                }
                onClick={async () => {
                  try {
                    await getCurrentWebviewWindow().setFullscreen(!fullscreen);
                    setFullscreen(!fullscreen);
                  } catch (err) {
                    console.error(
                      'Failed to set window fullscreen state: ' + err,
                    );
                  }
                }}
              >
                {fullscreen ? (
                  sharp ? (
                    <CloseFullscreenSharpIcon />
                  ) : (
                    <CloseFullscreenRoundedIcon />
                  )
                ) : sharp ? (
                  <OpenInFullSharpIcon />
                ) : (
                  <OpenInFullRoundedIcon />
                )}
              </IconButton>
            </Tip>
          )}
        </header>
        PLAY PAGE
      </div>
    </Backdrop>
  );
}
