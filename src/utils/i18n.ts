import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// the translations
// (tip move them in a JSON file and import them,
// or even better, manage them separated from your code: https://react.i18next.com/guides/multiple-translation-files)
const resources = {
  en: {
    languageCode: 'en',
    regionCodes: 'US',
    direction: 'ltr',
    translation: {
      titleBar: { stringMusic: 'String Music' },
      msg: {
        pressToEnableDevOpt:
          'Press F12 {{n}} more times to enable developer options',
      },
      colorDialog: {
        title: 'Choose color',
        new: 'New',
        current: 'Current',
        preview: 'Preview',
        r: 'Red',
        g: 'Green',
        b: 'Blue',
        h: 'Hue',
        s: 'Saturation',
        v: 'Value',
        hex: 'Hex',
        recommendColor: 'Recommend color',
        red: 'Red',
        pink: 'Pink',
        purple: 'Purple',
        deepPurple: 'Deep purple',
        indigo: 'Indigo',
        blue: 'Blue',
        lightBlue: 'Light blue',
        cyan: 'Cyan',
        teal: 'Teal',
        green: 'Green',
        lightGreen: 'Light green',
        lime: 'Lime',
        yellow: 'Yellow',
        amber: 'Amber',
        orange: 'Orange',
        deepOrange: 'Deep orange',
        cancel: 'Cancel',
        apply: 'Apply',
      },
    },
  },
  zhCN: {
    translation: {
      titleBar: { stringMusic: 'String 音乐' },
      msg: {
        pressToEnableDevOpt: '再按 {{n}} 次 F12 以启用开发者选项',
      },
      colorDialog: {
        title: '选取颜色',
        new: '新的',
        current: '当前',
        preview: '预览',
        r: '红色',
        g: '绿色',
        b: '蓝色',
        h: '色相',
        s: '饱和度',
        v: '明度',
        hex: '十六进制',
        recommendColor: '建议颜色',
        red: '红色',
        pink: '粉色',
        purple: '紫色',
        deepPurple: '深紫色',
        indigo: '靛蓝色',
        blue: '蓝色',
        lightBlue: '浅蓝色',
        cyan: '青色',
        teal: '蓝绿色',
        green: '绿色',
        lightGreen: '浅绿色',
        lime: '青柠色',
        yellow: '黄色',
        amber: '琥珀色',
        orange: '橙色',
        deepOrange: '深橙色',
        cancel: '取消',
        apply: '应用',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
});

export default i18n;
