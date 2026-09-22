import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useRTL } from '@/hooks/useRTL';
import { cn } from '@/lib/util';
import { useInitializeSettings } from '@/hooks/useInitializeSettings';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isRTL } = useRTL();
  useInitializeSettings();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 transition-colors">
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <div
        className={cn(
          'flex-1 flex flex-col min-w-0',
          isRTL ? 'lg:mr-64' : 'lg:ml-64'
        )}
      >
        <Header onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 transition-colors">
          <div className="container px-2 md:px-10 py-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
