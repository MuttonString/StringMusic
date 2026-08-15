import { defaultWindowIcon } from '@tauri-apps/api/app';
import { Menu } from '@tauri-apps/api/menu';
import { TrayIcon } from '@tauri-apps/api/tray';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { IS_APPLE, IS_DESKTOP } from '../constants/os';
import { destroyAll, raise } from '../utils/window';

export default function useTrayMenu() {
  const { t } = useTranslation();

  useEffect(() => {
    if (!IS_DESKTOP || IS_APPLE) return;

    const init = async () => {
      try {
        await TrayIcon.removeById('StringMusic');
      } catch {}

      const menu = await Menu.new({
        items: [
          {
            text: t('menu.prev'),
            action() {
              //todo
            },
          },
          {
            text: t('menu.play'),
            action() {
              //todo
            },
          },
          { text: t('menu.next') },
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
      });

      const tray = await TrayIcon.new({
        id: 'StringMusic',
        title: t('common.stringMusic'),
        tooltip: t('common.stringMusic'),
        icon: (await defaultWindowIcon()) || undefined,
        menu,
        showMenuOnLeftClick: false,
        action: async (e) => {
          if (e.type !== 'Click') return;
          if (e.button === 'Left') {
            show();
          } else if (e.button === 'Right') {
            menu.popup();
          }
        },
      });

      return { tray, menu };
    };

    const obj = init();

    return () => {
      obj.then((val) => {
        if (val) {
          val.menu.close();
          val.tray.close();
        }
      });
    };
  }, [t]);
}
