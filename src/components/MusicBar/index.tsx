import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';
import FastForwardSharpIcon from '@mui/icons-material/FastForwardSharp';
import FastRewindRoundedIcon from '@mui/icons-material/FastRewindRounded';
import FastRewindSharpIcon from '@mui/icons-material/FastRewindSharp';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PauseCircleFilledRoundedIcon from '@mui/icons-material/PauseCircleFilledRounded';
import PauseCircleFilledSharpIcon from '@mui/icons-material/PauseCircleFilledSharp';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import PlayCircleFilledSharpIcon from '@mui/icons-material/PlayCircleFilledSharp';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import RedoSharpIcon from '@mui/icons-material/RedoSharp';
import RepeatOneOnIcon from '@mui/icons-material/RepeatOneOn';
import ShuffleOnIcon from '@mui/icons-material/ShuffleOn';
import SubtitlesOffIcon from '@mui/icons-material/SubtitlesOff';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import UndoSharpIcon from '@mui/icons-material/UndoSharp';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import { emit, listen } from '@tauri-apps/api/event';
import type { MouseEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import defaultCover from '../../assets/CD.png';
import useLongPress from '../../hooks/useLongPress';
import useMusicState from '../../hooks/useMediaState';
import useSettings from '../../hooks/useSettings';
import PlayPage from '../../pages/PlayPage';
import { ShowWave } from '../../types/settings';
import classNames from '../../utils/classNames';
import { KeyCode, showShortcutKey } from '../../utils/shortcutKey';
import AutoSlideText from '../AutoSlideText';
import Tip from '../Tip';
import styles from './index.module.less';

interface IProps {
  independentWindow?: boolean;
}

const parseTime = (sec: number) => {
  sec = Math.max(0, sec);
  const h = Math.floor(sec / 3600);
  const m = String(Math.floor((sec % 3600_000) / 60));
  const s = String(Math.floor(sec % 60));
  return h > 0
    ? `${h}:${m.padStart(2, '0')}:${s.padStart(2, '0')}`
    : `${m.padStart(2, '0')}:${s.padStart(2, '0')}`;
};

export default function MusicBar({ independentWindow }: IProps) {
  const [settings, updateSettings] = useSettings();
  const { t } = useTranslation();
  const sharp = settings!.personalization.disableRoundCorner;
  const savePlaying = settings!.privacy.savePlaying;
  const showWave = ShowWave.OnHover as ShowWave;
  const [showPlayPage, setShowPlayPage] = useState(false);
  const [paused, setPaused] = useState(true);
  const [musicState, setMusicState] = useMusicState();
  const [currentTime, setCurrentTime] = useState(0);
  const intervalRef = useRef<number | null | undefined | false>(undefined); // 只有初值会是undefined，拖动进度条时为false
  const [sliderLabel, setSliderLabel] = useState('');
  const duration = musicState?.meta?.duration || 0;

  const setTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(
      () => setCurrentTime((prev) => (prev >= duration ? 0 : prev + 0.25)),
      250,
    );
  }, [duration]);

  useEffect(() => {
    const unlistenPlay = listen('play', () => {
      setPaused(false);
      setTimer();
    });

    const unlistenPause = listen('pause', () => {
      setPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    });

    return () => {
      unlistenPlay.then((fn) => fn());
      unlistenPause.then((fn) => fn());
    };
  }, [setTimer]);

  useEffect(() => {
    if (intervalRef.current) {
      // 全局的progress更新频率低，只用于校正及存储播放状态
      setCurrentTime(musicState?.progress || 0);
    }
  }, [musicState?.progress]);

  const handleSliderLabel = useCallback(
    (e: MouseEvent<HTMLSpanElement>) => {
      const slider = e.currentTarget;
      const rect = slider.getBoundingClientRect();
      const relativeX = (e.clientX - rect.left) / rect.width;
      const value = Math.round(relativeX * duration);
      setSliderLabel(parseTime(Math.min(duration, value)));
    },
    [duration],
  );

  const coverLongPress = useLongPress(
    (e: MouseEvent<HTMLElement>) => {
      const newState = !settings!.playback.coverRotate;
      const el = e.target as HTMLElement;
      if (newState) {
        el.style.transform = '';
        el.style.transition = '';
      } else {
        // 封面停止旋转时的复位动画
        const matrix = getComputedStyle(el).transform;
        const [a, b] = matrix
          .match(/matrix\((.+)\)/)![1]
          .split(', ')
          .map(Number);
        const deg = ((((Math.atan2(b, a) * 180) / Math.PI) % 360) + 360) % 360;
        el.style.transform = `rotate(${deg}deg)`;
        el.style.transition =
          'transform calc(var(--duration) * 250ms) ease-in-out';
        setTimeout(
          () => (el.style.transform = `rotate(${deg > 180 ? '360deg' : '0'})`),
          1,
        );
      }
      updateSettings('playback.coverRotate', newState);
    },
    independentWindow
      ? undefined
      : () => {
          setShowPlayPage(true);
        },
  );

  return (
    <>
      <div
        data-tauri-drag-region={independentWindow}
        className={styles.musicBar}
        style={{
          bottom: independentWindow
            ? 0
            : settings!.developerOptions.enabled &&
                settings!.developerOptions.showFooter
              ? '40px'
              : '8px',
          insetInlineStart: independentWindow ? 0 : undefined,
          insetInlineEnd: independentWindow ? 0 : undefined,
        }}
      >
        <Tip
          title={
            <>
              {!independentWindow && (
                <>
                  {showShortcutKey(t('musicBar.playPage'), KeyCode.Ctrl, 'N')}
                  <br />
                </>
              )}
              {settings!.playback.coverRotate
                ? t('musicBar.enableCoverRotate')
                : t('musicBar.disableCoverRotate')}
            </>
          }
        >
          <div className={styles.coverWrapper}>
            <img
              alt={t('musicBar.playPage')}
              className={classNames(
                styles.cover,
                settings!.playback.coverRotate && styles.rotate,
              )}
              src={musicState?.meta?.cover || defaultCover}
              style={{
                cursor: independentWindow ? undefined : 'pointer',
                animationPlayState: paused ? 'paused' : 'running',
              }}
              onError={(e) => {
                e.currentTarget.src = defaultCover;
                e.currentTarget.onerror = null;
              }}
              {...coverLongPress}
            />
          </div>
        </Tip>

        <div className={styles.mid}>
          <div className={styles.meta}>
            <Tip
              title={
                <>
                  {!independentWindow && (
                    <>
                      {showShortcutKey(
                        t('musicBar.playPage'),
                        KeyCode.Ctrl,
                        'N',
                      )}
                      <br />
                    </>
                  )}
                  {musicState?.meta?.title || t('musicBar.noMusic')}
                </>
              }
            >
              <Button
                aria-label={`${t('musicBar.playPage')}\n${musicState?.meta?.title}`}
                size='small'
                color='inherit'
                onClick={() => {
                  if (!independentWindow) setShowPlayPage(true);
                }}
              >
                <AutoSlideText>
                  {musicState?.meta?.title || t('musicBar.noMusic')}
                </AutoSlideText>
              </Button>
            </Tip>
            <div className={styles.info}>
              {musicState?.meta?.artist && (
                <Tip
                  title={
                    <>
                      {t('musicBar.artist')}
                      <br />
                      {musicState.meta.artist}
                    </>
                  }
                >
                  <Button size='small' color='inherit'>
                    <AutoSlideText>{musicState.meta.artist}</AutoSlideText>
                  </Button>
                </Tip>
              )}
              {musicState?.meta?.artist && musicState.meta.album && (
                <Divider orientation='vertical' flexItem />
              )}
              {musicState?.meta?.album && (
                <Tip
                  title={
                    <>
                      {t('musicBar.album')}
                      <br />
                      {musicState.meta.album}
                    </>
                  }
                >
                  <Button size='small' color='inherit'>
                    <AutoSlideText>{musicState.meta.album}</AutoSlideText>
                  </Button>
                </Tip>
              )}
            </div>
          </div>
          <div className={styles.progress}>
            <div>{parseTime(currentTime)}</div>
            <Tip
              disabled={!musicState?.meta?.duration}
              title={sliderLabel}
              placement='top'
              enterTouchDelay={0}
              arrow
              followCursor
              slotProps={{
                popper: {
                  sx: {
                    top: '16px',
                  },
                },
              }}
            >
              <span className={styles.slider} onMouseMove={handleSliderLabel}>
                <Slider
                  size='small'
                  sx={{ padding: '6px 0' }}
                  disabled={!musicState?.meta?.duration}
                  max={duration}
                  onChangeCommitted={(_, val) => {
                    if (!paused) setTimer();
                    emit('time_changed', val).catch((err) =>
                      console.error(
                        'Failed to change audio current time: ' + err,
                      ),
                    );
                  }}
                  value={Math.floor(currentTime)}
                  onChange={(_, val) => {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    intervalRef.current = false;
                    setCurrentTime(val);
                  }}
                  valueLabelFormat={parseTime}
                />
              </span>
            </Tip>
            <div>{parseTime(duration)}</div>
          </div>

          <div
            className={styles.btns}
            style={showWave === ShowWave.Always ? { gap: '12.5px' } : undefined}
          >
            <IconButton
              size={showWave === ShowWave.Always ? 'small' : 'medium'}
            >
              {sharp ? (
                <UndoSharpIcon
                  fontSize={showWave === ShowWave.Always ? 'small' : 'medium'}
                />
              ) : (
                <UndoRoundedIcon
                  fontSize={showWave === ShowWave.Always ? 'small' : 'medium'}
                />
              )}
            </IconButton>
            <IconButton
              size={showWave === ShowWave.Always ? 'small' : 'medium'}
            >
              {sharp ? (
                <FastRewindSharpIcon
                  fontSize={showWave === ShowWave.Always ? 'small' : 'medium'}
                />
              ) : (
                <FastRewindRoundedIcon
                  fontSize={showWave === ShowWave.Always ? 'small' : 'medium'}
                />
              )}
            </IconButton>
            <IconButton
              size={showWave === ShowWave.Always ? 'small' : 'medium'}
              sx={{
                padding: showWave === ShowWave.Always ? '0 3px' : '0 2.5px',
              }}
              loading={musicState?.loading}
              onClick={async () => {
                try {
                  if (paused) {
                    await emit(
                      'play',
                      intervalRef.current === undefined && savePlaying
                        ? musicState?.progress // 启动后初次播放时，恢复audio元素到上次播放的进度
                        : undefined,
                    );
                  } else {
                    await emit('pause');
                  }
                  setMusicState('playing', paused);
                } catch (err) {
                  console.error(
                    `Failed to ${paused ? 'play' : 'pause'} audio: ${err}`,
                  );
                }
              }}
            >
              {paused ? (
                sharp ? (
                  <PlayCircleFilledSharpIcon
                    fontSize={showWave === ShowWave.Always ? 'medium' : 'large'}
                  />
                ) : (
                  <PlayCircleFilledRoundedIcon
                    fontSize={showWave === ShowWave.Always ? 'medium' : 'large'}
                  />
                )
              ) : sharp ? (
                <PauseCircleFilledSharpIcon
                  fontSize={showWave === ShowWave.Always ? 'medium' : 'large'}
                />
              ) : (
                <PauseCircleFilledRoundedIcon
                  fontSize={showWave === ShowWave.Always ? 'medium' : 'large'}
                />
              )}
            </IconButton>
            <IconButton
              size={showWave === ShowWave.Always ? 'small' : 'medium'}
            >
              {sharp ? (
                <FastForwardSharpIcon
                  fontSize={showWave === ShowWave.Always ? 'small' : 'medium'}
                />
              ) : (
                <FastForwardRoundedIcon
                  fontSize={showWave === ShowWave.Always ? 'small' : 'medium'}
                />
              )}
            </IconButton>
            <IconButton
              size={showWave === ShowWave.Always ? 'small' : 'medium'}
            >
              {sharp ? (
                <RedoSharpIcon
                  fontSize={showWave === ShowWave.Always ? 'small' : 'medium'}
                />
              ) : (
                <RedoRoundedIcon
                  fontSize={showWave === ShowWave.Always ? 'small' : 'medium'}
                />
              )}
            </IconButton>
          </div>
        </div>

        <div className={styles.right}>
          <div>
            <IconButton size='small'>
              <ShuffleOnIcon />
            </IconButton>
            <IconButton size='small'>
              <SubtitlesOffIcon />
            </IconButton>
          </div>
          <div>
            <IconButton size='small'>
              <FavoriteIcon />
            </IconButton>
            <IconButton size='small'>
              <MoreHorizIcon />
            </IconButton>
            <IconButton size='small'>
              <FormatListBulletedIcon />
            </IconButton>
          </div>
          <div>
            <IconButton size='small'>
              <RepeatOneOnIcon />
            </IconButton>
            <IconButton size='small'>
              <VolumeUpIcon />
            </IconButton>
          </div>
        </div>
      </div>
      {!independentWindow && (
        <PlayPage open={showPlayPage} onClose={() => setShowPlayPage(false)} />
      )}
    </>
  );
}
