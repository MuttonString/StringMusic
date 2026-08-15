import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../assets/lang/en.json';
import zh from '../assets/lang/zh.json';
import { BuiltInLang } from '../types/lang';

i18n.use(initReactI18next).init({
  resources: {
    [BuiltInLang.zh]: { translation: zh },
    [BuiltInLang.en]: { translation: en },
  },
  fallbackLng: { zh: [BuiltInLang.zh], default: [BuiltInLang.en] },
});

export default i18n;
