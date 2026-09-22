import React, { useEffect } from 'react';
import AuthBg from '../../../assets/images/auth-bg.png';
import SmartLifeImg from '../../../assets/images/smartlife-text-black.png';
import SmartLifeImgWhite from '../../../assets/images/smartlife-text-white.png';

import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { NavLink } from 'react-router-dom';
import { useThemeStore } from '@/stores/useThemeStore';
import { useTranslation } from 'react-i18next';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  description,
}) => {
  // Preload the background image
  useEffect(() => {
    const img = new Image();
    img.src = AuthBg;
  }, []);

  const { effectiveTheme, setLanguage } = useThemeStore();
  const { i18n } = useTranslation();

  // Handle language change - update UI only, no API call
  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale);
    setLanguage(locale);
  };

  return (
    <div className="max-h-screen flex w-full">
      {/* Left Side - Background Image */}
      <div className="flex-1 hidden md:block h-screen dark:bg-gray-900  object-cover overflow-hidden  ">
        <img
          src={AuthBg}
          alt="Auth Background"
          className="  w-full h-full object-cover   "
        />
      </div>

      {/* Right Side - Form Content Area (50%) */}
      <div className="w-full  overflow-y-auto h-screen   flex-1  md:px-10 px-4 ">
        <div className="flex justify-center pt-20   flex-col   ">
          <div className="flex justify-between mb-14">
            <NavLink to="/">
              <img
                src={
                  effectiveTheme === 'light' ? SmartLifeImg : SmartLifeImgWhite
                }
                alt="Auth Logo"
                width={150}
                className=" "
              />
            </NavLink>
            <div className="">
              <LanguageSwitcher
                settings={{ language: i18n.language }}
                handleLanguageChange={handleLanguageChange}
              />
            </div>
          </div>

          <div className="">
            <h1 className="text-4xl font-bold mb-4">{title}</h1>
            <p className="text-sm text-gray-500 mb-10">{description}</p>
          </div>
          <div className="mb-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
