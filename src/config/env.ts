export const env = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
  appName: import.meta.env.VITE_APP_NAME || 'Smart Life',
  enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
} as const;
