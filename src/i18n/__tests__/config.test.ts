import { describe, it, expect } from 'vitest';
import { i18nConfig } from '../config';

describe('i18nConfig', () => {
  it('should have default locale set', () => {
    expect(i18nConfig.defaultLocale).toBe('en');
  });

  it('should have fallback locale set', () => {
    expect(i18nConfig.fallbackLocale).toBe('en');
  });

  it('should have multiple locales defined', () => {
    expect(i18nConfig.locales.length).toBeGreaterThan(0);
    expect(i18nConfig.locales).toContain('en');
    expect(i18nConfig.locales).toContain('ar');
  });

  it('should have date formats for all locales', () => {
    i18nConfig.locales.forEach((locale) => {
      expect(i18nConfig.dateFormats).toHaveProperty(locale);
      expect(i18nConfig.dateFormats[locale]).toBeTruthy();
    });
  });

  it('should have time formats for all locales', () => {
    i18nConfig.locales.forEach((locale) => {
      expect(i18nConfig.timeFormats).toHaveProperty(locale);
      expect(i18nConfig.timeFormats[locale]).toBeTruthy();
    });
  });

  it('should have number formats for all locales', () => {
    i18nConfig.locales.forEach((locale) => {
      expect(i18nConfig.numberFormats).toHaveProperty(locale);
      expect(i18nConfig.numberFormats[locale]).toHaveProperty('decimal');
      expect(i18nConfig.numberFormats[locale]).toHaveProperty('thousand');
    });
  });

  it('should identify RTL languages correctly', () => {
    expect(i18nConfig.rtlLocales).toContain('ar');
    expect(i18nConfig.rtlLocales).not.toContain('en');
  });

  it('should have currency formats for all locales', () => {
    i18nConfig.locales.forEach((locale) => {
      expect(i18nConfig.currencyFormats).toHaveProperty(locale);
      expect(i18nConfig.currencyFormats[locale]).toHaveProperty('symbol');
      expect(i18nConfig.currencyFormats[locale]).toHaveProperty('position');
    });
  });

  it('should have correct currency symbols', () => {
    expect(i18nConfig.currencyFormats.en.symbol).toBe('$');
    expect(i18nConfig.currencyFormats.ar.symbol).toBe('ر.س');
  });

  it('should have correct currency positions', () => {
    expect(i18nConfig.currencyFormats.en.position).toBe('before');
    expect(i18nConfig.currencyFormats.ar.position).toBe('after');
  });
});

