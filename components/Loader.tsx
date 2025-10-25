import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => translations[key][language];
  
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-xl h-full">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-500"></div>
      <p className="mt-6 text-lg font-semibold text-gray-300">{t('loaderTitle')}</p>
      <p className="mt-2 text-sm text-gray-400 text-center">{message}</p>
    </div>
  );
};
