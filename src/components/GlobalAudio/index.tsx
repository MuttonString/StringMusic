import { convertFileSrc } from '@tauri-apps/api/core';
import type { Event as TauriEvent } from '@tauri-apps/api/event';
import { emit, listen } from '@tauri-apps/api/event';
import { parseBuffer } from 'music-metadata';
import type { SyntheticEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import useMusicState from '../../hooks/useMediaState';
import useThrottle from '../../hooks/useThrottle';

export default function GlobalAudio() {
  const [musicState, setMusicState] = useMusicState();
  const audioRef = useRef<HTMLAudioElement>(null);
  const current = musicState?.playQueue[musicState.playingIdx];
  const [src, setSrc] = useState<string>();

  const handleProgress = useThrottle(
    (e?: SyntheticEvent<HTMLAudioElement, Event>) => {
      if (e) setMusicState('progress', e?.currentTarget.currentTime);
    },
    5000,
  );

  useEffect(() => {
    const unlistenPlay = listen('play', (e: TauriEvent<number | undefined>) => {
      if (typeof e.payload === 'number')
        audioRef.current!.currentTime = e.payload;
      audioRef.current!.play();
    });
    const unlistenPause = listen('pause', () => audioRef.current!.pause());
    const unlistenChange = listen(
      'time_changed',
      (e: TauriEvent<number>) => (audioRef.current!.currentTime = e.payload),
    );

    return () => {
      unlistenPlay.then((fn) => fn());
      unlistenPause.then((fn) => fn());
      unlistenChange.then((fn) => fn());
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      emit('pause').catch((err) =>
        console.error('Failed to pause audio: ' + err),
      );
      audioRef.current.currentTime = 0;
      setMusicState('progress', 0);
    }

    if (!current?.pathOrId) {
      setMusicState('loading', false);
      setMusicState('meta', undefined);
      return;
    }

    setMusicState('loading', true);
    let newSrc: string;

    const getMeta = async (url: string) => {
      try {
        const resp = await fetch(url);
        const buffer = await resp.arrayBuffer();
        const meta = await parseBuffer(new Uint8Array(buffer));

        const pic = meta.common.picture;
        let cover = '';
        if (pic) {
          const blob = new Blob([pic[0].data as BufferSource], {
            type: pic[0].format,
          });
          cover = URL.createObjectURL(blob);
        }

        setMusicState('meta', {
          title:
            meta.common.title ||
            decodeURIComponent(new URL(url).pathname)
              .split(/[\/\\]/)
              .pop()!
              .split('.')[0],
          artist: meta.common.artist,
          album: meta.common.album,
          duration: meta.format.duration,
          cover,
        });
        if (cover) {
          return () => URL.revokeObjectURL(cover);
        }
      } catch (err) {
        console.error('Failed to get audio metadata: ' + err);
      }
    };

    if (current.api) {
      // todo
      newSrc = '';
    } else {
      const path = current.pathOrId;
      if (/^https?:\/\//.test(path)) {
        newSrc = current.pathOrId;
      } else {
        newSrc = convertFileSrc(path);
      }
    }
    setSrc(newSrc);

    const revoke = getMeta(newSrc);
    return () => {
      revoke.then((fn) => fn?.());
    };
  }, [current?.api, current?.pathOrId, setMusicState]);

  return (
    musicState && (
      <audio
        ref={audioRef}
        preload='auto'
        src={src}
        onCanPlay={() => {
          setMusicState('loading', false);
          if (musicState.playing) {
            emit('play').catch((err) =>
              console.error('Failed to play audio: ' + err),
            );
          }
        }}
        onTimeUpdate={handleProgress}
        onLoadedMetadata={() => {
          if (musicState.meta && musicState.meta.duration === undefined) {
            setMusicState('meta', {
              ...musicState.meta,
              duration: audioRef.current!.duration,
            });
          }
        }}
        onEnded={() => {
          emit('time_changed', 0);
          // todo
        }}
      />
    )
  );
}
