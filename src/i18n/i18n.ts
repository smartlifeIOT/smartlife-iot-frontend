import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { i18nConfig } from './config.ts';

// Import translations
import enTranslations from './locales/en.json';
import arTranslations from './locales/ar.json';

const resources = {
  en: { translation: enTranslations },
  ar: { translation: arTranslations },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: i18nConfig.fallbackLocale,
    supportedLngs: ['en', 'ar'], // Only support English and Arabic
    debug: import.meta.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false, // React already escapes values
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    react: {
      useSuspense: false,
    },
  });

// Helper function to get direction from language
export const getDirection = (lng: string): 'ltr' | 'rtl' => {
  return i18nConfig.rtlLocales.includes(lng as 'ar') ? 'rtl' : 'ltr';
};

// Update HTML lang and dir attributes on language change
i18n.on('languageChanged', (lng) => {
  const direction = getDirection(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = direction;
});

// Set initial direction on load
const initialDirection = getDirection(i18n.language);
document.documentElement.lang = i18n.language;
document.documentElement.dir = initialDirection;

export default i18n;
