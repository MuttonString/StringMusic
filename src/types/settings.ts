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
  Never,
  EveryDay,
  EveryWeek,
  EveryMonth,
}

export interface ISettings {
  common: {
    /**
     * Windows/macOS/Linux only
     */
    autorun: boolean;
    closeWindow: CloseWindowAction;
  };

  internationalization: {
    /**
     * Follow system when empty
     */
    language: string;
    detectNameLanguage: boolean;
    detectLyricLanguage: boolean;
  };

  desktopLyric: {
    longitudinal: boolean;
  };

  personalization: {
    colorMode: ColorMode;
    primaryColor: {
      auto: boolean;
      hex: string;
    };
    background: {
      type: BackgroundType;
      /**
       * 0~100
       */
      opacity: number;
      blurEffect: BlurEffect;
      picturePath: string;
      folderPath: string;
    };
    backgroundMini: {
      type: BackgroundType;
      /**
       * 0~100
       */
      opacity: number;
      blurEffect: BlurEffect;
      picturePath: string;
      folderPath: string;
    };
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
    };
    advancedMaterial: boolean;
    disableAnimation: boolean;
    disableRoundCorner: boolean;
  };

  about: {
    checkUpdate: CheckFrequency;
  };

  developerOptions: {
    enabled: boolean;
    forceRTL: boolean;
    showFooter: boolean;
    showUnsupportedOperations: boolean;
  };
}
