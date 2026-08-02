// 当某个枚举的数量变动时，务必在 src/components/Settings/index.tsx 中同步修改对应的getProperNumber的max参数

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

export const enum BackgroundType {
  Default,
  Translucent,
  /**
   * Windows/macOS only;
   * Windows: 6.0.5219 <= ver <= 6.2.8427 or ver >= 10.0.10074
   * macOS: ver >= 10.11
   */
  Blur,
  Picture,
  /**
   * Desktop only
   */
  Folder,
}

export const enum BlurEffect {
  /**
   * Windows 7/10/11(22H1) only;
   * 6.0.5219 <= ver <= 6.2.8427 or 10.0.10074 <= ver < 10.0.22621
   */
  Blur,
  /**
   * Windows 10/11 only;
   * ver >= 10.0.16215
   */
  Acrylic,
  /**
   * Windows 11 only;
   * ver >= 10.0.22000
   */
  Mica,
  /**
   * macOS 10.11+ only, main window uses Sidebar, mini window uses [UnderWindowBackground, Sidebar]
   */
  Vibrancy,
}

export const enum CheckFrequency {
  EveryDay,
  EveryWeek,
  EveryMonth,
  Never,
}

export const enum ShowWave {
  Never,
  OnHover,
  Always,
}

interface BackgroundSettings {
  type: BackgroundType;
  /**
   * 0~100
   */
  opacity: number;
  blurEffect: BlurEffect;
  picture: string;
  folder: string;
}

export interface ISettings {
  common: {
    /**
     * Follow system when empty
     */
    language: string;
    /**
     * Windows/Linux only
     */
    closeWindow: CloseWindowAction;
  };

  desktopLyric: {
    longitudinal: boolean;
  };

  personalization: {
    colorMode: ColorMode;
    primaryColor: {
      followSystem: boolean;
      hex: string;
    };
    background: BackgroundSettings;
    backgroundMini: BackgroundSettings;
    font: {
      /**
       * Default when empty
       */
      global: string;
      /**
       * Follow global when empty
       */
      zh: string;
      /**
       * Follow global when empty
       */
      ja: string;
      /**
       * Follow global when empty
       */
      other: string;
    };
    advancedMaterial: boolean;
    disableRoundCorner: boolean;
    animationDuration: number;
  };

  playback: {
    coverRotate: boolean;
  };

  privacy: {
    recommendation: boolean;
    recent: boolean;
    searchHistory: boolean;
    savePlaying: boolean;
  };

  download: {
    autoClear: boolean;
    maxCount: number;
    finishTip: boolean;
  };

  update: {
    checkUpdate: CheckFrequency;
    timestamp: number;
  };

  developerOptions: {
    enabled: boolean;
    forceRTL: boolean;
    showFooter: boolean;
    script: string;
  };
}
