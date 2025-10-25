import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface WelcomeScreenProps {
  hasImage: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ hasImage }) => {
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => translations[key][language];

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg shadow-xl h-full text-center">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-gray-100">
          {hasImage ? t('welcomeReadyTitle') : t('welcomeStartTitle')}
        </h2>
        <p className="mt-4 text-gray-400">
          {hasImage 
            ? t('welcomeReadyBody')
            : t('welcomeStartBody')
          }
        </p>
        <div className="mt-6 flex flex-col sm:flex-row flex-wrap justify-center gap-2 text-sm text-cyan-400">
          <span className="bg-gray-700 rounded-full px-3 py-1">Top View</span>
          <span className="bg-gray-700 rounded-full px-3 py-1">Facade Views</span>
          <span className="bg-gray-700 rounded-full px-3 py-1">Isometric 3D</span>
          <span className="bg-gray-700 rounded-full px-3 py-1">Perspective Shots</span>
        </div>
      </div>
    </div>
  );
};
