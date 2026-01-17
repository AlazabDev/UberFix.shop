import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arTranslations from './locales/ar';
import enTranslations from './locales/en';

// Safe initialization for mobile browsers
const initI18n = () => {
  try {
    i18n
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources: {
          ar: { translation: arTranslations },
          en: { translation: enTranslations }
        },
        fallbackLng: 'ar',
        lng: 'ar',
        interpolation: {
          escapeValue: false
        },
        detection: {
          // Safer detection that works on mobile
          order: typeof window !== 'undefined' && window.localStorage ? ['localStorage', 'navigator'] : ['navigator'],
          caches: typeof window !== 'undefined' && window.localStorage ? ['localStorage'] : []
        }
      });
  } catch (error) {
    console.warn('i18n initialization error, using defaults:', error);
    // Fallback initialization without detection
    i18n
      .use(initReactI18next)
      .init({
        resources: {
          ar: { translation: arTranslations },
          en: { translation: enTranslations }
        },
        fallbackLng: 'ar',
        lng: 'ar',
        interpolation: {
          escapeValue: false
        }
      });
  }
};

initI18n();

export default i18n;
