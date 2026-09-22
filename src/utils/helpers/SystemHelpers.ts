/**
 * Get the system theme based on the user's preference
 * @returns 'light' | 'dark'
 */
export const getSystemTheme = (): 'light' | 'dark' | 'auto' => {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};
