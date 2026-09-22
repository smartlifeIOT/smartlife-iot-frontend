// src/components/ThemeSwitcher.tsx
import { cn } from '@/lib/util';
import { useThemeStore } from '@/stores/useThemeStore';
import { Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setTheme('light')}
        className={cn('btn', theme === 'light' && 'btn-primary')}
      >
        <Sun className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={cn('btn', theme === 'dark' && 'btn-primary')}
      >
        <Moon className="w-4 h-4" />
      </button>
      
      <button
        onClick={() => setTheme('auto')}
        className={cn('btn', theme === 'auto' && 'btn-primary')}
      >
        <Monitor className="w-4 h-4" />
      </button>
    </div>
  );
}