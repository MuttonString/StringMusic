import { defaultWindowIcon } from '@tauri-apps/api/app';
import { emit } from '@tauri-apps/api/event';
import { Menu } from '@tauri-apps/api/menu';
import type { TrayIconEvent } from '@tauri-apps/api/tray';
import { TrayIcon } from '@tauri-apps/api/tray';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { IS_APPLE, IS_DESKTOP } from '../constants/os';
import { useAudio } from '../providers/AudioProvider';
import { BackendEvent } from '../types/backend';
import { destroyAll, raise } from '../utils/window';

await TrayIcon.removeById('StringMusic').catch(() => {});

/**
 * 创建托盘图标
 */
export default function useTrayMenu() {
  const { t } = useTranslation();
  const media = useAudio();
  const trayRef = useRef<TrayIcon>(undefined);
  const menuRef = useRef<Menu>(undefined);
  const actionRef = useRef<(event: TrayIconEvent) => void>(undefined);

  useEffect(() => {
    if (!IS_DESKTOP || IS_APPLE) return;

    const create = async () => {
      trayRef.current = await TrayIcon.new({
        id: 'StringMusic',
        title: t('common.stringMusic'),
        tooltip: t('common.stringMusic'),
        icon: (await defaultWindowIcon())!,
        showMenuOnLeftClick: false,
        menu: menuRef.current,
        action: (e) => actionRef.current?.(e),
      });
    };

    TrayIcon.getById('StringMusic')
      .then(async (val) => {
        if (val) {
          val.setTitle(t('common.stringMusic'));
          val.setTooltip(t('common.stringMusic'));
          val.setMenu(menuRef.current || null);
          trayRef.current = val;
        } else {
          create();
        }
      })
      .catch(create);
  }, [t]);

  useEffect(() => {
    Menu.new({
      items: [
        {
          text: t('media.prev'),
          enabled: media.playQueue.length > 1,
          action() {
            emit(BackendEvent.Previous);
          },
        },
        {
          text: t(media.paused ? 'media.play' : 'media.pause'),
          enabled: !media.pending && media.playQueue.length > 0,
          action() {
            emit(BackendEvent.Toggle);
          },
        },
        {
          text: t('media.next'),
          enabled: media.playQueue.length > 1,
          action() {
            emit(BackendEvent.Next);
          },
        },
        { item: 'Separator' },
        {
          text: t('menu.desktopLyric'),
        },
        {
          text: t('menu.lockLyric'),
        },
        { item: 'Separator' },
        {
          text: t('menu.show'),
          action: raise,
        },
        {
          text: t('menu.exit'),
          action: destroyAll,
        },
      ],
    }).then((val) => {
      menuRef.current = val;
      trayRef.current?.setMenu(val);
    });

    actionRef.current = (e) => {
      if (e.type !== 'Click') return;
      if (e.button === 'Left') {
        raise();
      } else if (e.button === 'Right') {
        menuRef.current?.popup();
      }
    };

    return () => {
      menuRef.current?.close();
    };
  }, [media.paused, media.pending, media.playQueue.length, t]);
}
