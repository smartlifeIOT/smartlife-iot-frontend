# Vite Configuration Documentation

This document provides a detailed explanation of the `vite.config.ts` file for the IoT Platform Frontend project.

## Overview

The `vite.config.ts` file configures Vite, a modern build tool for frontend development that provides fast Hot Module Replacement (HMR) and optimized production builds.

## File Location

```
vite.config.ts (project root)
```

## Configuration Breakdown

### Imports

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite'
```

**Purpose:**
- `defineConfig`: Type-safe Vite configuration helper
- `@vitejs/plugin-react`: React support with Fast Refresh
- `path`: Node.js path utilities for resolving file paths
- `@tailwindcss/vite`: Tailwind CSS v4 Vite plugin

---

## Configuration Object

### Plugins

```typescript
plugins: [react(), tailwindcss()],
```

#### 1. React Plugin (`@vitejs/plugin-react`)

**Purpose:** Enables React support in Vite

**Features:**
- **Fast Refresh:** Instant component updates without losing state
- **JSX/TSX Support:** Transforms JSX/TSX files automatically
- **React HMR:** Hot Module Replacement for React components
- **Automatic JSX Runtime:** Uses the new JSX transform (no need to import React)

**Benefits:**
- Faster development experience
- Preserves component state during hot reload
- Automatic JSX transformation

#### 2. Tailwind CSS Plugin (`@tailwindcss/vite`)

**Purpose:** Integrates Tailwind CSS v4 with Vite

**Features:**
- **CSS Processing:** Processes Tailwind directives (`@import 'tailwindcss'`)
- **JIT Compilation:** Just-In-Time CSS generation
- **Optimization:** Tree-shakes unused CSS in production
- **Fast HMR:** Instant CSS updates during development

**Configuration:** Tailwind CSS v4 uses CSS-first configuration, so no JavaScript config is needed here. The plugin reads from `src/styles/globals.css`.

---

### Path Aliases

```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@app': path.resolve(__dirname, './src/app'),
    '@assets': path.resolve(__dirname, './src/assets'),
    '@components': path.resolve(__dirname, './src/components'),
    '@config': path.resolve(__dirname, './src/config'),
    '@features': path.resolve(__dirname, './src/features'),
    '@hooks': path.resolve(__dirname, './src/hooks'),
    '@i18n': path.resolve(__dirname, './src/i18n'),
    '@lib': path.resolve(__dirname, './src/lib'),
    '@pages': path.resolve(__dirname, './src/pages'),
    '@routes': path.resolve(__dirname, './src/routes'),
    '@services': path.resolve(__dirname, './src/services'),
    '@stores': path.resolve(__dirname, './src/stores'),
    '@styles': path.resolve(__dirname, './src/styles'),
    '@types': path.resolve(__dirname, './src/types'),
    '@utils': path.resolve(__dirname, './src/utils'),
  },
},
```

**Purpose:** Creates path aliases to simplify imports and avoid relative path complexity.

#### Available Aliases

| Alias | Path | Usage |
|-------|------|-------|
| `@/` | `./src/` | Main source directory |
| `@app/` | `./src/app/` | Application setup files |
| `@assets/` | `./src/assets/` | Static assets (images, fonts, icons) |
| `@components/` | `./src/components/` | Reusable UI components |
| `@config/` | `./src/config/` | Configuration files |
| `@features/` | `./src/features/` | Feature modules (domain-driven) |
| `@hooks/` | `./src/hooks/` | Custom React hooks |
| `@i18n/` | `./src/i18n/` | Internationalization files |
| `@lib/` | `./src/lib/` | Library configurations and utilities |
| `@pages/` | `./src/pages/` | Page components |
| `@routes/` | `./src/routes/` | Route configuration |
| `@services/` | `./src/services/` | API services |
| `@stores/` | `./src/stores/` | Zustand state stores |
| `@styles/` | `./src/styles/` | Global styles and CSS |
| `@types/` | `./src/types/` | TypeScript type definitions |
| `@utils/` | `./src/utils/` | Utility functions |

#### Import Examples

**Before (relative paths):**
```typescript
import { Button } from '../../../components/ui/button';
import { useAuth } from '../../hooks/useAuth';
```

**After (with aliases):**
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@hooks/useAuth';
```

**Benefits:**
- Cleaner, more readable imports
- Easy refactoring (move files without breaking imports)
- Better IDE autocomplete support
- Consistent import style across the project

**Note:** These aliases must also be configured in `tsconfig.json` for TypeScript to recognize them.

---

### Development Server

```typescript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

#### Port Configuration

- **Port:** `3000`
- **Access:** `http://localhost:3000`

The development server runs on port 3000. You can change this if the port is already in use.

#### API Proxy

**Purpose:** Proxies API requests to the backend server during development.

**Configuration:**
- **Path:** `/api/*` - Any request starting with `/api`
- **Target:** `http://localhost:5000` - Backend server address
- **changeOrigin:** `true` - Changes the origin header to match the target

**How It Works:**

1. **Development Request:**
   ```typescript
   // Frontend makes request
   fetch('/api/users')
   ```

2. **Vite Proxy:**
   ```
   http://localhost:3000/api/users
   ↓ (proxied to)
   http://localhost:5000/api/users
   ```

3. **Backend Response:**
   ```
   Response → Vite Proxy → Frontend
   ```

**Benefits:**
- Avoids CORS issues during development
- No need to hardcode backend URL in frontend code
- Easy switching between local and remote backends
- Seamless API integration

**Example Usage:**

```typescript
// In your API service
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Development: Uses proxy (/api → http://localhost:5000/api)
// Production: Uses VITE_API_BASE_URL from .env file
```

---

## TypeScript Support

The configuration uses TypeScript (`vite.config.ts` instead of `vite.config.js`), providing:
- Type safety for configuration
- IntelliSense support in IDEs
- Better error detection

---

## Environment Variables

While not explicitly shown in the config, Vite supports environment variables:

### Usage in Code

```typescript
// Access environment variables
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;
const mode = import.meta.env.MODE;
```

### Naming Convention

- **Public variables:** Must start with `VITE_` to be exposed to client code
- **Private variables:** Can be used in Vite config but won't be exposed

### Example `.env` File

```env
# Public (exposed to client)
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME="IoT Platform"

# Private (only in config)
DATABASE_URL=postgresql://...
```

---

## Build Configuration

Vite automatically handles:
- **Code Splitting:** Automatic route-based code splitting
- **Tree Shaking:** Removes unused code
- **Minification:** Optimizes JavaScript and CSS
- **Asset Handling:** Processes images, fonts, and other assets
- **Source Maps:** Generates source maps for debugging (dev mode)

### Build Commands

```bash
# Development
npm run dev          # Starts dev server on port 3000

# Production Build
npm run build       # Creates optimized production build in /dist

# Preview Production Build
npm run preview     # Previews the production build locally
```

---

## Performance Optimizations

### 1. Fast HMR (Hot Module Replacement)

- Instant updates during development
- Preserves component state
- Only updates changed modules

### 2. Dependency Pre-bundling

Vite pre-bundles dependencies using esbuild for faster cold starts:
- React
- React DOM
- Other heavy dependencies

### 3. Optimized Production Builds

- Rollup-based bundling
- Code splitting
- Tree shaking
- Minification
- Asset optimization

---

## Common Customizations

### Change Development Port

```typescript
server: {
  port: 3001, // Change to desired port
  // ...
}
```

### Add More Proxies

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
  '/ws': {
    target: 'ws://localhost:5000',
    ws: true, // WebSocket support
  },
}
```

### Configure Build Options

```typescript
build: {
  outDir: 'dist',
  sourcemap: true,
  minify: 'terser',
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
      },
    },
  },
}
```

### Add Environment-Specific Configs

```typescript
export default defineConfig(({ mode }) => {
  return {
    // Config varies based on mode (development, production, etc.)
    plugins: [react(), tailwindcss()],
    // ...
    build: {
      minify: mode === 'production' ? 'terser' : false,
    },
  };
});
```

---

## Integration with Other Tools

### TypeScript

Configured in `tsconfig.json` to recognize path aliases:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      // ... other aliases
    }
  }
}
```

### Tailwind CSS

Uses `@tailwindcss/vite` plugin for CSS processing. Tailwind v4 configuration is done via CSS (`src/styles/globals.css`).

### PostCSS

Configured in `postcss.config.js`:
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

---

## Troubleshooting

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```typescript
server: {
  port: 3001, // Change to available port
}
```

### Path Alias Not Working

**Issue:** TypeScript can't resolve `@/` imports

**Solution:** Ensure `tsconfig.json` has matching path configuration:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Proxy Not Working

**Issue:** API requests failing with CORS errors

**Solution:**
1. Verify backend is running on port 5000
2. Check proxy configuration matches your API routes
3. Ensure `changeOrigin: true` is set

### Build Failures

**Common Causes:**
- TypeScript errors (check `tsc` output)
- Missing dependencies
- Import errors
- Asset path issues

**Debug:**
```bash
npm run build -- --debug
```

---

## Related Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tsconfig.app.json` - App-specific TypeScript config
- `tsconfig.node.json` - Node-specific TypeScript config
- `postcss.config.js` - PostCSS configuration
- `.env` / `.env.local` - Environment variables
- `index.html` - HTML entry point

---

## Best Practices

1. **Keep Aliases Consistent:** Ensure aliases match between `vite.config.ts` and `tsconfig.json`
2. **Use Environment Variables:** Store sensitive/configurable values in `.env` files
3. **Optimize Imports:** Use path aliases for cleaner, more maintainable code
4. **Proxy Configuration:** Only proxy in development, use absolute URLs in production
5. **Plugin Order:** Order matters for some plugins (React should be first)

---

## Version Information

- **Vite:** ^7.1.12
- **@vitejs/plugin-react:** ^5.1.0
- **@tailwindcss/vite:** ^4.1.17
- **Node.js:** Required (check `package.json` for minimum version)

---

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vite Plugin React](https://github.com/vitejs/vite-plugin-react)
- [Tailwind CSS v4 with Vite](https://tailwindcss.com/docs/vite)
- [Vite Path Aliases](https://vitejs.dev/config/shared-options.html#resolve-alias)

---

## Quick Reference

### Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check  # If configured

# Lint code
npm run lint
```

### Common Imports with Aliases

```typescript
// Components
import { Button } from '@/components/ui/button';
import AppLayout from '@components/layout/AppLayout';

// Hooks
import { useAuth } from '@hooks/useAuth';

// Utils
import { cn } from '@/lib/util';

// Types
import type { User } from '@/types';

// Services
import { authService } from '@/services/api/authService';

// Stores
import { useThemeStore } from '@/stores/useThemeStore';

// i18n
import { languages } from '@/i18n/languages';
```

---

**Last Updated:** 2024
**Maintained By:** Development Team

