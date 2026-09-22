# Global CSS Documentation

This document provides a detailed explanation of the `src/styles/globals.css` file, which serves as the foundation for styling in the IoT Platform Frontend application.

## Table of Contents

1. [Overview](#overview)
2. [Tailwind CSS v4 Setup](#tailwind-css-v4-setup)
3. [CSS Variables (Design Tokens)](#css-variables-design-tokens)
4. [Dark Mode Configuration](#dark-mode-configuration)
5. [Font Configuration](#font-configuration)
6. [Base Styles](#base-styles)
7. [Component Layer](#component-layer)
8. [Utilities Layer](#utilities-layer)
9. [Browser-Specific Styles](#browser-specific-styles)

---

## Overview

The `globals.css` file is the central stylesheet that:
- Imports Tailwind CSS v4
- Defines design tokens using CSS custom properties
- Configures dark mode support
- Sets up fonts (Poppins for English, Lama Sans for Arabic)
- Provides base styles for the application
- Includes component and utility layer customizations

---

## Tailwind CSS v4 Setup

### Import Statement

```css
@import 'tailwindcss';
```

This is the Tailwind CSS v4 syntax for importing the framework. Unlike v3, v4 uses a single import statement and configuration is primarily done through CSS using the `@theme` directive (though this project uses CSS variables for compatibility).

---

## CSS Variables (Design Tokens)

The file uses CSS custom properties (variables) to define a consistent design system. These variables are defined in the `:root` selector and can be used throughout the application.

### Color System

All colors are defined in HSL format without the `hsl()` wrapper, making them compatible with Tailwind's color functions.

#### Background Colors

- `--background`: Main background color (white in light mode)
- `--card`: Background color for card components
- `--popover`: Background color for popover/dropdown components

#### Text Colors

- `--foreground`: Main text color (dark gray in light mode)
- `--card-foreground`: Text color for card components
- `--popover-foreground`: Text color for popover components

#### Primary Colors

- `--primary`: Primary brand color (blue: `221.2 83.2% 53.3%`)
- `--primary-foreground`: Text color to use on primary backgrounds (light: `210 40% 98%`)

#### Secondary Colors

- `--secondary`: Secondary background color (light gray: `210 40% 96.1%`)
- `--secondary-foreground`: Text color for secondary backgrounds (dark: `222.2 47.4% 11.2%`)

#### Muted Colors

- `--muted`: Muted background color (light gray: `210 40% 96.1%`)
- `--muted-foreground`: Muted text color (medium gray: `215.4 16.3% 46.9%`)

Used for less prominent UI elements like placeholders, disabled states, and secondary information.

#### Accent Colors

- `--accent`: Accent background color (light gray: `210 40% 96.1%`)
- `--accent-foreground`: Text color for accent backgrounds (dark: `222.2 47.4% 11.2%`)

Used for hover states and interactive elements.

#### Destructive Colors

- `--destructive`: Error/danger color (red: `0 84.2% 60.2%`)
- `--destructive-foreground`: Text color on destructive backgrounds (light: `210 40% 98%`)

Used for error messages, delete buttons, and destructive actions.

#### Border & Input Colors

- `--border`: Border color for components (light gray: `214.3 31.8% 91.4%`)
- `--input`: Border color for input fields (same as border)
- `--ring`: Focus ring color (blue: `221.2 83.2% 53.3%`)

### Spacing & Layout Variables

- `--radius`: Border radius for rounded corners (`0.5rem`)
- `--sidebar-width`: Default sidebar width (`280px`)
- `--sidebar-width-collapsed`: Collapsed sidebar width (`80px`)
- `--header-height`: Header/navbar height (`64px`)

---

## Dark Mode Configuration

Dark mode is implemented using a `.dark` class selector. All color variables are redefined for dark mode:

```css
.dark {
  --background: 222.2 84% 4.9%;        /* Dark background */
  --foreground: 210 40% 98%;           /* Light text */
  /* ... other dark mode colors */
}
```

**How it works:**
- The `.dark` class is added to the root HTML element when dark mode is enabled
- All components using `hsl(var(--color-name))` will automatically use the dark mode values
- No JavaScript is needed in individual components - the CSS cascade handles the switch

**Usage in Tailwind:**
```html
<div className="bg-background text-foreground">
  This will be white bg with dark text in light mode,
  and dark bg with light text in dark mode
</div>
```

---

## Font Configuration

The application supports two fonts that switch based on the language:

### 1. Poppins (English)

- **When used:** Default font for English (`lang="en"` or no lang attribute)
- **Source:** Google Fonts (loaded in `index.html`)
- **Usage:** All English text throughout the application

### 2. Lama Sans (Arabic)

- **When used:** Font for Arabic (`lang="ar"`)
- **Source:** Local font files in `src/assets/fonts/`
- **Weights available:**
  - Light (300)
  - Regular (400)
  - Medium (500)
  - SemiBold (600)
  - Bold (700)

#### Font Face Declarations

```css
@font-face {
  font-family: 'Lama Sans';
  src: url('../assets/fonts/LamaSans-Regular.otf') format('opentype');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

**Key points:**
- `font-display: swap` ensures text is visible during font load (prevents FOIT - Flash of Invisible Text)
- Fonts are loaded from the assets folder using relative paths
- Multiple weights are defined for design flexibility

#### Language-Based Font Switching

```css
/* Arabic font */
html[lang='ar'] body,
html[lang='ar'] {
  font-family: 'Lama Sans', sans-serif;
}

/* English font (default) */
html[lang='en'] body,
html[lang='en'],
html:not([lang='ar']) body,
html:not([lang='ar']) {
  font-family: 'Poppins', sans-serif;
}
```

**How it works:**
- The HTML `lang` attribute is updated by the i18n system when users switch languages
- CSS selectors automatically apply the correct font
- The `html:not([lang='ar'])` ensures Poppins is used for all non-Arabic languages

---

## Base Styles

### Universal Reset

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
```

Resets default browser styles and ensures consistent box-sizing.

### HTML Root

```css
html {
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

- Sets base font size (used for `rem` calculations)
- Improves font rendering on macOS/iOS (`antialiased`) and Firefox (`grayscale`)

### Body Element

```css
body {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  font-feature-settings: 'rlig' 1, 'calt' 1;
  font-family: 'Poppins', sans-serif;
  line-height: 1.5;
  overflow-x: hidden;
}
```

**Properties explained:**
- `background-color`: Uses CSS variable (white in light mode, dark in dark mode)
- `color`: Text color using CSS variable
- `font-feature-settings`: 
  - `rlig`: Required ligatures (important for Arabic text)
  - `calt`: Contextual alternates (improves text rendering)
- `font-family`: Default to Poppins (can be overridden by lang selector)
- `line-height: 1.5`: Comfortable reading line height (150%)
- `overflow-x: hidden`: Prevents horizontal scrolling

---

## Scrollbar Styling

### Webkit Browsers (Chrome, Safari, Edge)

```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--muted));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--muted-foreground));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--foreground));
}
```

Creates custom, theme-aware scrollbars:
- 8px width/height for minimal visual impact
- Track uses muted background color
- Thumb uses muted foreground with hover effect
- Automatically adapts to light/dark mode

### Firefox

```css
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--muted-foreground)) hsl(var(--muted));
}
```

- `scrollbar-width: thin`: Makes scrollbar thinner
- `scrollbar-color`: Thumb color then track color
- Applies to all elements using the universal selector

---

## Component Layer

The `@layer components` directive allows you to define reusable component styles that integrate with Tailwind's utility classes.

### Current Components

#### Input Placeholder

```css
.input::placeholder {
  color: hsl(var(--muted-foreground));
}
```

Styles placeholder text in input elements with a muted color.

#### Spin Animation

```css
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

Defines a continuous rotation animation used for loading spinners.

---

## Utilities Layer

The `@layer utilities` directive is for small, single-purpose utility classes.

### Fade In Animation

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

Creates a smooth fade-in animation with a slight upward movement. Useful for:
- Modal dialogs appearing
- Dropdown menus opening
- Toast notifications
- Page transitions

**Usage:**
```html
<div className="animate-[fadeIn_0.3s_ease-in-out]">
  Content that fades in
</div>
```

### Responsive Utilities

```css
@media (max-width: 768px) {
  /* Mobile-specific styles can go here */
}
```

Placeholder for mobile-responsive utility classes. Currently empty but available for future mobile optimizations.

---

## Print Styles

```css
@media print {
  /* Print-specific styles */
}
```

Placeholder for print stylesheet optimizations. When implemented, this can:
- Hide non-essential UI elements
- Adjust colors for printing
- Optimize page breaks
- Remove interactive elements

---

## Usage Examples

### Using CSS Variables in Tailwind

```tsx
// Using with Tailwind classes
<div className="bg-background text-foreground">
  Automatically uses light/dark mode colors
</div>

// Using in custom CSS
.custom-element {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: var(--radius);
}
```

### Using Font Variables

```tsx
// Font automatically switches based on HTML lang attribute
// No code changes needed in components!
<html lang="ar">  {/* Uses Lama Sans */}
<html lang="en">  {/* Uses Poppins */}
```

### Dark Mode Toggle

```tsx
// In your theme store/context
const toggleDarkMode = () => {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }
};
```

---

## Best Practices

1. **Always use CSS variables** instead of hardcoded colors for theme consistency
2. **Use `hsl(var(--variable))`** wrapper when using variables directly in CSS
3. **Prefer Tailwind classes** that use these variables (e.g., `bg-primary`, `text-foreground`)
4. **Test dark mode** to ensure all components respect the color variables
5. **Verify fonts** when switching between English and Arabic languages

---

## File Structure

```
src/styles/
├── globals.css          # Main stylesheet (this file)
├── animations.css       # Animation definitions
└── themes/
    ├── light.css        # Light theme overrides (if any)
    └── dark.css         # Dark theme overrides (if any)
```

---

## Related Files

- `tailwind.config.js`: Tailwind configuration (minimal in v4)
- `postcss.config.js`: PostCSS configuration
- `vite.config.ts`: Vite build configuration (includes Tailwind plugin)
- `index.html`: Font imports (Poppins from Google Fonts)
- `src/stores/useThemeStore.ts`: Theme management (dark mode toggle)

---

## Version Information

- **Tailwind CSS:** v4.1.17
- **Last Updated:** 2024
- **Maintainer:** Development Team

---

## Notes

- This file uses Tailwind CSS v4 syntax (`@import 'tailwindcss'`)
- Configuration is CSS-first (no JavaScript config needed for colors)
- All colors are theme-aware and automatically switch in dark mode
- Font system supports RTL languages (Arabic) out of the box
- Scrollbar styling works across modern browsers (Webkit + Firefox)

