import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const commonClasses = 'px-3 py-1 rounded-md text-sm font-medium transition-colors';
  const activeClasses = 'bg-cyan-500 text-white';
  const inactiveClasses = 'bg-gray-700 hover:bg-gray-600 text-gray-300';

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage('en')}
        className={`${commonClasses} ${language === 'en' ? activeClasses : inactiveClasses}`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ar')}
        className={`${commonClasses} ${language === 'ar' ? activeClasses : inactiveClasses}`}
        aria-pressed={language === 'ar'}
      >
        AR
      </button>
    </div>
  );
};
