# Automated Testing for Language Feature

This document describes the automated testing setup for the language/i18n feature in the IoT Platform Frontend application.

## Overview

The testing suite uses **Vitest** and **React Testing Library** to test all language-related functionality including:
- Language switching (English ↔ Arabic)
- RTL/LTR direction changes
- Translation loading and fallbacks
- Component interactions
- Configuration validation

## Quick Start

### Install Dependencies (Already Done)
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/ui
```

### Run Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI dashboard
npm run test:ui
```

## Test Files Structure

```
src/
├── test/
│   ├── setup.ts                    # Test configuration and mocks
│   └── README.md                   # Testing documentation
├── stores/
│   └── __tests__/
│       └── useLanguageStore.test.ts # Language store tests
├── components/
│   └── ui/
│       └── __tests__/
│           └── LanguageSwitcher.test.tsx # Language switcher component tests
└── i18n/
    └── __tests__/
        ├── i18n.test.ts                      # i18n initialization tests
        ├── config.test.ts                    # Configuration tests
        ├── languages.test.ts                 # Language data tests
        └── translations-completeness.test.ts # Translation completeness tests
```

## What's Tested

### 1. Language Store (`useLanguageStore.test.ts`)
- ✅ Initial state (defaults to English)
- ✅ Language switching (English ↔ Arabic)
- ✅ Direction changes (LTR ↔ RTL)
- ✅ Document attribute updates (lang, dir)
- ✅ LocalStorage persistence
- ✅ Translation function (t)
- ✅ Fallback behavior for missing translations

### 2. Language Switcher Component (`LanguageSwitcher.test.tsx`)
- ✅ Component rendering
- ✅ Dropdown menu interactions
- ✅ Language selection
- ✅ Click outside to close
- ✅ Escape key to close
- ✅ RTL/LTR styling
- ✅ Button variant rendering

### 3. i18n Configuration (`i18n.test.ts`)
- ✅ i18n initialization
- ✅ Resource loading
- ✅ Translation loading for both languages
- ✅ Language switching
- ✅ Document attribute updates
- ✅ Fallback language handling
- ✅ Translation interpolation

### 4. i18n Config (`config.test.ts`)
- ✅ Default and fallback locales
- ✅ All locales defined
- ✅ Date/time formats for all locales
- ✅ Number formats for all locales
- ✅ Currency formats for all locales
- ✅ RTL language identification

### 5. Languages Data (`languages.test.ts`)
- ✅ Language data structure
- ✅ All required properties
- ✅ Direction values (LTR/RTL)
- ✅ Language lookup function
- ✅ RTL identification function
- ✅ Unique language codes

### 6. Translation Completeness (`translations-completeness.test.ts`)
- ✅ All English keys exist in Arabic
- ✅ All Arabic keys exist in English
- ✅ Same structure for both languages
- ✅ All main sections present
- ✅ No empty translation values

## Test Configuration

### Vitest Config (`vitest.config.ts`)
- Environment: `jsdom` (browser-like environment)
- Setup file: `src/test/setup.ts`
- Path aliases configured (matches Vite config)
- Coverage provider: `v8`
- Coverage reports: text, json, html

### Test Setup (`src/test/setup.ts`)
- Configures `@testing-library/jest-dom` matchers
- Mocks `window.matchMedia` for responsive tests
- Mocks `localStorage` for persistence tests
- Cleans up after each test
- Resets document attributes

## Writing New Tests

When adding new language features, follow these patterns:

### Testing Language Store
```typescript
import { renderHook, act } from '@testing-library/react';
import { useLanguageStore } from '@/stores/useLanguageStore';

describe('New Feature', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useLanguageStore());
    
    act(() => {
      result.current.setLanguage('ar');
    });
    
    expect(result.current.language).toBe('ar');
  });
});
```

### Testing Components
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Continuous Integration

To add tests to CI/CD pipeline:

```yaml
# Example GitHub Actions
- name: Run tests
  run: npm run test

- name: Generate coverage
  run: npm run test:coverage
```

## Coverage Goals

- **Target Coverage**: 80%+
- **Critical Paths**: 100% coverage for:
  - Language switching logic
  - RTL/LTR direction changes
  - Translation loading
  - Component interactions

## Troubleshooting

### Tests failing with "Cannot find module"
- Ensure path aliases are configured correctly in `vitest.config.ts`
- Check that imports use the `@/` alias

### localStorage not working in tests
- Already mocked in `src/test/setup.ts`
- If issues persist, check mock implementation

### Component not rendering
- Ensure React Testing Library is imported correctly
- Check that component is properly exported

### Translation keys missing
- Run `translations-completeness.test.ts` to identify missing keys
- Add missing translations to both `en.json` and `ar.json`

## Next Steps

1. ✅ Install testing dependencies
2. ✅ Configure Vitest
3. ✅ Create test files
4. ✅ Run initial tests
5. 🔄 Add component integration tests
6. 🔄 Add E2E tests with Playwright/Cypress (optional)

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)



