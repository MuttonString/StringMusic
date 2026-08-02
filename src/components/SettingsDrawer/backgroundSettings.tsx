import FileOpenRoundedIcon from '@mui/icons-material/FileOpenRounded';
import FileOpenSharpIcon from '@mui/icons-material/FileOpenSharp';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import Button from '@mui/material/Button';
import FormLabel from '@mui/material/FormLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import { convertFileSrc } from '@tauri-apps/api/core';
import { basename, join, pictureDir } from '@tauri-apps/api/path';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { Effect } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import { type, version } from '@tauri-apps/plugin-os';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ISettings } from '../../types/settings';
import { BackgroundType, BlurEffect } from '../../types/settings';
import Tip from '../Tip';
import styles from './index.module.less';

interface IProps {
  settings: ISettings;
  updateSettings: (key: string, value: {}) => Promise<void>;
  namespace: 'background' | 'backgroundMini';
}

function verCmp(a: string, b: string) {
  const verA = a.split('.').map(Number);
  const verB = b.split('.').map(Number);
  const len = Math.max(verA.length, verB.length);

  for (let i = 0; i < len; i++) {
    const x = verA[i] || 0;
    const y = verB[i] || 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}

const ver = version();
const supportedBlurEffects = [
  type() === 'windows' &&
    ((verCmp(ver, '6.0.5219') >= 0 && verCmp(ver, '6.2.8427') <= 0) ||
      (verCmp(ver, '10.0.10074') >= 0 && verCmp(ver, '10.0.22621') <= 0)),
  type() === 'windows' && verCmp(ver, '10.0.16215') >= 0,
  type() === 'windows' && verCmp(ver, '10.0.22000') >= 0,
  type() === 'macos' && verCmp(ver, '10.11') >= 0,
];

export function BackgroundSettings(props: IProps) {
  const { t } = useTranslation();
  const { settings, updateSettings, namespace } = props;
  const [bgOpacity, setBgOpacity] = useState(
    settings.personalization[namespace].opacity,
  );
  const [fileName, setFileName] = useState(
    settings.personalization[namespace].picture,
  );
  const [baseFileName, setBaseFileName] = useState('');
  const [folderName, setFolderName] = useState('');
  const [baseFolderName, setBaseFolderName] = useState(
    settings.personalization[namespace].folder,
  );
  const sharp = settings.personalization.disableRoundCorner;

  const selectPicture = useCallback(
    async (directory?: boolean) => {
      let defaultPath: string | undefined = undefined;
      try {
        defaultPath = await pictureDir();
      } catch (err) {
        console.error('Failed to get picture directory: ' + err);
      }

      const path = await open({
        title: t(
          `settingsDrawer.personalization.background.${directory ? 'selectFolder' : 'selectPicture'}`,
        ),
        defaultPath,
        filters: [
          {
            name: t('common.imageFile'),
            extensions: [
              'png',
              'jpg',
              'jpeg',
              'jfif',
              'pjpeg',
              'pjp',
              'webp',
              'bmp',
              'gif',
              'apng',
              'avif',
            ],
          },
          { name: 'PNG', extensions: ['png'] },
          {
            name: 'JPEG',
            extensions: ['jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp'],
          },
          { name: 'WebP', extensions: ['webp'] },
          { name: 'BMP', extensions: ['bmp'] },
          { name: 'GIF', extensions: ['gif'] },
          { name: 'APNG', extensions: ['apng'] },
          { name: 'AVIF', extensions: ['avif'] },
          { name: t('common.allFile'), extensions: ['*'] },
        ],
        directory,
      });
      if (!path) return;
      updateSettings(
        `personalization.${namespace}.${directory ? 'folder' : 'picture'}`,
        path,
      );
    },
    [namespace, t, updateSettings],
  );

  const bg = settings.personalization[namespace];

  useEffect(() => {
    if (
      bg.type !== BackgroundType.Blur ||
      supportedBlurEffects[bg.blurEffect]
    ) {
      return;
    }

    const effect = supportedBlurEffects.indexOf(true);
    if (effect >= 0) {
      // 将不支持的模糊效果更改为支持的
      updateSettings(`personalization.${namespace}.blurEffect`, effect);
    } else {
      updateSettings(
        `personalization.${namespace}.type`,
        BackgroundType.Translucent,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const init = async () => {
      const win = getCurrentWebviewWindow();
      const body = document.body;

      body.style.removeProperty('--opacity');
      body.style.removeProperty('--bg-color');
      body.style.backgroundColor = '';
      body.style.backgroundImage = '';
      try {
        await new Promise((resolve) =>
          setTimeout(resolve, settings.personalization.animationDuration * 250),
        );
        await win.clearEffects();
      } catch (err) {
        console.error('Clear window effect failed: ' + err);
      }

      switch (bg.type) {
        case BackgroundType.Default:
          body.style.setProperty(
            '--bg-color',
            'var(--mui-palette-background-default)',
          );
          break;
        case BackgroundType.Translucent:
          body.style.setProperty('--opacity', bg.opacity + '%');
          body.style.backgroundColor =
            'color-mix(in oklch, var(--mui-palette-background-default), transparent calc(100% - var(--opacity)))';
          body.style.setProperty('--bg-color', 'transparent');
          break;
        case BackgroundType.Blur:
          body.style.backgroundColor = 'transparent';
          try {
            switch (bg.blurEffect) {
              case BlurEffect.Blur:
                await win.setEffects({
                  effects: [Effect.Blur],
                });
                break;
              case BlurEffect.Acrylic:
                await win.setEffects({
                  effects: [Effect.Acrylic],
                });
                break;
              case BlurEffect.Mica:
                await win.setEffects({
                  effects: [Effect.Mica],
                });
                break;
              case BlurEffect.Vibrancy:
                await win.setEffects({
                  effects: [Effect.Sidebar],
                });
                break;
            }
          } catch (err) {
            console.error('Setting window effect failed: ' + err);
          }
          break;
        case BackgroundType.Picture:
          if (!bg.picture) break;
          body.style.setProperty('--opacity', bg.opacity + '%');
          body.style.backgroundColor =
            'color-mix(in oklch, var(--mui-palette-background-default), transparent calc(100% - var(--opacity)))';
          body.style.setProperty('--bg-color', 'transparent');
          setFileName(bg.picture);
          try {
            setBaseFileName(await basename(bg.picture));
          } catch (err) {
            console.error('File path error: ' + err);
          }
          document.body.style.backgroundImage = `url(${convertFileSrc(bg.picture)})`;
          break;
        case BackgroundType.Folder:
          if (!bg.folder) break;
          setFolderName(bg.folder);
          try {
            const entries = await readDir(bg.folder);
            const files = entries
              .filter((entry) => entry.isFile)
              .map((file) => file.name);
            const path = files[Math.floor(Math.random() * files.length)];
            const fullPath = await join(bg.folder, path);
            body.style.setProperty('--opacity', bg.opacity + '%');
            body.style.backgroundColor =
              'color-mix(in oklch, var(--mui-palette-background-default), transparent calc(100% - var(--opacity)))';
            body.style.setProperty('--bg-color', 'transparent');
            setBaseFolderName(await basename(bg.folder));
            document.body.style.backgroundImage = `url(${convertFileSrc(fullPath)})`;
          } catch (err) {
            console.error('File operation error: ' + err);
          }
          break;
      }
    };
    if (namespace === 'background') init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg.blurEffect, bg.folder, bg.picture, bg.type]);

  return (
    <>
      <FormLabel>
        {t('settingsDrawer.personalization.background.type.title')}
      </FormLabel>
      <Select
        value={settings.personalization[namespace].type}
        onChange={(e) =>
          updateSettings(`personalization.${namespace}.type`, e.target.value)
        }
        fullWidth
        size='small'
      >
        <MenuItem value={BackgroundType.Default}>
          {t('settingsDrawer.personalization.background.type.default')}
        </MenuItem>
        <MenuItem value={BackgroundType.Translucent}>
          {t('settingsDrawer.personalization.background.type.translucent')}
        </MenuItem>
        {supportedBlurEffects.includes(true) && (
          <MenuItem value={BackgroundType.Blur}>
            {t('settingsDrawer.personalization.background.type.blur')}
          </MenuItem>
        )}
        <MenuItem value={BackgroundType.Picture}>
          {t('settingsDrawer.personalization.background.type.picture')}
        </MenuItem>
        <MenuItem value={BackgroundType.Folder}>
          {t('settingsDrawer.personalization.background.type.folder')}
        </MenuItem>
      </Select>

      {[
        BackgroundType.Translucent,
        BackgroundType.Picture,
        BackgroundType.Folder,
      ].includes(settings.personalization[namespace].type) && (
        <>
          <FormLabel>
            {t('settingsDrawer.personalization.background.opacity')}
          </FormLabel>
          <Slider
            value={bgOpacity}
            onChange={(_, val) => {
              document.body.style.setProperty('--opacity', val + '%');
              setBgOpacity(val);
            }}
            onChangeCommitted={(_, val) =>
              updateSettings(`personalization.${namespace}.opacity`, val)
            }
            valueLabelDisplay='auto'
          />
        </>
      )}

      {BackgroundType.Blur === settings.personalization[namespace].type &&
        supportedBlurEffects.filter((val) => val).length > 1 && (
          <>
            <FormLabel>
              {t('settingsDrawer.personalization.background.blurEffect.title')}
            </FormLabel>
            <Select
              value={settings.personalization.background.blurEffect}
              onChange={(e) =>
                updateSettings(
                  `personalization.${namespace}.blurEffect`,
                  e.target.value,
                )
              }
              fullWidth
              size='small'
            >
              {supportedBlurEffects[0] && (
                <MenuItem value={BlurEffect.Blur}>
                  {t(
                    'settingsDrawer.personalization.background.blurEffect.blur',
                  )}
                </MenuItem>
              )}
              {supportedBlurEffects[1] && (
                <MenuItem value={BlurEffect.Acrylic}>
                  {t(
                    'settingsDrawer.personalization.background.blurEffect.acrylic',
                  )}
                </MenuItem>
              )}
              {supportedBlurEffects[2] && (
                <MenuItem value={BlurEffect.Mica}>
                  {t(
                    'settingsDrawer.personalization.background.blurEffect.mica',
                  )}
                </MenuItem>
              )}
            </Select>
          </>
        )}

      {BackgroundType.Picture === settings.personalization[namespace].type && (
        <>
          <FormLabel>
            {t('settingsDrawer.personalization.background.picture')}
          </FormLabel>
          <Button
            startIcon={sharp ? <FileOpenSharpIcon /> : <FileOpenRoundedIcon />}
            variant='contained'
            onClick={() => selectPicture()}
          >
            {t('settingsDrawer.personalization.background.selectPicture')}
          </Button>
          <Tip disabled={!fileName} title={fileName}>
            <div>
              <div className={styles.path}>{baseFileName}</div>
            </div>
          </Tip>
        </>
      )}

      {window.desktop &&
        BackgroundType.Folder === settings.personalization[namespace].type && (
          <>
            <FormLabel>
              {t('settingsDrawer.personalization.background.picture')}
            </FormLabel>
            <Button
              startIcon={
                sharp ? <FolderOpenSharpIcon /> : <FolderOpenRoundedIcon />
              }
              variant='contained'
              onClick={() => selectPicture(true)}
            >
              {t('settingsDrawer.personalization.background.selectFolder')}
            </Button>
            <Tip disabled={!folderName} title={folderName}>
              <div>
                <div className={styles.path}>{baseFolderName}</div>
              </div>
            </Tip>
          </>
        )}
    </>
  );
}
