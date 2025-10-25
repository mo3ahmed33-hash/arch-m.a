import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  imagePreviewUrl: string | null;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, imagePreviewUrl, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => translations[key][language];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
        disabled={isLoading}
      />
      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        className="w-full border-2 border-dashed border-gray-500 hover:border-cyan-400 rounded-lg p-6 text-center cursor-pointer transition duration-300 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-500"
      >
        <div className="flex flex-col items-center justify-center">
          <UploadIcon className="w-8 h-8 mb-2" />
          <span className="font-semibold">{imagePreviewUrl ? t('changeImage') : t('uploadImage')}</span>
          <span className="text-xs text-gray-400 mt-1">{t('fileTypes')}</span>
        </div>
      </button>

      {imagePreviewUrl && (
        <div className="mt-4 w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-700">
          <img src={imagePreviewUrl} alt="Building preview" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
};
