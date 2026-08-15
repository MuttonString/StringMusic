import { CAN_SET_SINK_ID, IS_APPLE, IS_DESKTOP } from './os';

export const CONFIG_GROUP_ID_LIST = [
  'common',
  'windowAppearance',
  'playbackPageAppearance',
  'desktopLyric',
  'pronunciationAnnotation',
  'playback',
  'privacy',
  'quickOperation',
  'about',
] as const;

export const DEV_CONFIG_GROUP_ID_LIST = 'devOptions';

export const CONFIG_ID_LIST = [
  'language',
  IS_DESKTOP && !IS_APPLE && 'closeWindowAction',
  'autoCheckUpdate',

  'colorMode',
  'primaryColor',
  'backgroundMainWindow',
  'backgroundMiniWindow',
  'globalFont',
  'advancedMaterial',
  'sharpStyle',
  'animationDuration',

  // playbackPageBackground
  // dynamicWaveType
  // coverBounce

  'enableDesktopLyric',
  'lockDesktopLyric',
  'lyricFont',
  'longitudinal',
  'textStroke',
  'textShadow',

  'pronFromApiFirst',
  'jpRomaji',
  'yahooAppId',
  'furigana',
  'katakanaRuby',
  'kanjiFix',
  'removeParenthesisPron',
  'hangulPron',
  'cyrillicPron',
  'otherPron',

  CAN_SET_SINK_ID && 'audioDevice',
  'showAudioWave',
  'coverRotate',
  'seekBySentence',
  'replaceWholeList',
  'replayDelay',
  'volume',
  'dynamicVolume',
  'canVolumnOver100',
  'speed',
  'audioFade',
  'enableEqualizer',
  'equalizerSliderMoveTogether',
  'equalizer',
  'detune',
  'repeatMode',
  'shuffle',

  'recommendation',
  'recentPlayed',
  'searchHistory',
  'savePlaybackStatus',
  'keepDownloadHistory',
].filter(Boolean) as string[];

export const DEV_CONFIG_ID_LIST = [
  'enableDevOptions',
  'forceRTL',
  'showFooter',
  'script',
  IS_DESKTOP && 'openAppdata',
  IS_DESKTOP && 'openLog',
  'throwError',
  'crash',
].filter(Boolean) as string[];
