import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
    const { language } = useLanguage();
    const t = (key: keyof typeof translations) => translations[key][language];

    return (
        <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
            <div className="container mx-auto text-center relative">
                <h1 className="text-2xl md:text-3xl font-bold text-cyan-400">
                    {t('headerTitle')}
                </h1>
                <p className="text-sm md:text-base text-gray-400 mt-1">
                    {t('headerTagline')}
                </p>
                <div className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4">
                    <LanguageSwitcher />
                </div>
            </div>
        </header>
    );
}
