export enum CloseWindowAction {
  Ask,
  Minimize,
  Exit,
}

export enum ColorMode {
  FollowSystem,
  Light,
  Dark,
}

export enum BackgroundType {
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

export enum BlurEffect {
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

export enum CheckFrequency {
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
      sc: string;
      /**
       * Follow global when empty
       */
      tc: string;
      /**
       * Follow global when empty
       */
      jp: string;
      /**
       * Follow global when empty
       */
      kr: string;
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
