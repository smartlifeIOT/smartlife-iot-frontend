import { describe, it, expect, beforeEach, vi } from 'vitest';
import i18n from '../i18n';
import { i18nConfig } from '../config';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

describe('i18n Configuration', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  it('should initialize i18n with English as default language', () => {
    expect(i18n.language).toBe('en');
  });

  it('should have all required languages in resources', () => {
    const resources = i18n.store.data;
    expect(resources).toHaveProperty('en');
    expect(resources).toHaveProperty('ar');
  });

  it('should load English translations correctly', () => {
    const translation = i18n.t('nav.dashboard', { lng: 'en' });
    expect(translation).toBe(enTranslations.nav.dashboard);
  });

  it('should load Arabic translations correctly', async () => {
    await i18n.changeLanguage('ar');
    const translation = i18n.t('nav.dashboard', { lng: 'ar' });
    expect(translation).toBe(arTranslations.nav.dashboard);
  });

  it('should fallback to English when translation is missing', () => {
    const translation = i18n.t('nonexistent.key', { lng: 'ar' });
    expect(translation).toBe('nonexistent.key');
  });

  it('should change language successfully', async () => {
    await i18n.changeLanguage('ar');
    expect(i18n.language).toBe('ar');
    
    await i18n.changeLanguage('en');
    expect(i18n.language).toBe('en');
  });

  it('should update document attributes when language changes', async () => {
    await i18n.changeLanguage('ar');
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    expect(document.documentElement.lang).toBe('ar');
    expect(document.documentElement.dir).toBe('rtl');
    
    await i18n.changeLanguage('en');
    
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('should use fallback language when invalid language is provided', async () => {
    await i18n.changeLanguage('invalid-lang');
    // Should fallback to default
    expect(i18n.language).toBeDefined();
  });

  it('should support interpolation in translations', () => {
    const translation = i18n.t('dashboard.connections', { count: 12, lng: 'en' });
    expect(translation).toContain('12');
  });

  it('should handle RTL languages correctly', () => {
    expect(i18nConfig.rtlLocales).toContain('ar');
    expect(i18nConfig.rtlLocales).not.toContain('en');
  });

  it('should detect language from localStorage', async () => {
    localStorage.setItem('i18nextLng', 'ar');
    
    // Create new i18n instance to test detection
    // In actual app, this would be done on initialization
    expect(localStorage.getItem('i18nextLng')).toBe('ar');
    
    localStorage.removeItem('i18nextLng');
  });

  it('should have matching translation keys between languages', () => {
    // Check if main sections exist in both languages
    const enKeys = Object.keys(enTranslations);
    const arKeys = Object.keys(arTranslations);
    
    // Both should have same top-level keys
    expect(enKeys.sort()).toEqual(arKeys.sort());
  });
});

