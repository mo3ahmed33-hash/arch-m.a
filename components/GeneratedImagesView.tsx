import React from 'react';
import { GeneratedImage } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface GeneratedImagesViewProps {
  images: GeneratedImage[];
}

const ImageCard: React.FC<{ image: GeneratedImage }> = ({ image }) => {
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => translations[key][language];
  const fileName = `${image.title.toLowerCase().replace(/\s+/g, '-')}.png`;
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-cyan-500/20">
      <div className="aspect-w-1 aspect-h-1 w-full">
        <img src={image.url} alt={image.title} className="object-cover w-full h-full" />
      </div>
      <div className="p-4 text-center">
        <h3 className="font-semibold text-gray-200 text-sm mb-3">{image.title}</h3>
        <a
          href={image.url}
          download={fileName}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-700 hover:bg-cyan-600 text-white transition-colors duration-200 text-sm font-medium"
          aria-label={`${t('downloadAriaLabel')} ${image.title}`}
        >
          <DownloadIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
          <span>{t('download')}</span>
        </a>
      </div>
    </div>
  );
};

export const GeneratedImagesView: React.FC<GeneratedImagesViewProps> = ({ images }) => {
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => translations[key][language];

  return (
    <div className="space-y-4">
        <h2 className="text-2xl font-bold text-cyan-400">{t('generatedViewsTitle')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {images.map((image) => (
                <ImageCard key={image.title} image={image} />
            ))}
        </div>
    </div>
  );
};
