import React, { useRef } from 'react';
import { UploadIcon } from './icons/UploadIcon';
import { CloseIcon } from './icons/CloseIcon';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../translations';

interface ImageUploaderProps {
  onImageUpload: (files: FileList) => void;
  onRemoveImage: (index: number) => void;
  onSelectImage: (index: number) => void;
  imagePreviewUrls: string[];
  selectedImageIndex: number | null;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  onImageUpload, 
  onRemoveImage,
  onSelectImage,
  imagePreviewUrls, 
  selectedImageIndex,
  isLoading 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { language } = useLanguage();
  const t = (key: keyof typeof translations) => translations[key][language];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      onImageUpload(files);
      // Reset the input value to allow uploading the same file again
      event.target.value = '';
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
        multiple
      />
      <button
        onClick={handleUploadClick}
        disabled={isLoading}
        className="w-full border-2 border-dashed border-gray-500 hover:border-cyan-400 rounded-lg p-6 text-center cursor-pointer transition duration-300 disabled:cursor-not-allowed disabled:border-gray-700 disabled:text-gray-500"
      >
        <div className="flex flex-col items-center justify-center">
          <UploadIcon className="w-8 h-8 mb-2" />
          <span className="font-semibold">{imagePreviewUrls.length > 0 ? t('addMoreImages') : t('uploadImage')}</span>
          <span className="text-xs text-gray-400 mt-1">{t('fileTypes')}</span>
        </div>
      </button>

      {imagePreviewUrls.length > 0 && (
        <div className="mt-4 w-full">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">{t('uploadedImagesTitle')}</h3>
            <p className="text-xs text-gray-500 mb-3">{t('selectImagePrompt')}</p>
            <div className="grid grid-cols-3 gap-2">
            {imagePreviewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square group">
                    <button 
                        onClick={() => onSelectImage(index)}
                        className={`w-full h-full rounded-md overflow-hidden transition-all duration-200 ${selectedImageIndex === index ? 'ring-4 ring-cyan-400' : 'ring-2 ring-gray-700 hover:ring-cyan-500'}`}
                    >
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemoveImage(index);
                        }}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        aria-label={t('removeImageAriaLabel')}
                        disabled={isLoading}
                    >
                        <CloseIcon className="w-3 h-3" />
                    </button>
                </div>
            ))}
            </div>
        </div>
      )}
    </div>
  );
};