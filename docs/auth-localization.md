# Auth Feature Localization Documentation

This document explains the localization setup for the authentication feature in the IoT Platform Frontend.

## Overview

The authentication feature (`src/features/auth/`) supports multiple languages with full localization for:
- Login form
- Registration form
- Forgot password form

## Translation Files

Translations are stored in the main i18n locale files:
- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/ar.json` - Arabic translations

### Translation Structure

All auth-related translations are under the `auth` key:

```json
{
  "auth": {
    "login": { ... },
    "register": { ... },
    "forgotPassword": { ... }
  }
}
```

## Login Form Translations

### English (`en.json`)

```json
"auth": {
  "login": {
    "title": "Login",
    "email": "Email",
    "emailPlaceholder": "Username or Email",
    "password": "Password",
    "passwordPlaceholder": "Password",
    "forgotPassword": "Forgot Password",
    "loginButton": "Login",
    "loggingIn": "Logging in...",
    "emailRequired": "Email is required",
    "emailInvalid": "Invalid email address",
    "passwordRequired": "Password is required",
    "passwordMinLength": "Password must be at least 6 characters",
    "loginError": "Login failed. Please check your credentials.",
    "loginSuccess": "Login successful"
  }
}
```

### Arabic (`ar.json`)

```json
"auth": {
  "login": {
    "title": "تسجيل الدخول",
    "email": "البريد الإلكتروني",
    "emailPlaceholder": "اسم المستخدم أو البريد الإلكتروني",
    "password": "كلمة المرور",
    "passwordPlaceholder": "كلمة المرور",
    "forgotPassword": "نسيت كلمة المرور",
    "loginButton": "تسجيل الدخول",
    "loggingIn": "جاري تسجيل الدخول...",
    "emailRequired": "البريد الإلكتروني مطلوب",
    "emailInvalid": "عنوان بريد إلكتروني غير صحيح",
    "passwordRequired": "كلمة المرور مطلوبة",
    "passwordMinLength": "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
    "loginError": "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.",
    "loginSuccess": "تم تسجيل الدخول بنجاح"
  }
}
```

## Implementation in LoginForm

### 1. Import useTranslation Hook

```tsx
import { useTranslation } from 'react-i18next';
```

### 2. Initialize Translation Function

```tsx
export const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  // ... rest of component
};
```

### 3. Dynamic Zod Schema with Translations

The validation schema is created dynamically to use translated error messages:

```tsx
const createLoginSchema = (t: (key: string) => string) => z.object({
  email: z
    .string()
    .min(1, t('auth.login.emailRequired'))
    .email(t('auth.login.emailInvalid')),
  password: z
    .string()
    .min(1, t('auth.login.passwordRequired'))
    .min(6, t('auth.login.passwordMinLength')),
});

// Inside component:
const loginSchema = createLoginSchema(t);
```

### 4. Using Translations in JSX

```tsx
// Placeholders
<Input
  placeholder={t('auth.login.emailPlaceholder')}
  {...register('email')}
/>

// Button text
<Button>
  {isPending ? t('auth.login.loggingIn') : t('auth.login.loginButton')}
</Button>

// Links
<Link>{t('auth.login.forgotPassword')}</Link>

// Error messages (automatically translated via Zod schema)
error={errors.email?.message} // Already translated
```

## Translation Keys Reference

### Login Form Keys

| Key | English | Arabic | Usage |
|-----|---------|--------|-------|
| `auth.login.title` | "Login" | "تسجيل الدخول" | Page title |
| `auth.login.emailPlaceholder` | "Username or Email" | "اسم المستخدم أو البريد الإلكتروني" | Email input placeholder |
| `auth.login.passwordPlaceholder` | "Password" | "كلمة المرور" | Password input placeholder |
| `auth.login.loginButton` | "Login" | "تسجيل الدخول" | Submit button text |
| `auth.login.loggingIn` | "Logging in..." | "جاري تسجيل الدخول..." | Loading state text |
| `auth.login.forgotPassword` | "Forgot Password" | "نسيت كلمة المرور" | Forgot password link |
| `auth.login.emailRequired` | "Email is required" | "البريد الإلكتروني مطلوب" | Validation error |
| `auth.login.emailInvalid` | "Invalid email address" | "عنوان بريد إلكتروني غير صحيح" | Validation error |
| `auth.login.passwordRequired` | "Password is required" | "كلمة المرور مطلوبة" | Validation error |
| `auth.login.passwordMinLength` | "Password must be at least 6 characters" | "يجب أن تكون كلمة المرور 6 أحرف على الأقل" | Validation error |
| `auth.login.loginError` | "Login failed. Please check your credentials." | "فشل تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك." | Error message |
| `auth.login.loginSuccess` | "Login successful" | "تم تسجيل الدخول بنجاح" | Success message |

### Register Form Keys (Available for future use)

| Key | English | Arabic |
|-----|---------|--------|
| `auth.register.title` | "Create Account" | "إنشاء حساب" |
| `auth.register.registerButton` | "Sign Up" | "إنشاء حساب" |
| `auth.register.registering` | "Creating account..." | "جاري إنشاء الحساب..." |
| `auth.register.alreadyHaveAccount` | "Already have an account?" | "هل لديك حساب بالفعل؟" |
| `auth.register.signIn` | "Sign in" | "تسجيل الدخول" |

### Forgot Password Keys (Available for future use)

| Key | English | Arabic |
|-----|---------|--------|
| `auth.forgotPassword.title` | "Forgot Password" | "نسيت كلمة المرور" |
| `auth.forgotPassword.description` | "Enter your email address..." | "أدخل عنوان بريدك الإلكتروني..." |
| `auth.forgotPassword.sendResetLink` | "Send Reset Link" | "إرسال رابط إعادة التعيين" |
| `auth.forgotPassword.sending` | "Sending..." | "جاري الإرسال..." |
| `auth.forgotPassword.backToLogin` | "Back to Login" | "العودة إلى تسجيل الدخول" |

## How It Works

1. **Language Detection**: The app detects the user's language preference from:
   - LocalStorage (`i18nextLng`)
   - Browser navigator settings

2. **Dynamic Schema**: The Zod validation schema is created with translated error messages based on the current language.

3. **Automatic Updates**: When the language changes:
   - All text in the form updates automatically
   - Validation error messages switch to the new language
   - The HTML `lang` attribute updates
   - Font switches (Poppins for English, Lama Sans for Arabic)

4. **RTL Support**: When Arabic is selected:
   - Text direction automatically switches to RTL
   - Layout adjusts for right-to-left reading
   - Font switches to Lama Sans

## Adding New Translations

### Step 1: Add to English File

```json
{
  "auth": {
    "login": {
      "newKey": "New English Text"
    }
  }
}
```

### Step 2: Add to Arabic File

```json
{
  "auth": {
    "login": {
      "newKey": "النص العربي الجديد"
    }
  }
}
```

### Step 3: Use in Component

```tsx
const { t } = useTranslation();
// ...
{t('auth.login.newKey')}
```

## Best Practices

1. **Always use translation keys** instead of hardcoded strings
2. **Keep keys descriptive** and organized by feature
3. **Test both languages** to ensure proper RTL/LTR layout
4. **Use validation schema factory** pattern for translated error messages
5. **Maintain consistency** in translation key naming

## Testing Localization

1. **Switch Language**: Use the language switcher in the header
2. **Verify Text**: All form labels, placeholders, and buttons should update
3. **Check Validation**: Submit invalid form to see translated error messages
4. **Test RTL**: Switch to Arabic and verify layout adjusts correctly
5. **Font Check**: Verify font switches between Poppins and Lama Sans

## Related Files

- `src/features/auth/components/LoginForm.tsx` - Login form component
- `src/i18n/locales/en.json` - English translations
- `src/i18n/locales/ar.json` - Arabic translations
- `src/i18n/i18n.ts` - i18n configuration
- `src/components/ui/LanguageSwitcher.tsx` - Language switcher component

## Future Enhancements

- [ ] Add translations for RegisterForm
- [ ] Add translations for ForgotPasswordForm
- [ ] Add more languages (Spanish, French, German, Chinese)
- [ ] Add context-aware translations (formal/informal)
- [ ] Add date/time formatting based on locale

