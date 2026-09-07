import { defaultWindowIcon } from '@tauri-apps/api/app';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { type } from '@tauri-apps/plugin-os';
import { parseBuffer } from 'music-metadata';
import type { ComponentProps, SyntheticEvent } from 'react';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_WINDOW_ICON,
  MAIN_WINDOW,
  WINDOW_LABEL,
} from '../constants/window';
import {
  TaskbarButtons,
  type AudioContext,
  type LyricSentence,
  type Song,
} from '../types/audio';
import { BackendEvent } from '../types/backend';
import type { ChildrenProp } from '../types/component';
import { PlaybackMode } from '../types/config';
import { imgSrcToBuffer } from '../utils/data';
import { destroyAll, raise } from '../utils/window';
import { useConfig } from './ConfigProvider';
import { useSnackbar } from './SnackbarProvider';

const isWindows = type() === 'windows';

if (WINDOW_LABEL === 'main') {
  if ('mediaSession' in navigator) {
    navigator.mediaSession.setActionHandler('play', () =>
      emit(BackendEvent.Play),
    );
    navigator.mediaSession.setActionHandler('pause', () =>
      emit(BackendEvent.Pause),
    );
    navigator.mediaSession.setActionHandler('seekbackward', (e) =>
      emit(BackendEvent.SeekBackward, e.seekOffset),
    );
    navigator.mediaSession.setActionHandler('seekforward', (e) =>
      emit(BackendEvent.SeekForward, e.seekOffset),
    );
  } else {
    console.warn('Do not support mediaSession.');
    invoke('detach_media_control')
      .catch(() => {})
      .finally(() => {
        console.info('Initialize media control.');
        invoke('init_media_control');
      });
  }
}

const initVal: AudioContext = {
  play: () => emit(BackendEvent.Play),
  pause: () => emit(BackendEvent.Pause),
  prev: () => emit(BackendEvent.Previous),
  next: () => emit(BackendEvent.Next),
  seekBackward: () => emit(BackendEvent.SeekBackward),
  seekForward: () => emit(BackendEvent.SeekForward),
  updateQueue: (newQueue: Song[]) => emit(BackendEvent.UpdateQueue, newQueue),
  setLyric() {},
  setCurrIdx: (idx: number) => emit<number>(BackendEvent.SetCurrIdx, idx),
  currIdx: -1,
  prevIdx: -1,
  nextIdx: -1,
  playQueue: [],
  paused: true,
  pending: false,
  currentTime: 0,
  lyric: [],
};

const Context = createContext(initVal);

export const useAudio = () => useContext(Context);

export function AudioProvider({ children }: ChildrenProp) {
  const [config, updateConfig] = useConfig();
  const showSnackbar = useSnackbar();
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const fakeAudioRef = useRef<HTMLAudioElement>(null);
  const randomIdxListRef = useRef<number[]>([]);
  const errRecord = useRef(new Set<string>());

  const [currIdx, setCurrIdx] = useState(-1);
  const [prevIdx, setPrevIdx] = useState(-1);
  const [nextIdx, setNextIdx] = useState(-1);
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [paused, setPaused] = useState(true);
  const [pending, setPending] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lyric, setLyric] = useState<LyricSentence[]>([]);
  const [currArrayBuffer, setCurrArrayBuffer] = useState<ArrayBuffer>();

  // 不依赖其他状态的状态更改
  useEffect(() => {
    const unlisten: Promise<UnlistenFn>[] = [];

    unlisten.push(
      listen<boolean>(BackendEvent.IsLoading, (e) => setPending(e.payload)),
    );

    unlisten.push(
      listen(BackendEvent.Pause, () => {
        setPaused(true);
        if (audioRef.current) {
          console.info('Pause audio.');
          audioRef.current.pause();
          fakeAudioRef.current!.pause();
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
          }
        }
      }),
    );

    unlisten.push(
      listen(BackendEvent.Toggle, () =>
        setPaused((prev) => {
          emit(prev ? BackendEvent.Play : BackendEvent.Pause);
          return !prev;
        }),
      ),
    );

    unlisten.push(
      listen<number>(BackendEvent.TimeUpdate, (e) => setCurrentTime(e.payload)),
    );

    unlisten.push(
      listen(BackendEvent.Stop, () => {
        setPaused(true);
        setCurrentTime(0);
        if (audioRef.current) {
          console.info('Stop audio.');
          audioRef.current.pause();
          fakeAudioRef.current!.pause();
          audioRef.current.currentTime = 0;
          fakeAudioRef.current!.currentTime = 0;
        }
      }),
    );

    unlisten.push(
      listen<number>(BackendEvent.SetPosition, (e) => {
        setCurrentTime(Math.floor(e.payload));
        if (audioRef.current) {
          console.info(`Set audio position to ${e.payload}s.`);
          audioRef.current.currentTime = e.payload;
        }
      }),
    );

    unlisten.push(listen(BackendEvent.Raise, () => raise()));

    unlisten.push(listen(BackendEvent.Quit, () => destroyAll()));

    unlisten.push(
      listen<Song[]>(BackendEvent.UpdateQueue, (e) =>
        setPlayQueue((prev) => {
          const prevBlob = new Set(
            prev
              .filter((item) => item.src.startsWith('blob:'))
              .map((item) => item.src),
          );

          const newBlob = new Set(
            e.payload
              .filter((item) => item.src.startsWith('blob:'))
              .map((item) => item.src),
          );

          prevBlob.forEach((item) => {
            if (newBlob.has(item)) return;
            URL.revokeObjectURL(item);
          });

          return e.payload;
        }),
      ),
    );

    unlisten.push(
      listen<number>(BackendEvent.SetCurrIdx, (e) => setCurrIdx(e.payload)),
    );

    invoke<string[]>('opened_urls').then((val) => {
      if (val.length === 0) return;
      emit<string[]>(BackendEvent.OpenUri, val);
    });

    unlisten.push(
      getCurrentWebviewWindow().onDragDropEvent((e) => {
        if (e.payload.type === 'drop') {
          emit(BackendEvent.OpenUri, e.payload.paths);
        }
      }),
    );

    return () => unlisten.forEach((item) => item.then((fn) => fn()));
  }, []);

  const currSong = playQueue[currIdx] as Song | undefined;

  // 播放
  useEffect(() => {
    const unlisten = listen(BackendEvent.Play, () => {
      setPaused(false);
      if (audioRef.current && !pending) {
        console.info('Play audio.');
        audioRef.current.play().catch((err) => {
          console.error('Failed to play audio: ' + err);
          showSnackbar(t('msg.playAudioFailed') + '\n' + err, 'error');
        });
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [pending, showSnackbar, t]);

  // 生成随机数列表
  useEffect(() => {
    const len = playQueue.length;
    const array: number[] = [];

    if (len) {
      setCurrIdx((prev) => (prev >= len ? len - 1 : prev));
    } else {
      setCurrIdx(-1);
    }

    for (let i = 0; i < 3; i++) {
      const arr = Array.from({ length: len }, (_, i) => i);
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      array.push(...arr);
    }
    randomIdxListRef.current = array;
  }, [playQueue.length]);

  // 设置上一首、下一首的索引
  useEffect(() => {
    if (currIdx < 0) {
      setPrevIdx(-1);
      setNextIdx(-1);
      return;
    }

    const randIdxMap = randomIdxListRef.current;

    if (config.playbackMode === PlaybackMode.Shuffle) {
      const len = randIdxMap.length;
      const idxInRand = randIdxMap.indexOf(currIdx);
      setPrevIdx(randIdxMap[(idxInRand + len - 1) % len]);
      setNextIdx(randIdxMap[(idxInRand + 1) % len]);
    } else {
      const len = playQueue.length;
      setPrevIdx((currIdx - 1 + len) % len);
      setNextIdx((currIdx + 1) % len);
    }
  }, [config.playbackMode, currIdx, playQueue.length]);

  const canChangeTrack = playQueue.length > 1;

  // 切换当前歌曲
  useEffect(() => {
    const unlisten: Promise<UnlistenFn>[] = [];

    unlisten.push(
      listen(BackendEvent.Next, () => {
        setCurrentTime(0);
        if (audioRef.current) {
          console.info('Next song.');
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (canChangeTrack) {
          setCurrIdx(nextIdx);
        }
      }),
    );

    unlisten.push(
      listen(BackendEvent.Previous, () => {
        setCurrentTime(0);
        if (audioRef.current) {
          console.info('Previous song.');
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        if (canChangeTrack) {
          setCurrIdx(prevIdx);
        }
      }),
    );

    unlisten.push(
      listen<number>(BackendEvent.SetCurrIdx, (e) => {
        setCurrentTime(0);
        if (audioRef.current) {
          console.info(`Set current song index to ${e.payload}.`);
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setCurrIdx(e.payload);
      }),
    );

    return () => unlisten.forEach((item) => item.then((fn) => fn()));
  }, [canChangeTrack, nextIdx, prevIdx]);

  // 快进快退
  useEffect(() => {
    const unlisten: Promise<UnlistenFn>[] = [];

    unlisten.push(
      listen<number | undefined>(BackendEvent.SeekForward, (e) => {
        const audio = audioRef.current;
        if (!audio) return;
        const duration =
          e.payload ??
          (!config.seekBySentence || lyric.length <= 1 ? 10 : undefined);
        let position: number;

        if (duration === undefined) {
          console.info(`Seek forward ${duration}s.`);
          position =
            lyric[
              lyric.findIndex((item) => item.start <= audio.currentTime) + 1
            ].start - config.replayDelay;
        } else {
          console.info('Seek forward one sentence.');
          position = audio.currentTime - duration;
        }

        emit(BackendEvent.SetPosition, Math.max(0, position));
      }),
    );

    unlisten.push(
      listen<number | undefined>(BackendEvent.SeekBackward, (e) => {
        const audio = audioRef.current;
        if (!audio) return;
        const duration =
          e.payload ??
          (!config.seekBySentence || lyric.length <= 1 ? 10 : undefined);
        let position: number;

        if (duration === undefined) {
          console.info(`Seek backward ${duration}s.`);
          position =
            (lyric.find((item) => item.start > audio.currentTime)?.start ||
              Infinity) - config.replayDelay;
        } else {
          console.info('Seek backward one sentence.');
          position = audio.currentTime + duration;
        }

        emit(BackendEvent.SetPosition, Math.min(audio.duration, position));
      }),
    );
  }, [config.replayDelay, config.seekBySentence, lyric]);

  // 处理音量改变
  useEffect(() => {
    const unlisten = listen<number>(BackendEvent.SetVolume, (e) => {
      const audio = audioRef.current;
      if (!audio) return;
      const volume = e.payload;
      updateConfig({ volume });

      if (volume > 1) {
        audio.volume = 1;
        // todo
      } else {
        audio.volume = volume;
        // todo
      }
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [updateConfig]);

  // 处理插入歌曲
  useEffect(() => {
    const unlisten = listen<string[]>(BackendEvent.OpenUri, (e) => {
      const uris = e.payload;
      console.info('Open URIs: ' + JSON.stringify(uris));

      setPlayQueue((prev) => {
        const paths = new Set(prev.map((item) => item.src));
        const songs = uris.map((item) => {
          const url = item.includes('://') ? item : convertFileSrc(item);
          return {
            title: decodeURIComponent(new URL(item).pathname)
              .split(/[\/\\]/)
              .pop()!
              .split('.')[0],
            src: url,
          };
        });

        const filteredSongs = songs.filter((item) => !paths.has(item.src));

        if (filteredSongs.length === 0) {
          const first = songs[0].src;
          setCurrIdx(prev.findIndex((item) => item.src === first));
          setCurrentTime(0);
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
          return prev;
        }

        const newArr = [...prev];
        newArr.splice(currIdx + 1, 0, ...filteredSongs);

        filteredSongs.forEach((item, idx) =>
          setTimeout(async () => {
            try {
              const resp = await fetch(item.src);
              const buffer = await resp.arrayBuffer();
              const meta = await parseBuffer(new Uint8Array(buffer));

              setPlayQueue((oldVal) => {
                const idx = oldVal.findIndex((val) => val.src === item.src);
                if (idx === -1) return oldVal;

                const newVal = [...oldVal];
                if (meta.common.title) {
                  newVal[idx].title = meta.common.title;
                }
                newVal[idx].artists = meta.common.artists?.map((artist) => ({
                  label: artist,
                }));
                if (meta.common.album) {
                  newVal[idx].album = { label: meta.common.album };
                }
                if (meta.common.picture) {
                  const pic = meta.common.picture[0];
                  const blob = new Blob([pic.data as BufferSource], {
                    type: pic.format,
                  });
                  const url = URL.createObjectURL(blob);
                  newVal[idx].cover = url;
                }
                return newVal;
              });
            } catch (err) {
              console.error('Failed to get audio metadata: ' + err);
            }
          }, idx),
        );

        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        setCurrentTime(0);
        setCurrIdx(currIdx + 1);
        setPaused(false);
        return newArr;
      });
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [currIdx]);

  // 初始化Windows任务栏缩略图控件
  useEffect(() => {
    if (!isWindows || WINDOW_LABEL !== 'main') return;

    const unlisten = listen(BackendEvent.ShowMainWindow, async () => {
      console.info('Initialize thumbnail buttons.');
      await invoke('init_thumbnail_buttons');
      invoke('update_buttons', {
        updates: [
          {
            id: TaskbarButtons.Prev,
            enabled: canChangeTrack,
            tooltip: t('media.prev'),
          },
          {
            id: TaskbarButtons.Toggle,
            enabled: !pending && !!currSong,
            paused,
            tooltip: t(paused ? 'media.play' : 'media.pause'),
          },
          {
            id: TaskbarButtons.Next,
            enabled: canChangeTrack,
            tooltip: t('media.next'),
          },
        ],
      });
    });

    return () => {
      unlisten.then((fn) => fn());
    };
  }, [canChangeTrack, currSong, paused, pending, t]);

  // 将元数据显示到系统控件
  useEffect(() => {
    if (WINDOW_LABEL !== 'main') return;

    if ('mediaSession' in navigator) {
      console.info('Update mediaSession.');
      navigator.mediaSession.metadata = currSong
        ? new MediaMetadata({
            title: currSong.title,
            artist: currSong.artists?.map((item) => item.label).join('; '),
            album: currSong.album?.label,
            artwork: currSong.cover ? [{ src: currSong.cover }] : undefined,
          })
        : null;
    } else if (currSong) {
      console.info('Attach media control.');
      invoke('set_metadata', {
        metadata: {
          title: currSong.title,
          artist: currSong.artists?.map((item) => item.label).join('; ') || '',
          album: currSong.album?.label || '',
          cover: currSong.cover || '',
          duration: currSong.duration || 0,
        },
      }).then(() => invoke('attach_media_control'));
    } else {
      console.info('Detach media control.');
      invoke('detach_media_control');
    }

    if (!currSong) setPaused(true);
  }, [currSong]);

  // 同步react状态与系统控件
  useEffect(() => {
    if (WINDOW_LABEL !== 'main') return;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler(
        'previoustrack',
        canChangeTrack ? () => emit(BackendEvent.Previous) : null,
      );
      navigator.mediaSession.setActionHandler(
        'nexttrack',
        canChangeTrack ? () => emit(BackendEvent.Next) : null,
      );
    }
    if (isWindows) {
      invoke('update_buttons', {
        updates: [
          { id: TaskbarButtons.Prev, enabled: canChangeTrack },
          { id: TaskbarButtons.Next, enabled: canChangeTrack },
        ],
      });
    }
  }, [canChangeTrack]);

  useEffect(() => {
    if (WINDOW_LABEL !== 'main' || 'mediaSession' in navigator) return;
    invoke('set_playback', { paused, position: currentTime });
  }, [currentTime, paused]);

  useEffect(() => {
    if (!isWindows || WINDOW_LABEL !== 'main') return;
    invoke('update_buttons', {
      updates: [
        { id: TaskbarButtons.Prev, tooltip: t('media.prev') },
        { id: TaskbarButtons.Next, tooltip: t('media.next') },
      ],
    });
  }, [t]);

  useEffect(() => {
    if (!isWindows || WINDOW_LABEL !== 'main') return;
    invoke('update_buttons', {
      updates: [
        {
          id: TaskbarButtons.Toggle,
          tooltip: paused ? t('media.play') : t('media.pause'),
          enabled: playQueue.length > 0,
          paused,
        },
      ],
    });
  }, [paused, playQueue.length, t]);

  // 更改窗口标题
  useEffect(() => {
    if (config.useMusicTitleAsWindowTitle && currSong?.title) {
      MAIN_WINDOW.setTitle(`${currSong.title} - ${t('common.stringMusic')}`);
    } else {
      MAIN_WINDOW.setTitle(t('common.stringMusic'));
    }
  }, [config.useMusicTitleAsWindowTitle, currSong?.title, t]);

  // 更改窗口图标
  useEffect(() => {
    if (config.useCoverAsIcon && currSong?.cover) {
      imgSrcToBuffer(currSong.cover, isWindows ? 256 : 1024)
        .then((val) => {
          MAIN_WINDOW.setIcon(val);
        })
        .catch(async (err) => {
          console.error('Failed to set cover as icon: ' + err);
          MAIN_WINDOW.setIcon((await defaultWindowIcon())!);
        });
    } else {
      MAIN_WINDOW.setIcon(DEFAULT_WINDOW_ICON);
    }
  }, [config.useCoverAsIcon, currSong?.cover]);

  // 设置当前歌曲，使用双audio元素避免src变化时系统媒体控件短暂消失
  useEffect(() => {
    if (!audioRef.current) return;

    if (currSong?.src) {
      fakeAudioRef.current!.src = currSong?.src;
    } else {
      fakeAudioRef.current!.removeAttribute('src');
    }

    audioRef.current.pause();
    fakeAudioRef.current!.pause();

    [audioRef.current, fakeAudioRef.current] = [
      fakeAudioRef.current,
      audioRef.current,
    ];

    setCurrArrayBuffer(undefined);
    if (currSong?.src) {
      const getArrayBuffer = async () => {
        try {
          const resp = await fetch(currSong.src);
          const buffer = await resp.arrayBuffer();
          if (audioRef.current?.getAttribute('src') === currSong.src) {
            setCurrArrayBuffer(buffer);
          }
        } catch (err) {
          console.error('Failed to get array buffer: ' + err);
        }
      };
      getArrayBuffer();
    }
  }, [currSong?.src]);

  const onTimeUpdate = (e: SyntheticEvent<HTMLAudioElement, Event>) => {
    const int = Math.floor(e.currentTarget.currentTime);
    if (currentTime !== int) {
      emit(BackendEvent.TimeUpdate, int);
    }
  };

  const audioProps = useMemo<ComponentProps<'audio'> | undefined>(
    () =>
      WINDOW_LABEL === 'main'
        ? {
            preload: 'auto',
            onLoadStart: () => {
              emit(BackendEvent.IsLoading, true);
              console.info('Loading audio started.');
            },
            onCanPlay: (e) => {
              if (!paused && e.currentTarget === audioRef.current) {
                e.currentTarget.play();
                if ('mediaSession' in navigator) {
                  navigator.mediaSession.playbackState = 'playing';
                }
              }
              emit(BackendEvent.IsLoading, false);
              console.info('Audio can be played.');
            },
            onError: (e) => {
              const error = e.currentTarget.error;
              if (error && e.currentTarget.getAttribute('src')) {
                const errStr = `${error.message || 'Unknown error'} (Code: ${error.code})`;
                console.error('Failed to load audio: ' + errStr);
                showSnackbar(t('msg.loadAudioFailed') + '\n' + errStr, 'error');
              }
              emit(BackendEvent.IsLoading, false);

              const src = e.currentTarget.src;
              setTimeout(() => {
                if (canChangeTrack && !errRecord.current.has(src)) {
                  emit(BackendEvent.Next);
                  errRecord.current.add(src);
                } else {
                  emit(BackendEvent.Stop);
                }
              }, 1000);
            },
            onEnded: (e) => {
              switch (config.playbackMode) {
                case PlaybackMode.NoRepeat:
                  emit(BackendEvent.Stop);
                  break;
                case PlaybackMode.RepeatOne:
                  e.currentTarget.play();
                  emit(BackendEvent.SetPosition, { position: 0 });
                  break;
                default:
                  e.currentTarget.play();
                  emit(BackendEvent.Next);
                  break;
              }
            },
            onLoadedMetadata: (e) => {
              const newQueue = [...playQueue];
              const curr = newQueue.find(
                (item) => e.currentTarget.getAttribute('src') === item.src,
              );
              if (curr) {
                playQueue[currIdx].duration = e.currentTarget.duration;
                emit<Song[]>(BackendEvent.UpdateQueue, newQueue);
                console.info('Duration data loaded.');
              }
            },
          }
        : undefined,
    [
      canChangeTrack,
      config.playbackMode,
      currIdx,
      paused,
      playQueue,
      showSnackbar,
      t,
    ],
  );

  return (
    <Context.Provider
      value={{
        ...initVal,
        currIdx,
        prevIdx,
        nextIdx,
        playQueue,
        paused,
        pending,
        currentTime,
        lyric,
        currArrayBuffer,
        setLyric,
      }}
    >
      {children}
      {WINDOW_LABEL === 'main' && (
        <>
          <audio ref={audioRef} onTimeUpdate={onTimeUpdate} {...audioProps} />
          <audio
            ref={fakeAudioRef}
            onTimeUpdate={onTimeUpdate}
            {...audioProps}
          />
        </>
      )}
    </Context.Provider>
  );
}
