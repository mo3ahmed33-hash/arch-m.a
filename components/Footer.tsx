import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

export const Footer: React.FC = () => {
    const { language } = useLanguage();

    return (
        <footer className="bg-gray-800/50 py-4 mt-8">
            <div className="container mx-auto text-center text-gray-400 text-sm">
                <a 
                    href="https://www.instagram.com/m3f.a/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-cyan-400 transition-colors"
                >
                    {translations.footerCredit[language]}
                </a>
            </div>
        </footer>
    );
}