import { useState, useRef, useEffect } from 'react';
import { Languages } from 'lucide-react';
import { cn } from '@/lib/util';
import { languages } from '@/i18n/languages';
import { getDirection } from '@/i18n/i18n';

interface LanguageSwitcherProps {
  settings: { language?: string } | undefined;
  handleLanguageChange: (locale: string) => void;
  variant?: 'dropdown' | 'button';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  settings,
  handleLanguageChange,
  variant = 'dropdown',
  showLabel = false,
  className,
}: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const language = settings?.language;
  const direction = getDirection(language || 'en');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);



  const currentLanguage = languages.find((lang) => lang.code === language);

  if (variant === 'button') {
    return (
      <div className={cn('flex gap-2', className)}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              language === lang.code &&
              'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
            title={lang.name}
          >
            <span className="text-lg">{lang.flag}</span>
            {showLabel && (
              <span className="text-sm font-medium">
                {lang.code.toUpperCase()}ss
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'p-2 px-3 bg-gray-100 dark:bg-gray-800  dark:hover:bg-gray-700 rounded-lg transition-colors',
          'flex items-center gap-2',
          isOpen && 'bg-gray-100 dark:bg-gray-800'
        )}
        title="Change language"
        aria-label="Change language"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Languages className="h-5 w-5 text-gray-700  dark:text-gray-300" />
        {showLabel && currentLanguage && (
          <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
        )}
        {!showLabel && (
          <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentLanguage?.flag}
          </span>
        )}
      </button>

      {/* Language Menu Dropdown */}
      {isOpen && (
        <div
          className={cn(
            'absolute mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200',
            'dark:border-gray-700 shadow-lg rounded-xl py-2 z-50 animate-in fade-in-0 zoom-in-95',
            direction === 'rtl' ? 'left-0' : 'right-0'
          )}
          role="menu"
          aria-orientation="vertical"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50',
                'dark:hover:bg-gray-700 transition-colors',
                direction === 'rtl' && 'flex-row-reverse text-right',
                language === lang.code &&
                'bg-gray-50 dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 font-medium'
              )}
              role="menuitem"
            >
              <span className="text-lg">{lang.flag}</span>
              <span>{lang.name}</span>
              {lang.nativeName !== lang.name && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  {lang.nativeName}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
