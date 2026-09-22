import { describe, it, expect } from 'vitest';
import { languages, getLanguage, isRTL } from '../languages';
import { i18nConfig } from '../config';

describe('Languages', () => {
  it('should have at least English and Arabic languages', () => {
    expect(languages.length).toBeGreaterThanOrEqual(2);
    
    const english = languages.find((lang) => lang.code === 'en');
    const arabic = languages.find((lang) => lang.code === 'ar');
    
    expect(english).toBeDefined();
    expect(arabic).toBeDefined();
  });

  it('should have correct properties for each language', () => {
    languages.forEach((language) => {
      expect(language).toHaveProperty('code');
      expect(language).toHaveProperty('name');
      expect(language).toHaveProperty('nativeName');
      expect(language).toHaveProperty('flag');
      expect(language).toHaveProperty('direction');
      
      expect(typeof language.code).toBe('string');
      expect(typeof language.name).toBe('string');
      expect(typeof language.nativeName).toBe('string');
      expect(typeof language.flag).toBe('string');
      expect(['ltr', 'rtl']).toContain(language.direction);
    });
  });

  it('should have English with LTR direction', () => {
    const english = languages.find((lang) => lang.code === 'en');
    expect(english?.direction).toBe('ltr');
  });

  it('should have Arabic with RTL direction', () => {
    const arabic = languages.find((lang) => lang.code === 'ar');
    expect(arabic?.direction).toBe('rtl');
  });

  it('should get language by code correctly', () => {
    const english = getLanguage('en');
    const arabic = getLanguage('ar');
    
    expect(english).toBeDefined();
    expect(english?.code).toBe('en');
    
    expect(arabic).toBeDefined();
    expect(arabic?.code).toBe('ar');
  });

  it('should return undefined for invalid language code', () => {
    const invalid = getLanguage('invalid');
    expect(invalid).toBeUndefined();
  });

  it('should identify RTL languages correctly', () => {
    expect(isRTL('ar')).toBe(true);
    expect(isRTL('en')).toBe(false);
  });

  it('should match RTL locales in config', () => {
    i18nConfig.rtlLocales.forEach((locale) => {
      const language = getLanguage(locale);
      if (language) {
        expect(language.direction).toBe('rtl');
        expect(isRTL(locale)).toBe(true);
      }
    });
  });

  it('should have unique language codes', () => {
    const codes = languages.map((lang) => lang.code);
    const uniqueCodes = new Set(codes);
    
    expect(codes.length).toBe(uniqueCodes.size);
  });
});

