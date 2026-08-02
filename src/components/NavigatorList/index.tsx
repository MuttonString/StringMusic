import AlbumRoundedIcon from '@mui/icons-material/AlbumRounded';
import AlbumSharpIcon from '@mui/icons-material/AlbumSharp';
import AssistantRoundedIcon from '@mui/icons-material/AssistantRounded';
import AssistantSharpIcon from '@mui/icons-material/AssistantSharp';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DownloadSharpIcon from '@mui/icons-material/DownloadSharp';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import HistorySharpIcon from '@mui/icons-material/HistorySharp';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import HomeSharpIcon from '@mui/icons-material/HomeSharp';
import LibraryMusicRoundedIcon from '@mui/icons-material/LibraryMusicRounded';
import LibraryMusicSharpIcon from '@mui/icons-material/LibraryMusicSharp';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import PeopleAltSharpIcon from '@mui/icons-material/PeopleAltSharp';
import PlaylistAddCheckCircleRoundedIcon from '@mui/icons-material/PlaylistAddCheckCircleRounded';
import PlaylistAddCheckCircleSharpIcon from '@mui/icons-material/PlaylistAddCheckCircleSharp';
import PlaylistAddCheckRoundedIcon from '@mui/icons-material/PlaylistAddCheckRounded';
import PlaylistAddCheckSharpIcon from '@mui/icons-material/PlaylistAddCheckSharp';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SettingsSharpIcon from '@mui/icons-material/SettingsSharp';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import VideoLibrarySharpIcon from '@mui/icons-material/VideoLibrarySharp';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router';
import useDetailHistory from '../../hooks/useDetailHistory';
import useSettings from '../../hooks/useSettings';
import useSettingsDrawer from '../../hooks/useSettingsDrawer';
import classNames from '../../utils/classNames';
import styles from './index.module.less';

interface IProps {
  onButtonClicked?: () => void;
  className?: string;
}

export default function NavigatorList({ onButtonClicked, className }: IProps) {
  const [selected, setSelected] = useState('');
  const location = useLocation();
  const path = location.pathname.split('/')[1];
  const [settings] = useSettings();
  const iconType = Number(settings?.personalization.disableRoundCorner);
  const { t } = useTranslation();
  const { goTo } = useDetailHistory();
  const [disabled, setDisabled] = useState<string[]>([]);
  const openSettings = useSettingsDrawer();

  const items = useMemo(
    () => [
      {
        id: 'home',
        icon: [<HomeRoundedIcon key={0} />, <HomeSharpIcon key={1} />],
        label: t('page.home'),
      },
      {
        id: 'recommendation',
        icon: [
          <AssistantRoundedIcon key={0} />,
          <AssistantSharpIcon key={1} />,
        ],
        label: t('page.recommendation'),
      },
      {
        id: 'recent',
        icon: [<HistoryRoundedIcon key={0} />, <HistorySharpIcon key={1} />],
        label: t('page.recent'),
      },
      {
        id: 'artistCollection',
        icon: [
          <PeopleAltRoundedIcon key={0} />,
          <PeopleAltSharpIcon key={1} />,
        ],
        label: t('page.artistCollection'),
      },
      {
        id: 'albumCollection',
        icon: [<AlbumRoundedIcon key={0} />, <AlbumSharpIcon key={1} />],
        label: t('page.albumCollection'),
      },
      {
        id: 'mvCollection',
        icon: [
          <VideoLibraryRoundedIcon key={0} />,
          <VideoLibrarySharpIcon key={1} />,
        ],
        label: t('page.mvCollection'),
      },
      {
        id: 'songCollection',
        icon: [
          <LibraryMusicRoundedIcon key={0} />,
          <LibraryMusicSharpIcon key={1} />,
        ],
        label: t('page.songCollection'),
      },
      {
        id: 'playlistCollection',
        icon: [
          <PlaylistAddCheckCircleRoundedIcon key={0} />,
          <PlaylistAddCheckCircleSharpIcon key={1} />,
        ],
        label: t('page.playlistCollection'),
      },
      {
        id: 'myPlaylist',
        icon: [
          <PlaylistAddCheckRoundedIcon key={0} />,
          <PlaylistAddCheckSharpIcon key={1} />,
        ],
        label: t('page.myPlaylist'),
      },
    ],
    [t],
  );

  useEffect(() => {
    setSelected(path);
  }, [path]);

  useEffect(() => {
    if (!settings) return;

    const newDisabled = [];
    if (!settings.privacy.recommendation) {
      newDisabled.push('recommendation');
    }
    if (!settings.privacy.recent) {
      newDisabled.push('recent');
    }
    setDisabled(newDisabled);
  }, [settings]);

  return (
    <div className={classNames(styles.navigatorList, className)}>
      <List>
        {items.map((item) => (
          <ListItemButton
            key={item.id}
            selected={selected === item.id}
            onClick={() => {
              setSelected(item.id);
              goTo('/' + item.id);
              onButtonClicked?.();
            }}
            className={
              disabled.includes(item.id) ? styles.disabled : styles.normal
            }
          >
            <ListItemIcon
              style={{
                color:
                  selected === item.id
                    ? 'var(--mui-palette-primary-main)'
                    : undefined,
              }}
            >
              {item.icon[iconType]}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>

      <List>
        <ListItemButton
          className={styles.normal}
          onClick={() => {
            onButtonClicked?.();
          }}
        >
          <ListItemIcon>
            {iconType ? <DownloadSharpIcon /> : <DownloadRoundedIcon />}
          </ListItemIcon>
          <ListItemText primary={t('drawer.download')} />
        </ListItemButton>

        <ListItemButton
          className={styles.normal}
          onClick={() => {
            openSettings();
            onButtonClicked?.();
          }}
        >
          <ListItemIcon>
            {iconType ? <SettingsSharpIcon /> : <SettingsRoundedIcon />}
          </ListItemIcon>
          <ListItemText primary={t('drawer.settings')} />
        </ListItemButton>
      </List>
    </div>
  );
}
