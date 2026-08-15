export const enum BackendEvent {
  ConfigChanged = 'config-changed',
  Play = 'play',
  CanPlay = 'can-play',
  Pause = 'pause',
  Toggle = 'toggle',
  TimeUpdate = 'time-update',
  Next = 'next',
  Previous = 'previous',
  Stop = 'stop',
  Seek = 'seek',
  SetPosition = 'set-position',
  SetVolume = 'set-volume',
  OpenUri = 'open-uri',
  Raise = 'raise',
  Quit = 'quit',
  UpdateQueue = 'update-queue',
}

export type WindowLabel = 'main' | 'mini' | 'lyric';

export interface EventPayload<T> {
  label: WindowLabel;
  data: T;
}

export interface FontName {
  original: string;
  localized: string;
}

export type SeekDirection = 'Forward' | 'Backward';

export interface Seek {
  direction: SeekDirection;
  duration?: number;
}

export interface SetPosition {
  position: number;
}
