import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';
import en from './locales/en.json';

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('lang') || 'ar',
    fallbackLng: 'ar',
    interpolation: { escapeValue: false },
  });

export default i18n;
