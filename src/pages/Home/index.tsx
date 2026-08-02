import AudioFileRoundedIcon from '@mui/icons-material/AudioFileRounded';
import AudioFileSharpIcon from '@mui/icons-material/AudioFileSharp';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import FolderOpenSharpIcon from '@mui/icons-material/FolderOpenSharp';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import LinkSharpIcon from '@mui/icons-material/LinkSharp';
import Button from '@mui/material/Button';
import { audioDir } from '@tauri-apps/api/path';
import { open } from '@tauri-apps/plugin-dialog';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useMusicState from '../../hooks/useMediaState';
import useSettings from '../../hooks/useSettings';
import styles from './index.module.less';

const audio = document.createElement('audio');
const supportedAudioTypes = [
  'audio/mp3',
  'audio/flac',
  'audio/aac',
  'audio/wav',
  'audio/ogg',
  'audio/mp4',
  'audio/webm',
  'audio/mpeg',
  'audio/3gpp',
].filter((type) => audio.canPlayType(type));

const audioFilters = supportedAudioTypes.map((type) => {
  switch (type) {
    case 'audio/3gpp':
      return { name: '3GP', extensions: ['3gp'] };
    case 'audio/aac':
      return { name: 'ADTS', extensions: ['aac'] };
    case 'audio/flac':
      return { name: 'FLAC', extensions: ['flac'] };
    case 'audio/mpeg':
      return { name: 'MPEG', extensions: ['mpg', 'mpeg'] };
    case 'audio/mp3':
      return { name: 'MP3', extensions: ['mp3'] };
    case 'audio/mp4':
      return { name: 'MPEG-4', extensions: ['mp4', 'm4a'] };
    case 'audio/ogg':
      return { name: 'Ogg', extensions: ['oga', 'ogg'] };
    case 'audio/wav':
      return { name: 'WAV', extensions: ['wav'] };
    case 'audio/webm':
      return { name: 'WebM', extensions: ['webm'] };
    default:
      return { name: '', extensions: [] };
  }
});

export default function Home() {
  const [settings] = useSettings();
  const [musicState, setMusicState] = useMusicState();
  const sharp = settings!.personalization.disableRoundCorner;
  const { t } = useTranslation();

  const openFiles = useCallback(async () => {
    let defaultPath: string | undefined = undefined;
    try {
      defaultPath = await audioDir();
    } catch (err) {
      console.error('Failed to get audio directory: ' + err);
    }

    let paths = await open({
      title: t('home.openAudioFile'),
      defaultPath,
      filters: [
        {
          name: t('common.supportedAudioFile'),
          extensions: audioFilters.map((item) => item.extensions).flat(),
        },
        ...audioFilters,
        { name: t('common.allFile'), extensions: ['*'] },
      ],
      multiple: true,
    });
    if (!paths) return;

    const newQueue = Array.from(musicState?.playQueue || []);
    const newIdx = (musicState?.playingIdx ?? -1) + 1;
    newQueue.splice(newIdx, 0, ...paths.map((path) => ({ pathOrId: path })));
    setMusicState('playQueue', newQueue);
    setMusicState('playingIdx', newIdx);
    setMusicState('playing', true);
  }, [musicState?.playQueue, musicState?.playingIdx, setMusicState, t]);

  const openFolder = useCallback(async () => {
    let defaultPath: string | undefined = undefined;
    try {
      defaultPath = await audioDir();
    } catch (err) {
      console.error('Failed to get audio directory: ' + err);
    }

    let path = await open({
      title: t('home.openAudioFile'),
      defaultPath,
      directory: true,
    });
    if (!path) return;
  }, [t]);

  return (
    <div className={styles.home}>
      <div className={styles.title}>{t('home.welcome')}</div>
      <div className={styles.btnRow}>
        <Button className={styles.btn} color='inherit' onClick={openFiles}>
          <div>
            {sharp ? <AudioFileSharpIcon /> : <AudioFileRoundedIcon />}
            {t('home.openAudioFiles')}
          </div>
        </Button>
        <Button className={styles.btn} color='inherit' onClick={openFolder}>
          <div>
            {sharp ? <FolderOpenSharpIcon /> : <FolderOpenRoundedIcon />}
            {t('home.openFolder')}
          </div>
        </Button>
        <Button className={styles.btn} color='inherit'>
          <div>
            {sharp ? <LinkSharpIcon /> : <LinkRoundedIcon />}
            {t('home.openUrl')}
          </div>
        </Button>
      </div>
    </div>
  );
}
