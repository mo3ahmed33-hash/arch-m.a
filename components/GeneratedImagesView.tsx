import React, { useState } from 'react';
import JSZip from 'jszip';
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

  const handleDownload = () => {
    const format = 'png';
    const baseFileName = image.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-');
    const requestedMimeType = `image/${format}`;

    if (image.mimeType === requestedMimeType) {
      const link = document.createElement('a');
      link.href = image.url;
      link.download = `${baseFileName}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx!.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL(requestedMimeType);

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `${baseFileName}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.onerror = () => {
        console.error("Failed to load image for conversion.");
      };
      img.src = image.url;
    }
  };
  
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-cyan-500/20 flex flex-col">
      <div className="aspect-w-1 aspect-h-1 w-full">
        <img src={image.url} alt={image.title} className="object-cover w-full h-full" />
      </div>
      <div className="p-4 flex flex-col flex-grow justify-between">
        <h3 className="font-semibold text-gray-200 text-sm text-center mb-3">{image.title}</h3>
        <button
          type="button"
          className="inline-flex items-center justify-center w-full px-4 py-2 rounded-lg bg-gray-700 hover:bg-cyan-600 text-white transition-colors duration-200 text-sm font-medium"
          onClick={handleDownload}
        >
          <DownloadIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
          <span>{t('downloadImage')}</span>
        </button>
      </div>
    </div>
  );
};

export const GeneratedImagesView: React.FC<GeneratedImagesViewProps> = ({ images }) => {
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => translations[key][language];
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadAll = async () => {
    if (images.length === 0 || isZipping) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      const imagePromises = images.map(async (image) => {
        const response = await fetch(image.url);
        const blob = await response.blob();
        const extension = image.mimeType.split('/')[1] || 'png';
        const fileName = `${image.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-')}.${extension}`;
        zip.file(fileName, blob);
      });

      await Promise.all(imagePromises);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = 'architectural-views.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Failed to create zip file", error);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="space-y-4">
        <div className="flex flex-wrap gap-4 justify-between items-center">
            <h2 className="text-2xl font-bold text-cyan-400">{t('generatedViewsTitle')}</h2>
            {images.length > 0 && (
                 <button
                    onClick={handleDownloadAll}
                    disabled={isZipping}
                    className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white transition-colors duration-200 text-sm font-medium"
                    aria-label={t('downloadAllAriaLabel')}
                >
                    <DownloadIcon className="w-5 h-5 ltr:mr-2 rtl:ml-2" />
                    <span>{isZipping ? t('zipping') : t('downloadAll')}</span>
                </button>
            )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {images.map((image) => (
                <ImageCard key={image.title} image={image} />
            ))}
        </div>
    </div>
  );
};