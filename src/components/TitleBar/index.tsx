import AccountBoxSharpIcon from '@mui/icons-material/AccountBoxSharp';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowForwardSharpIcon from '@mui/icons-material/ArrowForwardSharp';
import FeaturedVideoRoundedIcon from '@mui/icons-material/FeaturedVideoRounded';
import FeaturedVideoSharpIcon from '@mui/icons-material/FeaturedVideoSharp';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicSharpIcon from '@mui/icons-material/MicSharp';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SearchSharpIcon from '@mui/icons-material/SearchSharp';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { platform } from '@tauri-apps/plugin-os';
import type { MouseEvent } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppIcon from '../../assets/icon.svg?react';
import useDetailHistory from '../../hooks/useDetailHistory';
import useLongClick from '../../hooks/useLongClick';
import useSettings from '../../hooks/useSettings';
import showShortcutKey from '../../utils/showShortcutKey';
import BrowsingHistory from '../BrowsingHistory';
import Tip from '../Tip';
import styles from './index.module.less';

interface IProps {
  onToggleMiniWindow: () => void;
}

const hasTrafficLights = platform() === 'macos';
const hasRightThreeButtons = platform() === 'windows';

export default function TitleBar(props: IProps) {
  const [settings] = useSettings();
  const { t } = useTranslation();
  const { onToggleMiniWindow } = props;
  const sharp = settings?.personalization.disableRoundCorner;

  const [prevAnchor, setPrevAnchor] = useState<null | HTMLElement>(null);
  const [nextAnchor, setNextAnchor] = useState<null | HTMLElement>(null);

  const { prev, next, goBack, goForward } = useDetailHistory();
  const onPrevLongClick = useLongClick(
    (e: MouseEvent<HTMLButtonElement>) => {
      setPrevAnchor(e.target as HTMLButtonElement);
      e.preventDefault();
    },
    () => goBack(),
  );
  const onNextLongClick = useLongClick(
    (e: MouseEvent<HTMLButtonElement>) => {
      setNextAnchor(e.target as HTMLButtonElement);
      e.preventDefault();
    },
    () => goForward(),
  );

  const [hasLeftMargin, setHasLeftMargin] = useState(hasTrafficLights);
  useEffect(() => {
    if (!hasTrafficLights) return;

    const appWindow = getCurrentWebviewWindow();
    const fullscreenHandler = async () => {
      try {
        setHasLeftMargin(!(await appWindow.isFullscreen()));
      } catch (err) {
        console.error('Failed to get window fullscreen state: ' + err);
        setHasLeftMargin(true);
      }
    };
    fullscreenHandler();

    let unlisten;
    appWindow
      .onResized(fullscreenHandler)
      .then((fn) => (unlisten = fn))
      .catch((err) => {
        console.error('Can not listen window resize event: ' + err);
      });

    return unlisten;
  }, []);

  return (
    <header data-tauri-drag-region className={styles.titleBar}>
      <div data-tauri-drag-region className={styles.leftPart}>
        <AppIcon
          style={hasLeftMargin ? { marginInlineStart: '64px' } : undefined}
        />
        <span>{t('titleBar.stringMusic')}</span>
      </div>

      <div data-tauri-drag-region className={styles.midPart}>
        <Tip
          disabled={prev.length === 0}
          title={
            showShortcutKey(t('titleBar.back'), 'alt', 'left') +
            t('titleBar.showHistory')
          }
        >
          <IconButton
            aria-label={t('titleBar.back')}
            className={styles.btn}
            disabled={prev.length === 0}
            {...onPrevLongClick}
          >
            {sharp ? (
              <ArrowBackSharpIcon fontSize='small' />
            ) : (
              <ArrowBackRoundedIcon fontSize='small' />
            )}
          </IconButton>
        </Tip>
        <Tip
          disabled={next.length === 0}
          title={
            showShortcutKey(t('titleBar.forward'), 'alt', 'right') +
            t('titleBar.showHistory')
          }
        >
          <IconButton
            aria-label={t('titleBar.forward')}
            className={styles.btn}
            disabled={next.length === 0}
            {...onNextLongClick}
          >
            {sharp ? (
              <ArrowForwardSharpIcon fontSize='small' />
            ) : (
              <ArrowForwardRoundedIcon fontSize='small' />
            )}
          </IconButton>
        </Tip>
        <BrowsingHistory
          isBack
          anchorEl={prevAnchor}
          onClose={() => setPrevAnchor(null)}
        />
        <BrowsingHistory
          isBack={false}
          anchorEl={nextAnchor}
          onClose={() => setNextAnchor(null)}
        />

        <Tip title={showShortcutKey('', 'ctrl', 'e')}>
          <Input
            aria-label={t('titleBar.search')}
            className={styles.search}
            size='small'
            placeholder={t('titleBar.search')}
            endAdornment={
              <InputAdornment position='end'>
                <IconButton aria-label={t('titleBar.search')}>
                  {sharp ? (
                    <SearchSharpIcon fontSize='small' />
                  ) : (
                    <SearchRoundedIcon fontSize='small' />
                  )}
                </IconButton>
              </InputAdornment>
            }
          />
        </Tip>

        <Tip
          title={showShortcutKey(
            t('titleBar.songRecognition'),
            'ctrl',
            'shift',
            'e',
          )}
        >
          <IconButton
            aria-label={t('titleBar.songRecognition')}
            className={styles.btn}
          >
            {sharp ? (
              <MicSharpIcon fontSize='small' />
            ) : (
              <MicRoundedIcon fontSize='small' />
            )}
          </IconButton>
        </Tip>
      </div>

      <div
        data-tauri-drag-region
        className={styles.rightPart}
        style={{
          marginInlineEnd: hasRightThreeButtons
            ? 'calc(3 * var(--title-bar-btn-width, 48px))'
            : undefined,
        }}
      >
        <Tip title={t('titleBar.accounts')}>
          <button className='decorum-tb-btn' onDrag={() => false}>
            <Avatar
              src={
                'https://i0.hdslb.com/bfs/face/84ed014dc45788a0f5ed1a672d2cb00f929e9f23.jpg'
              }
              sx={{
                width: '32px',
                height: '32px',
              }}
            >
              {sharp ? <AccountBoxSharpIcon /> : <AccountCircleRoundedIcon />}
            </Avatar>
          </button>
        </Tip>
        <Tip title={showShortcutKey(t('titleBar.miniWindow'), 'ctrl', 'm')}>
          <button
            aria-label={t('titleBar.miniWindow')}
            className={`decorum-tb-btn ${styles.miniWindowBtn}`}
            onClick={() => {
              onToggleMiniWindow();
            }}
          >
            {sharp ? <FeaturedVideoSharpIcon /> : <FeaturedVideoRoundedIcon />}
          </button>
        </Tip>
      </div>
    </header>
  );
}
