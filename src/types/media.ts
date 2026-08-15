import type { ReactNode } from 'react';

export interface MediaContext extends MediaState {
  play: () => void;
  pause: () => void;
  prev: () => void;
  next: () => void;
  seekBackward: () => void;
  seekForward: () => void;
  updateQueue: (newQueue: Song[]) => void;
  setLyric: (lyric: LyricSentence[]) => void;
}

export enum TaskbarButtons {
  Prev = 1001,
  Toggle = 1002,
  Next = 1003,
}

export interface DetailMetadata {
  id?: string;
  api?: string;
  label: string;
}

export interface Song {
  id?: string; // 仅在线歌曲
  api?: string; // 仅在线歌曲
  src: string;
  title: string;
  artist?: DetailMetadata[];
  album?: DetailMetadata;
  cover?: string;
  duration?: number;
}

export interface LyricSentence {
  start: number;
  text: ReactNode;
  pron?: string;
  words?: { start: number; text: string }[];
}

export interface MediaState {
  currIdx: number; // 无正在播放的歌曲时为-1
  prevIdx: number;
  nextIdx: number;
  playQueue: Song[];
  paused: boolean;
  pending: boolean;
  currentTime: number;
  lyric: LyricSentence[];
}
