import AccountBoxSharpIcon from '@mui/icons-material/AccountBoxSharp';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import { type, version } from '@tauri-apps/plugin-os';
import classnames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppIcon from '../../../assets/icon.svg?react';
import { BASE_COMPONENT } from '../../../constants/animation';
import { PRIMARY_MODIFIER_KEY } from '../../../constants/keys';
import { IS_APPLE, IS_DESKTOP } from '../../../constants/os';
import { MD_WIDTH, SIDE_BAR_WIDTH } from '../../../constants/window';
import useWidthQuery from '../../../hooks/useWidthQuery';
import { useConfig } from '../../../providers/ConfigProvider';
import { useNavigator } from '../../../providers/NavigatorProvider';
import { KeyCode } from '../../../types/keyCode';
import { showShortcutKey } from '../../../utils/shortcutKey';
import MaterialIcon from '../../ui/MaterialIcon';
import Tip from '../../ui/Tip';
import NavigatorList from '../NavigatorList';

const isNewSegoeSupported = type() === 'windows' && parseInt(version()) >= 10;

export default function TitleBar() {
  const [config] = useConfig();
  const wide = useWidthQuery(MD_WIDTH);
  const { goBack, goForward, canGoBack, canGoForward } = useNavigator();
  const { t } = useTranslation();
  const sharp = config.sharpStyle;

  const [navigatorOpen, setNavigatorOpen] = useState(false);
  const [searchAnchor, setSearchAnchor] = useState<null | HTMLElement>(null);
  const popoverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = () => {
      setNavigatorOpen(false);
      setSearchAnchor(null);
    };

    if (wide) {
      close();
    } else {
      const draggableBar = document.querySelector('div[data-tauri-decorum-tb]');
      if (!draggableBar) return;
      // 在通过点击标题栏内的按钮打开弹出式组件时，再次点击标题栏应当关掉它们
      draggableBar.addEventListener('pointerdown', close);
      return () => draggableBar.removeEventListener('pointerdown', close);
    }
  }, [wide]);

  return (
    <header
      data-tauri-drag-region
      className='w-full h-(--title-bar-height) flex items-center justify-between **:z-101'
    >
      <AnimatePresence>
        {wide && (
          <motion.div
            layout
            variants={BASE_COMPONENT}
            custom={{ w: SIDE_BAR_WIDTH, ps: '12px' }}
            initial='hidden'
            whileInView='visible'
            exit='hidden'
            className='overflow-clip flex items-center gap-2 pointer-events-none whitespace-nowrap'
          >
            <AppIcon className='min-w-6 h-6' />
            <span>{t('common.stringMusic')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        data-tauri-drag-region
        className='w-full h-(--title-bar-height) flex items-center'
      >
        <SwipeableDrawer
          open={navigatorOpen}
          onOpen={() => setNavigatorOpen(true)}
          onClose={() => setNavigatorOpen(false)}
        >
          <NavigatorList
            className='w-(--side-bar-width)!'
            onButtonClicked={() => setNavigatorOpen(false)}
          />
        </SwipeableDrawer>
        {!wide && (
          <Tip title={t('titleBar.navigator')}>
            <IconButton
              size='small'
              className='ms-1!'
              onClick={() => setNavigatorOpen(true)}
            >
              <MaterialIcon name='menu' />
            </IconButton>
          </Tip>
        )}

        <Tip
          disabled={!canGoBack}
          title={showShortcutKey(t('titleBar.back'), KeyCode.Alt, KeyCode.Left)}
        >
          <IconButton
            aria-label={t('titleBar.back')}
            size='small'
            className='rtl:-scale-x-100'
            disabled={!canGoBack}
            onClick={goBack}
          >
            <MaterialIcon name='arrowBack' />
          </IconButton>
        </Tip>
        <Tip
          disabled={!canGoForward}
          title={showShortcutKey(
            t('titleBar.forward'),
            KeyCode.Alt,
            KeyCode.Right,
          )}
        >
          <IconButton
            aria-label={t('titleBar.forward')}
            size='small'
            className='rtl:-scale-x-100'
            disabled={!canGoForward}
            onClick={goForward}
          >
            <MaterialIcon name='arrowForward' />
          </IconButton>
        </Tip>

        {wide && (
          <Tip title={showShortcutKey('', PRIMARY_MODIFIER_KEY, 'E')}>
            <Input
              aria-label={t('titleBar.search')}
              size='small'
              fullWidth
              className='max-w-50 ms-8'
              placeholder={t('titleBar.search')}
              startAdornment={
                <IconButton
                  aria-label={t('titleBar.search')}
                  tabIndex={-1}
                  size='small'
                >
                  <MaterialIcon name='search' fontSize='small' />
                </IconButton>
              }
            />
          </Tip>
        )}

        {!wide && (
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
              onClick={(e) => {
                setSearchAnchor(e.currentTarget);
                setTimeout(() => popoverInputRef.current!.focus(), 0);
              }}
            >
              <MaterialIcon name='search' />
            </IconButton>
          </Tip>
        )}
        <Popover
          open={!!searchAnchor}
          anchorEl={searchAnchor}
          onClose={() => setSearchAnchor(null)}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          <div className='p-2 w-50'>
            <Input
              placeholder={t('titleBar.search')}
              fullWidth
              inputRef={popoverInputRef}
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton
                    aria-label={t('titleBar.search')}
                    tabIndex={-1}
                    size='small'
                  >
                    <MaterialIcon name='keyboardReturn' fontSize='small' />
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
            <MaterialIcon name='mic' />
          </IconButton>
        </Tip>
      </div>

      <div
        data-tauri-drag-region
        className={classnames(
          'flex',
          IS_DESKTOP && !IS_APPLE && 'me-[calc(3*var(--title-bar-btn-width))]',
        )}
      >
        <Tip title={t('titleBar.accounts')}>
          <IconButton size='small'>
            <Avatar
              src={
                'https://i0.hdslb.com/bfs/face/84ed014dc45788a0f5ed1a672d2cb00f929e9f23.jpg'
              }
              sx={{
                width: '2rem',
                height: '2rem',
              }}
            >
              {sharp ? <AccountBoxSharpIcon /> : <AccountCircleRoundedIcon />}
            </Avatar>
          </IconButton>
        </Tip>
        {IS_DESKTOP && (
          <Tip
            title={showShortcutKey(
              t('titleBar.miniWindow'),
              PRIMARY_MODIFIER_KEY,
              'M',
            )}
          >
            <button
              aria-label={t('titleBar.miniWindow')}
              className={classnames(
                'decorum-tb-btn [&_svg]:align-middle',
                isNewSegoeSupported && sharp
                  ? 'font-["Segoe_MDL2_Assets"]! text-base!'
                  : 'text-base!',
              )}
              onClick={() => {
                // todo
              }}
            >
              {isNewSegoeSupported ? (
                '\uee49'
              ) : (
                <MaterialIcon name='pictureInPicture' />
              )}
            </button>
          </Tip>
        )}
      </div>
    </header>
  );
}
