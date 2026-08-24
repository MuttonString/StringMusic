export type ConfigContext = [AppConfig, (obj: Partial<AppConfig>) => void];

export const enum CloseWindowAction {
  Ask,
  Minimize,
  Exit,
}

export const enum ColorMode {
  FollowSystem,
  Light,
  Dark,
}

export const enum Colors {
  Amber,
  Blue,
  BlueGrey,
  Brown,
  Cyan,
  DeepOrange,
  DeepPurple,
  Green,
  Grey,
  Indigo,
  LightBlue,
  LightGreen,
  Lime,
  Orange,
  Pink,
  Purple,
  Red,
  Teal,
  Yellow,
}

export const enum BackgroundType {
  Standard,
  Blur, // Windows 6.0.5219 <= ver <= 6.2.8427 or 10.0.10074 <= ver < 10.0.22621 | macOS 10.11+
  Acrylic, // Windows 10.0.16215+
  Mica, // Windows 10.0.22000+
  SinglePicture, // 在小窗下使用专辑封面
  RandomPictures, // 仅桌面端
}

export const enum ShowAudioWave {
  Never,
  OnHover,
  Always,
}

export const enum PlaybackMode {
  NoRepeat,
  RepeatOne,
  RepeatQueue,
  Shuffle,
}

export const enum RomajiMode {
  Disable,
  ByWord,
  BySyllable,
}

export const enum CyrillicToLatinMode {
  Disable,
  Iso9,
  BgnPcgn,
  Gost,
}

export interface AppConfig {
  // 通用
  language: string; // 为空时跟随系统
  closeWindowAction: CloseWindowAction; // 仅在Windows和Linux有效
  autoCheckUpdate: boolean;

  // 音乐源
  // 本地音乐库[]
  // 在线音乐源管理Btn（音乐源下载、账号增加删除）

  // 窗口外观
  colorMode: ColorMode;
  primaryColor: Colors;
  backgroundMainWindow: {
    type: BackgroundType;
    opacity: number; // 仅在标准背景或图片背景时有效
    path: string; // 仅在图片背景时有效
  };
  backgroundMiniWindow: {
    type: Exclude<BackgroundType, BackgroundType.RandomPictures>;
    opacity: number; // 仅在标准背景或图片背景时有效
  };
  globalFont: string; // 为空时使用默认
  advancedMaterial: boolean;
  sharpStyle: boolean;
  animationDuration: number;

  // 播放页外观
  // playbackPageBackground
  // dynamicWaveType
  // coverBounce

  // 桌面歌词
  enableDesktopLyric: boolean;
  lockDesktopLyric: boolean;
  lyricFont: string; // 为空时跟随全局
  longitudinal: boolean;
  textStroke: boolean;
  textShadow: boolean;

  // 注音
  pronFromApiFirst: boolean;
  jpRomaji: RomajiMode;
  yahooAppId: string;
  furigana: boolean;
  katakanaRuby: boolean;
  kanjiFix: boolean;
  removeParenthesisPron: boolean;
  hangulPron: boolean;
  cyrillicPron: CyrillicToLatinMode;
  otherPron: boolean;

  // 音频播放
  audioDevice: string; // 为空时跟随系统 仅setSinkId()可用时有效
  showAudioWave: ShowAudioWave;
  coverRotate: boolean;
  useCoverAsIcon: boolean;
  useMusicTitleAsWindowTitle: boolean;
  seekBySentence: boolean;
  replaceWholeList: boolean;
  replayDelay: number;
  volume: number;
  dynamicVolume: boolean;
  canVolumnOver100: boolean;
  speed: number;
  audioFade: boolean;
  enableEqualizer: boolean;
  equalizerSliderMoveTogether: boolean;
  equalizer: [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  detune: number;
  playbackMode: PlaybackMode;

  // 隐私
  recommendation: boolean;
  recentPlayed: boolean;
  searchHistory: boolean;
  savePlaybackStatus: boolean;
  keepDownloadHistory: boolean;

  // 快捷操作

  // 开发者选项
  enableDevOptions: boolean;
  forceRTL: boolean;
  showFooter: boolean;
  script: string;
}
