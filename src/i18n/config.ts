export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'ar'],
  fallbackLocale: 'en',

  // Date formatting
  dateFormats: {
    en: 'MM/DD/YYYY',
    ar: 'DD/MM/YYYY',
  },

  // Time formatting
  timeFormats: {
    en: 'hh:mm A',
    ar: 'hh:mm A',
  },

  // Number formatting
  numberFormats: {
    en: {
      decimal: '.',
      thousand: ',',
    },
    ar: {
      decimal: '٫',
      thousand: '٬',
    },
  },

  // RTL languages
  rtlLocales: ['ar'],

  // Currency formats
  currencyFormats: {
    en: { symbol: '$', position: 'before' },
    ar: { symbol: 'ر.س', position: 'after' },
  },
} as const;

export type Locale = (typeof i18nConfig.locales)[number];
