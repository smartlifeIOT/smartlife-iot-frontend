import { describe, it, expect } from 'vitest';
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

// Helper function to get all keys from nested object
const getAllKeys = (obj: any, prefix = ''): string[] => {
  const keys: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
};

describe('Translation Completeness', () => {
  it('should have all English keys in Arabic', () => {
    const enKeys = getAllKeys(enTranslations);
    const arKeys = getAllKeys(arTranslations);
    
    const missingKeys = enKeys.filter((key) => !arKeys.includes(key));
    
    expect(missingKeys).toEqual([]);
    expect(arKeys.length).toBeGreaterThanOrEqual(enKeys.length);
  });

  it('should have all Arabic keys in English', () => {
    const enKeys = getAllKeys(enTranslations);
    const arKeys = getAllKeys(arTranslations);
    
    const missingKeys = arKeys.filter((key) => !enKeys.includes(key));
    
    expect(missingKeys).toEqual([]);
    expect(enKeys.length).toBeGreaterThanOrEqual(arKeys.length);
  });

  it('should have same structure for both languages', () => {
    const enKeys = getAllKeys(enTranslations);
    const arKeys = getAllKeys(arTranslations);
    
    expect(enKeys.sort()).toEqual(arKeys.sort());
  });

  it('should have translations for all main sections', () => {
    const sections = ['nav', 'dashboard', 'auth', 'common'];
    
    sections.forEach((section) => {
      expect(enTranslations).toHaveProperty(section);
      expect(arTranslations).toHaveProperty(section);
    });
  });

  it('should have translations for auth section', () => {
    expect(enTranslations.auth).toBeDefined();
    expect(arTranslations.auth).toBeDefined();
    
    const authSubsections = ['login', 'register', 'forgotPassword'];
    authSubsections.forEach((subsection) => {
      expect(enTranslations.auth).toHaveProperty(subsection);
      expect(arTranslations.auth).toHaveProperty(subsection);
    });
  });

  it('should not have empty translation values', () => {
    const checkEmpty = (obj: any, lang: string, prefix = ''): string[] => {
      const emptyKeys: string[] = [];
      
      for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          emptyKeys.push(...checkEmpty(obj[key], lang, fullKey));
        } else if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
          emptyKeys.push(`${lang}:${fullKey}`);
        }
      }
      
      return emptyKeys;
    };
    
    const enEmpty = checkEmpty(enTranslations, 'en');
    const arEmpty = checkEmpty(arTranslations, 'ar');
    
    expect(enEmpty).toEqual([]);
    expect(arEmpty).toEqual([]);
  });
});

