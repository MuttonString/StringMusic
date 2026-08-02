import { join } from '@tauri-apps/api/path';
import { BaseDirectory, exists, readTextFile } from '@tauri-apps/plugin-fs';
import { locale } from '@tauri-apps/plugin-os';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../assets/lang/en.json';
import zh from '../assets/lang/zh.json';
import type { ResInfo } from '../types/resource';

// 内置语言的伪文件夹名和tag名，加入特殊字符避免和外置语言的文件夹名和tag名冲突
export const enum BuiltInLang {
  zh = '://zh-Hans',
  en = '://en',
}

i18n.use(initReactI18next).init({
  resources: {
    [BuiltInLang.zh]: { translation: zh },
    [BuiltInLang.en]: { translation: en },
  },
  fallbackLng: { zh: [BuiltInLang.zh], default: [BuiltInLang.en] },
});

export default i18n;

/**
 * 检测字符串语言，未知则返回空字符串
 */
export function detectLang(text: string) {
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return 'ja';
  }
  if (/[\uAC00-\uD7AF]/.test(text)) {
    return 'ko';
  }
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return 'zh';
  }
  if (/[\u0400-\u04FF]/.test(text)) {
    return 'ru';
  }
  return '';
}

/**
 * 判断语言是否是内置的
 */
export function isBuiltInLang(langBaseDirPath: string) {
  return [BuiltInLang.zh, BuiltInLang.en].includes(
    langBaseDirPath as BuiltInLang,
  );
}

/**
 * 获取正在使用的语言，语言标签会被规范化
 */
export function getLangs() {
  return Intl.getCanonicalLocales(
    i18n.languages.map((lang) =>
      lang.startsWith('://') ? lang.substring(3) : lang,
    ),
  );
}

/**
 * 载入并更改语言，然后释放不使用的语言资源，返回boolean表示是否成功更改
 */
export async function setLang(langBaseDirPath: string) {
  try {
    if (!langBaseDirPath) {
      const loc = (await locale()) || 'en';
      await i18n.changeLanguage(loc);
      document.documentElement.lang = loc;
      return true;
    }

    if (isBuiltInLang(langBaseDirPath)) {
      await i18n.changeLanguage(langBaseDirPath);
      Object.keys(i18n.services.resourceStore.data).forEach((lng) => {
        if (isBuiltInLang(lng as BuiltInLang)) return;
        i18n.removeResourceBundle(lng, 'translation');
      });
      document.documentElement.lang = langBaseDirPath.substring(3);
      return true;
    }

    const infoPath = await join('lang', langBaseDirPath, 'info.json');
    const indexPath = await join('lang', langBaseDirPath, 'index.json');

    if (
      !(await exists(infoPath, { baseDir: BaseDirectory.AppData })) ||
      !(await exists(indexPath, { baseDir: BaseDirectory.AppData }))
    ) {
      return false;
    }
    const info = JSON.parse(
      await readTextFile(infoPath, { baseDir: BaseDirectory.AppData }),
    ) as ResInfo;
    const res = JSON.parse(
      await readTextFile(indexPath, { baseDir: BaseDirectory.AppData }),
    );

    i18n.addResourceBundle(info.lang, 'translation', res);
    await i18n.changeLanguage(info.lang);
    document.documentElement.lang = info.lang;

    Object.keys(i18n.services.resourceStore.data).forEach((lng) => {
      if ([BuiltInLang.zh, BuiltInLang.en, info.lang].includes(lng)) return;
      i18n.removeResourceBundle(lng, 'translation');
    });
  } catch (err) {
    console.error(
      `Failed to apply language resource in ${langBaseDirPath}: ${err}`,
    );
    return false;
  }
  return true;
}
