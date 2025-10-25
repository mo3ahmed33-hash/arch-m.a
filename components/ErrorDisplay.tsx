import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => translations[key][language];

  return (
    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative" role="alert">
      <strong className="font-bold">{t('errorPrefix')}: </strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};
