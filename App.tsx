import React, { useState, useCallback, useEffect } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { GeneratedImagesView } from './components/GeneratedImagesView';
import { Loader } from './components/Loader';
import { generateArchitecturalViews } from './services/geminiService';
import { GeneratedImage } from './types';
import { Header } from './components/Header';
import { ErrorDisplay } from './components/ErrorDisplay';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useLanguage } from './contexts/LanguageContext';
import { translations } from './translations';
import { Footer } from './components/Footer';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const { language } = useLanguage();

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = (key: keyof typeof translations) => translations[key][language];

  const handleImageUpload = useCallback((files: FileList) => {
    const newFiles = Array.from(files);
    if (newFiles.length === 0) return;
    
    setGeneratedImages([]);
    setError(null);

    let newUrls: string[] = [];
    let loadedCount = 0;

    newFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newUrls[index] = reader.result as string;
        loadedCount++;
        if (loadedCount === newFiles.length) {
          const totalFiles = uploadedFiles.length + newFiles.length;
          setUploadedFiles(prev => [...prev, ...newFiles]);
          setImagePreviewUrls(prev => [...prev, ...newUrls]);
          if (selectedImageIndex === null) {
            setSelectedImageIndex(0);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  }, [selectedImageIndex, uploadedFiles.length]);

  const handleRemoveImage = useCallback((indexToRemove: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== indexToRemove);
    const newUrls = imagePreviewUrls.filter((_, i) => i !== indexToRemove);
    
    setUploadedFiles(newFiles);
    setImagePreviewUrls(newUrls);

    if (selectedImageIndex === indexToRemove) {
      setSelectedImageIndex(newFiles.length > 0 ? 0 : null);
    } else if (selectedImageIndex !== null && selectedImageIndex > indexToRemove) {
      setSelectedImageIndex(prev => prev! - 1);
    }
  }, [selectedImageIndex, uploadedFiles, imagePreviewUrls]);

  const handleSelectImage = useCallback((index: number) => {
    setSelectedImageIndex(index);
  }, []);

  const handleGenerate = async () => {
    if (selectedImageIndex === null || !uploadedFiles[selectedImageIndex] || !imagePreviewUrls[selectedImageIndex]) {
      setError('Please upload and select an image first.');
      return;
    }

    const file = uploadedFiles[selectedImageIndex];
    const imageUrl = imagePreviewUrls[selectedImageIndex];

    setIsLoading(true);
    setGeneratedImages([]);
    setError(null);
    setProgressMessage('Initializing generation process...');

    try {
      const base64Data = imageUrl.split(',')[1];
      
      const images = await generateArchitecturalViews(base64Data, file.type, (message) => {
        setProgressMessage(message);
      });
      setGeneratedImages(images);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
      setProgressMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <Header />
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 xl:col-span-3">
            <div className="bg-gray-800 rounded-lg p-6 shadow-xl sticky top-8">
              <h2 className="text-xl font-bold mb-4 text-cyan-400">{t('controlsTitle')}</h2>
              <ImageUploader 
                onImageUpload={handleImageUpload} 
                imagePreviewUrls={imagePreviewUrls}
                isLoading={isLoading}
                onRemoveImage={handleRemoveImage}
                onSelectImage={handleSelectImage}
                selectedImageIndex={selectedImageIndex}
              />
              <button
                onClick={handleGenerate}
                disabled={selectedImageIndex === null || isLoading}
                className="w-full mt-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
              >
                {isLoading ? t('generatingButton') : t('generateButton')}
              </button>
            </div>
          </div>
          <div className="lg:col-span-8 xl:col-span-9">
            {isLoading && <Loader message={progressMessage} />}
            {error && <ErrorDisplay message={error} />}
            {!isLoading && !error && generatedImages.length > 0 && <GeneratedImagesView images={generatedImages} />}
            {!isLoading && !error && generatedImages.length === 0 && (
                <WelcomeScreen hasImage={uploadedFiles.length > 0} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;