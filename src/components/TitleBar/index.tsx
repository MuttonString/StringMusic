import AccountBoxSharpIcon from '@mui/icons-material/AccountBoxSharp';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowBackSharpIcon from '@mui/icons-material/ArrowBackSharp';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowForwardSharpIcon from '@mui/icons-material/ArrowForwardSharp';
import KeyboardReturnRoundedIcon from '@mui/icons-material/KeyboardReturnRounded';
import KeyboardReturnSharpIcon from '@mui/icons-material/KeyboardReturnSharp';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import MenuSharpIcon from '@mui/icons-material/MenuSharp';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import MicSharpIcon from '@mui/icons-material/MicSharp';
import PictureInPictureRoundedIcon from '@mui/icons-material/PictureInPictureRounded';
import PictureInPictureSharpIcon from '@mui/icons-material/PictureInPictureSharp';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SearchSharpIcon from '@mui/icons-material/SearchSharp';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Popover from '@mui/material/Popover';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { type, version } from '@tauri-apps/plugin-os';
import type { MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppIcon from '../../assets/icon.svg?react';
import useDetailHistory from '../../hooks/useDetailHistory';
import useLongPress from '../../hooks/useLongPress';
import useSettings from '../../hooks/useSettings';
import classNames from '../../utils/classNames';
import {
  KeyCode,
  PRIMARY_MODIFIER_KEY,
  showShortcutKey,
} from '../../utils/shortcutKey';
import BrowsingHistory from '../BrowsingHistory';
import NavigatorList from '../NavigatorList';
import Tip from '../Tip';
import styles from './index.module.less';

const hasTrafficLights = type() === 'macos';
const hasRightThreeButtons = window.desktop && !hasTrafficLights;
const isNewSegoeSupported = type() === 'windows' && parseInt(version()) >= 10;

export default function TitleBar() {
  const [settings] = useSettings();
  const { t } = useTranslation();
  const sharp = settings!.personalization.disableRoundCorner;

  const [prevAnchor, setPrevAnchor] = useState<null | HTMLElement>(null);
  const [nextAnchor, setNextAnchor] = useState<null | HTMLElement>(null);
  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState<null | HTMLElement>(null);
  const popoverInputRef = useRef<HTMLInputElement>(null);

  const { prev, next, goBack, goForward } = useDetailHistory();
  const onPrevLongPress = useLongPress(
    (e: MouseEvent<HTMLButtonElement>) => {
      setPrevAnchor(e.target as HTMLButtonElement);
    },
    () => goBack(),
  );
  const onNextLongPress = useLongPress(
    (e: MouseEvent<HTMLButtonElement>) =>
      setNextAnchor(e.target as HTMLButtonElement),
    () => goForward(),
  );

  // 监听macOS的窗口全屏事件
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

    const unlisten = appWindow.onResized(fullscreenHandler).catch((err) => {
      console.error('Can not listen window resize event: ' + err);
    });

    return () => {
      unlisten.then((fn) => fn?.());
    };
  }, []);

  useEffect(() => {
    const handler = () => {
      if (window.innerWidth > 768) {
        setNavigatorOpen(false);
        setSearchAnchor(null);
      }
    };
    window.addEventListener('resize', handler);

    return () => window.removeEventListener('resize', handler);
  });

  return (
    <header data-tauri-drag-region className={styles.titleBar}>
      <div data-tauri-drag-region className={styles.leftPart}>
        <AppIcon
          style={hasLeftMargin ? { marginInlineStart: '64px' } : undefined}
        />
        <span>{t('common.stringMusic')}</span>
      </div>

      <div data-tauri-drag-region className={styles.midPart}>
        <SwipeableDrawer
          open={navigatorOpen}
          onOpen={() => setNavigatorOpen(true)}
          onClose={() => setNavigatorOpen(false)}
        >
          <NavigatorList
            className={styles.navigator}
            onButtonClicked={() => setNavigatorOpen(false)}
          />
        </SwipeableDrawer>
        <Tip title={t('titleBar.navigator')}>
          <IconButton
            size='small'
            className={classNames(styles.extraBtn, styles.menuBtn)}
            onClick={() => setNavigatorOpen(true)}
          >
            {sharp ? <MenuSharpIcon /> : <MenuRoundedIcon />}
          </IconButton>
        </Tip>

        <Tip
          disabled={prev.length === 0}
          title={
            <>
              {showShortcutKey(t('titleBar.back'), KeyCode.Alt, KeyCode.Left)}
              <br />
              {t('titleBar.showHistory')}
            </>
          }
        >
          <IconButton
            aria-label={t('titleBar.back')}
            size='small'
            className={styles.browserBtn}
            disabled={prev.length === 0}
            {...onPrevLongPress}
          >
            {sharp ? <ArrowBackSharpIcon /> : <ArrowBackRoundedIcon />}
          </IconButton>
        </Tip>
        <Tip
          disabled={next.length === 0}
          title={
            <>
              {showShortcutKey(
                t('titleBar.forward'),
                KeyCode.Alt,
                KeyCode.Right,
              )}
              <br />
              {t('titleBar.showHistory')}
            </>
          }
        >
          <IconButton
            aria-label={t('titleBar.forward')}
            size='small'
            className={styles.browserBtn}
            disabled={next.length === 0}
            {...onNextLongPress}
          >
            {sharp ? <ArrowForwardSharpIcon /> : <ArrowForwardRoundedIcon />}
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

        <Tip title={showShortcutKey('', PRIMARY_MODIFIER_KEY, 'E')}>
          <OutlinedInput
            aria-label={t('titleBar.search')}
            size='small'
            fullWidth
            className={styles.search}
            placeholder={t('titleBar.search')}
            startAdornment={
              <IconButton
                aria-label={t('titleBar.search')}
                tabIndex={-1}
                size='small'
              >
                {sharp ? (
                  <SearchSharpIcon fontSize='small' />
                ) : (
                  <SearchRoundedIcon fontSize='small' />
                )}
              </IconButton>
            }
          />
        </Tip>

        <Tip
          title={showShortcutKey(
            t('titleBar.search'),
            PRIMARY_MODIFIER_KEY,
            'E',
          )}
        >
          <IconButton
            aria-label={t('titleBar.search')}
            size='small'
            className={styles.extraBtn}
            onClick={(e) => {
              setSearchAnchor(e.currentTarget);
              setTimeout(() => popoverInputRef.current!.focus(), 0);
            }}
          >
            {sharp ? <SearchSharpIcon /> : <SearchRoundedIcon />}
          </IconButton>
        </Tip>
        <Popover
          open={!!searchAnchor}
          anchorEl={searchAnchor}
          onClose={() => setSearchAnchor(null)}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <div className={styles.popover}>
            <Input
              placeholder={t('titleBar.search')}
              fullWidth
              className={styles.search}
              inputRef={popoverInputRef}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label={t('titleBar.search')}
                    tabIndex={-1}
                    size='small'
                  >
                    {sharp ? (
                      <KeyboardReturnSharpIcon fontSize='small' />
                    ) : (
                      <KeyboardReturnRoundedIcon fontSize='small' />
                    )}
                  </IconButton>
                </InputAdornment>
              }
            />
          </div>
        </Popover>

        <Tip
          title={showShortcutKey(
            t('titleBar.songRecognition'),
            PRIMARY_MODIFIER_KEY,
            KeyCode.Shift,
            'E',
          )}
        >
          <IconButton aria-label={t('titleBar.songRecognition')} size='small'>
            {sharp ? <MicSharpIcon /> : <MicRoundedIcon />}
          </IconButton>
        </Tip>
      </div>

      <div
        data-tauri-drag-region
        className={styles.rightPart}
        style={{
          marginInlineEnd: hasRightThreeButtons
            ? 'calc(3 * var(--title-bar-btn-width))'
            : undefined,
        }}
      >
        <Tip title={t('titleBar.accounts')}>
          <IconButton size='small'>
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
          </IconButton>
        </Tip>
        {window.desktop && (
          <Tip
            title={showShortcutKey(
              t('titleBar.miniWindow'),
              PRIMARY_MODIFIER_KEY,
              'M',
            )}
          >
            <button
              aria-label={t('titleBar.miniWindow')}
              className={classNames(
                'decorum-tb-btn',
                isNewSegoeSupported
                  ? styles.miniWindowSegoe
                  : styles.miniWindow,
                isNewSegoeSupported && sharp && styles.miniWindowSegoeSharp,
              )}
              onClick={() => {
                // todo
              }}
            >
              {isNewSegoeSupported ? (
                '\uee49'
              ) : sharp ? (
                <PictureInPictureSharpIcon fontSize='small' />
              ) : (
                <PictureInPictureRoundedIcon fontSize='small' />
              )}
            </button>
          </Tip>
        )}
      </div>
    </header>
  );
}
