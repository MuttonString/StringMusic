import AndroidIcon from '@mui/icons-material/Android';
import AppleIcon from '@mui/icons-material/Apple';
import GitHubIcon from '@mui/icons-material/GitHub';
import MicrosoftIcon from '@mui/icons-material/Microsoft';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { getTauriVersion, getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/core';
import { openUrl } from '@tauri-apps/plugin-opener';
import { arch, locale, platform, version } from '@tauri-apps/plugin-os';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ISettings } from '../../types/settings';
import { getLangs } from '../../utils/i18n';
import AboutDialog from '../AboutDialog';
import LibraryInfoDialog from '../LibraryInfoDialog';
import styles from './index.module.less';

interface IProps {
  settings: ISettings;
  updateSettings: (key: string, value: {}) => Promise<void>;
}

interface IInfo {
  ver: string;
  tauri: string;
  webview: string;
  platform: { icon?: ReactNode; text: string };
  osVer: string;
  arch: string;
  locale: string | null;
}

export default function About({ settings, updateSettings }: IProps) {
  const [info, setInfo] = useState<Partial<IInfo>>({});
  const { t } = useTranslation();
  const [libOpen, setLibOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  useEffect(() => {
    const platformMap: Record<
      ReturnType<typeof platform>,
      { icon?: ReactNode; text: string }
    > = {
      windows: { icon: <MicrosoftIcon fontSize='small' />, text: 'Windows' },
      macos: { icon: <AppleIcon fontSize='small' />, text: 'macOS' },
      linux: { text: 'Linux' },
      android: { icon: <AndroidIcon fontSize='small' />, text: 'Android' },
      ios: { icon: <AppleIcon fontSize='small' />, text: 'iOS' },
      freebsd: { text: 'FreeBSD' },
      dragonfly: { text: 'Dragonfly' },
      netbsd: { text: 'NetBSD' },
      openbsd: { text: 'OpenBSD' },
      solaris: { text: 'Solaris' },
    };

    const archMap: Record<ReturnType<typeof arch>, string> = {
      x86: 'x86',
      x86_64: 'x64',
      arm: 'ARM',
      aarch64: 'ARM64',
      mips: 'MIPS',
      mips64: 'MIPS64',
      powerpc: 'PowerPC',
      powerpc64: 'PowerPC64',
      riscv64: 'RISC-V 64',
      s390x: 's390x',
      sparc64: 'SPARC64',
    };

    const init = async () => {
      let osVer = version();
      let ar: string = arch();
      const pf = platformMap[platform()];

      if (pf.text === 'Windows') {
        // 把Windows内核版本号转换为系统版本
        const splited = osVer.split('.');
        if (splited[0] === '6') {
          switch (splited[1]) {
            case '0':
              osVer = 'Vista Build ' + splited[2];
              break;
            case '1':
              osVer = '7 Build ' + splited[2];
              break;
            case '2':
              osVer = '8 Build ' + splited[2];
              break;
            case '3':
              osVer = '8.1 Build ' + splited[2];
              break;
            case '4':
              osVer = '10 Build ' + splited[2];
              break;
          }
        } else if (splited[0] === '10') {
          if (Number(splited[2]) >= 22000) {
            osVer = '11 Build ' + splited[2];
          } else {
            osVer = '10 Build ' + splited[2];
          }
        }
        ar = ` (${archMap[ar as ReturnType<typeof arch>]})`;
      } else if (pf.text === 'macOS') {
        if (ar === 'x86_64') {
          ar = ' (Intel)';
        } else if (ar === 'aarch64') {
          ar = ' (Apple Silicon)';
        }
      } else if (pf.text === 'iOS') {
        ar = '';
      } else {
        ar = ` (${archMap[ar as ReturnType<typeof arch>]})`;
      }

      try {
        let lc = await locale();
        if (lc) {
          try {
            const displayNames = new Intl.DisplayNames(getLangs(), {
              type: 'language',
            });
            const name = displayNames.of(lc);
            if (name) lc = name;
          } catch (err) {
            console.error(
              `Failed to convert locale "${lc}" into display name: ${err}`,
            );
          }
        } else {
          lc = t('settingsDrawer.about.unknown');
        }

        setInfo({
          platform: pf,
          arch: ar,
          osVer,
          ver: await getVersion(),
          tauri: await getTauriVersion(),
          locale: lc,
          webview: await invoke('webview_ver'),
        });
      } catch (err) {
        console.error('Failed to get system info: ' + err);
      }
    };
    init();
  }, [t]);

  return (
    <List dense>
      <ListItem disablePadding>
        <ListItemButton
          onDoubleClick={() => {
            openUrl('https://github.com/MuttonString/StringMusic').catch(
              (err) => {
                console.error('Open url failed: ', err);
              },
            );
          }}
        >
          <ListItemIcon sx={{ marginRight: '8px' }}>
            <Avatar src='https://avatars.githubusercontent.com/u/97750941'>
              <GitHubIcon />
            </Avatar>
          </ListItemIcon>
          <ListItemText
            primary={t('settingsDrawer.about.author')}
            secondary={
              ['zh', 'ja'].includes(getLangs()[0].substring(0, 2))
                ? '羊肉串'
                : 'Mutton String'
            }
          />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onClick={() => setLibOpen(true)}>
          <ListItemText
            primary={t('settingsDrawer.about.openSourceLib')}
            secondary={t('settingsDrawer.about.clickToView')}
          />
        </ListItemButton>
      </ListItem>
      <LibraryInfoDialog open={libOpen} onClose={() => setLibOpen(false)} />
      <ListItem disablePadding>
        <ListItemButton
          onDoubleClick={() => {
            if (!settings.developerOptions.enabled) {
              updateSettings('developerOptions.enabled', true);
            }
          }}
        >
          <ListItemText
            primary={t('settingsDrawer.about.appVer')}
            secondary={info.ver}
          />
        </ListItemButton>
      </ListItem>
      <ListItem disablePadding>
        <ListItemButton onDoubleClick={() => setAboutOpen(true)}>
          <ListItemText
            primary={t('settingsDrawer.about.tauriVer')}
            secondary={info.tauri}
          />
        </ListItemButton>
      </ListItem>
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <ListItem>
        <ListItemText
          primary={t('settingsDrawer.about.webviewVer')}
          secondary={info.webview}
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={t('settingsDrawer.about.os')}
          secondary={
            <span className={styles.textWithIcon}>
              {info.platform?.icon}
              <span>{`${info.platform?.text} ${info.osVer}${info.arch}`}</span>
            </span>
          }
        />
      </ListItem>
      <ListItem>
        <ListItemText
          primary={t('settingsDrawer.about.locale')}
          secondary={info.locale}
        />
      </ListItem>
    </List>
  );
}
