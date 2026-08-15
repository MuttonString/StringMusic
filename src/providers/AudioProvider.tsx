import { invoke } from '@tauri-apps/api/core';
import { emit, listen } from '@tauri-apps/api/event';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { WINDOW_LABEL } from '../constants/window';
import type { Seek, SetPosition } from '../types/backend';
import { BackendEvent } from '../types/backend';
import type { ChildrenProp } from '../types/component';
import {
  TaskbarButtons,
  type LyricSentence,
  type MediaContext,
  type Song,
} from '../types/media';
import { destroyAll, raise } from '../utils/window';
import { useConfig } from './ConfigProvider';

const initVal: MediaContext = {
  play: () => emit(BackendEvent.Play),
  pause: () => emit(BackendEvent.Pause),
  prev: () => emit(BackendEvent.Previous),
  next: () => emit(BackendEvent.Next),
  seekBackward: () => emit<Seek>(BackendEvent.Seek, { direction: 'Backward' }),
  seekForward: () => emit<Seek>(BackendEvent.Seek, { direction: 'Forward' }),
  updateQueue: (newQueue: Song[]) => emit(BackendEvent.UpdateQueue, newQueue),
  setLyric() {},
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

export const useAudioProvider = () => useContext(Context);

export function AudioProvider({ children }: ChildrenProp) {
  const [config, updateConfig] = useConfig();
  const audioRef = useRef<HTMLAudioElement>(null);
  const randomIdxListRef = useRef<number[]>([]);

  const [currIdx, setCurrIdx] = useState(-1);
  const [prevIdx, setPrevIdx] = useState(-1);
  const [nextIdx, setNextIdx] = useState(-1);
  const [playQueue, setPlayQueue] = useState<Song[]>([]);
  const [paused, setPaused] = useState(true);
  const [pending, setPending] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [lyric, setLyric] = useState<LyricSentence[]>([]);

  const currMetadata = playQueue[currIdx];
  const canChangeTrack = playQueue.length > 1;

  useEffect(() => {
    const len = playQueue.length;

    const arr = Array.from({ length: len }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    randomIdxListRef.current = arr;
  }, [playQueue]);

  useEffect(() => {
    if (currIdx < 0) return;
    const randIdxMap = randomIdxListRef.current;
    const len = randIdxMap.length;

    if (config.shuffle) {
      const idxInRand = randIdxMap.indexOf(currIdx);
      setPrevIdx(randIdxMap[(idxInRand + len - 1) % len]);
      setNextIdx(randIdxMap[(idxInRand + 1) % len]);
    } else {
      setPrevIdx((currIdx - 1 + len) % len);
      setNextIdx((currIdx + 1) % len);
    }
  }, [config.shuffle, currIdx]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () =>
        emit(BackendEvent.Play),
      );
      navigator.mediaSession.setActionHandler('pause', () =>
        emit(BackendEvent.Pause),
      );
      navigator.mediaSession.setActionHandler('seekbackward', (e) =>
        emit<Seek>(BackendEvent.Seek, {
          direction: 'Backward',
          duration: e.seekOffset,
        }),
      );
      navigator.mediaSession.setActionHandler('seekforward', (e) =>
        emit<Seek>(BackendEvent.Seek, {
          direction: 'Forward',
          duration: e.seekOffset,
        }),
      );
      navigator.mediaSession.setActionHandler('previoustrack', () =>
        emit(BackendEvent.Previous),
      );
      navigator.mediaSession.setActionHandler('nexttrack', () =>
        emit(BackendEvent.Next),
      );
    }

    const unlistenCanPlay = listen(BackendEvent.CanPlay, () => {
      invoke('update_buttons', {
        updates: [{ id: TaskbarButtons.Toggle, enabled: true }],
      });
      setPending(false);
    });

    const position = audioRef.current?.currentTime || 0;
    const paused = audioRef.current?.paused ?? true;

    const unlistenPlay = listen(BackendEvent.Play, () => {
      audioRef.current?.play();
      invoke('set_playback', { paused: false, position });
      invoke('update_buttons', {
        updates: [{ id: TaskbarButtons.Toggle, paused: false }],
      });
      setPaused(false);
    });

    const unlistenPause = listen(BackendEvent.Pause, () => {
      audioRef.current?.pause();
      invoke('set_playback', { paused: true, position });
      invoke('update_buttons', {
        updates: [{ id: TaskbarButtons.Toggle, paused: true }],
      });
      setPaused(true);
    });

    const unlistenToggle = listen(BackendEvent.Toggle, () => {
      audioRef.current?.[paused ? 'play' : 'pause']();
      invoke('set_playback', { paused: !paused, position });
      invoke('update_buttons', {
        updates: [{ id: TaskbarButtons.Toggle, paused: !paused }],
      });
      setPaused(!paused);
    });

    const unlistenTimeUpdate = listen<number>(BackendEvent.TimeUpdate, (e) => {
      setCurrentTime(e.payload);
    });

    const unlistenStop = listen(BackendEvent.Stop, () => {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      setCurrentTime(0);
    });

    const unlistenSetPosition = listen<SetPosition>(
      BackendEvent.SetPosition,
      (e) => {
        const pos = e.payload.position;
        if (audioRef.current) audioRef.current.currentTime = pos / 1000;
        setCurrentTime(pos);
      },
    );

    const unlistenSetVolume = listen<number>(BackendEvent.SetVolume, (e) => {
      const volume = e.payload;

      if (volume > 100) {
        // todo
      }
    });

    const unlistenOpenUri = listen<string>(BackendEvent.OpenUri, (e) => {
      // todo
      console.log(e.payload);
    });

    const unlistenRaise = listen(BackendEvent.Raise, raise);

    const unlistenQuit = listen(BackendEvent.Quit, destroyAll);

    const unlistenUpdateQueue = listen<Song[]>(
      BackendEvent.UpdateQueue,
      (e) => {
        setPlayQueue(e.payload);
      },
    );

    return () => {
      unlistenCanPlay.then((fn) => fn());
      unlistenPlay.then((fn) => fn());
      unlistenPause.then((fn) => fn());
      unlistenToggle.then((fn) => fn());
      unlistenTimeUpdate.then((fn) => fn());
      unlistenStop.then((fn) => fn());
      unlistenSetPosition.then((fn) => fn());
      unlistenSetVolume.then((fn) => fn());
      unlistenOpenUri.then((fn) => fn());
      unlistenRaise.then((fn) => fn());
      unlistenQuit.then((fn) => fn());
      unlistenUpdateQueue.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    const unlistenSeek = listen<Seek>(BackendEvent.Seek, (e) => {
      const audio = audioRef.current;
      const duration =
        e.payload.duration ??
        (!config.seekBySentence || lyric.length <= 1 ? 10_000 : undefined);

      if (e.payload.direction === 'Forward') {
        if (duration === undefined) {
          if (audio) {
            const pos = Math.max(
              audio.duration * 1000,
              lyric.find((item) => item.start <= audio.currentTime)!.start -
                config.replayDelay,
            );
            audio.currentTime = pos / 1000;
            setCurrentTime(pos);
          } else {
            setCurrentTime((val) => val + 10_000);
          }
        } else {
          if (audio) {
            const pos = Math.max(0, audio.currentTime - duration);
            audio.currentTime = pos / 1000;
            setCurrentTime(pos);
          } else {
            setCurrentTime((val) => val - duration);
          }
        }
      } else {
        if (duration === undefined) {
          if (audio) {
            const pos = Math.min(
              audio.duration,
              lyric[
                lyric.findIndex((item) => item.start <= audio.currentTime) + 1
              ].start - config.replayDelay,
            );
            audio.currentTime = pos / 1000;
            setCurrentTime(pos);
          } else {
            setCurrentTime((val) => val - 10_000);
          }
        } else {
          if (audio) {
            const pos = Math.max(0, audio.currentTime - duration);
            audio.currentTime = pos / 1000;
            setCurrentTime(pos);
          } else {
            setCurrentTime((val) => val - duration);
          }
        }
      }
    });

    return () => {
      unlistenSeek.then((fn) => fn());
    };
  }, [config.replayDelay, config.seekBySentence, lyric]);

  useEffect(() => {
    const unlistenNext = listen(BackendEvent.Next, () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      if (canChangeTrack) {
        setCurrIdx(nextIdx);
        setPending(true);
      }
    });

    const unlistenPrev = listen(BackendEvent.Previous, () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        setCurrentTime(0);
      }
      if (canChangeTrack) {
        setCurrIdx(prevIdx);
        setPending(true);
      }
    });

    return () => {
      unlistenNext.then((fn) => fn());
      unlistenPrev.then((fn) => fn());
    };
  }, [canChangeTrack, nextIdx, prevIdx]);

  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = currMetadata
        ? new MediaMetadata({
            title: currMetadata.title,
            artist: currMetadata.artist?.map((item) => item.label).join(', '),
            album: currMetadata.album?.label,
            artwork: currMetadata.cover
              ? [{ src: currMetadata.cover }]
              : undefined,
          })
        : null;
    }

    invoke('set_metadata', {
      metadata: {
        title: currMetadata.title,
        artist: currMetadata.artist?.map((item) => item.label).join(', '),
        album: currMetadata.album?.label,
        cover: currMetadata.cover,
        duration: currMetadata.duration,
      },
    });
  }, [currMetadata]);

  useEffect(() => {
    invoke('update_buttons', {
      updates: [
        { id: TaskbarButtons.Prev, enabled: canChangeTrack },
        { id: TaskbarButtons.Next, enabled: canChangeTrack },
      ],
    });
  }, [canChangeTrack]);

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
        setLyric,
      }}
    >
      {children}
      {WINDOW_LABEL === 'main' && (
        <audio
          ref={audioRef}
          preload='auto'
          onVolumeChange={(e) =>
            updateConfig({ volume: e.currentTarget.volume })
          }
        />
      )}
    </Context.Provider>
  );
}
