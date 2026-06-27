import { invoke } from '@tauri-apps/api/core';
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
      },
      colorRing: {
        red: 'Red',
        orange: 'Orange',
        yellow: 'Yellow',
        lime: 'Lime',
        green: 'Green',
        cyan: 'Cyan',
        blue: 'Blue',
        purple: 'Purple',
        pink: 'Pink',
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
      },
      colorRing: {
        red: '红色',
        orange: '橙色',
        yellow: '黄色',
        lime: '青柠色',
        green: '绿色',
        cyan: '青色',
        blue: '蓝色',
        purple: '紫色',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
});

export default i18n;

/**
 * 检测字符串语言，若非汉语、日语，返回空字符串
 */
export async function detectLang(text: string): Promise<'zh' | 'ja' | ''> {
  try {
    const lang = await invoke('detect_lang', { text });
    switch (lang) {
      case 'Chinese':
        return 'zh';
      case 'Japanese':
        return 'ja';
      default:
        return '';
    }
  } catch (err) {
    console.error('Failed to detect text language: ' + err);
    return '';
  }
}
