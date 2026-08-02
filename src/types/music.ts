export interface MusicItem {
  pathOrId: string;
  /**
   * Online music only
   */
  api?: string;
}

export interface MusicMetadata {
  title: string;
  artist?: string;
  album?: string;
  duration: number;
  cover?: string;
}

export const enum RepeatMode {
  NoRepeat,
  RepeatOne,
  RepeatQueue,
}

export interface MusicState {
  playingIdx: number;
  playQueue: MusicItem[];
  progress: number;
  volume: number;
  mute: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;

  radio: boolean;
  meta?: MusicMetadata;
  loading: boolean;
  playing: boolean;
  lrc: string;
}

export const NoSavingState: readonly (keyof MusicState)[] = [
  'radio',
  'meta',
  'loading',
  'playing',
  'lrc',
] as const;
