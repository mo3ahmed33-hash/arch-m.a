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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
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

  const handleImageUpload = useCallback((file: File) => {
    setUploadedFile(file);
    setGeneratedImages([]);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleGenerate = async () => {
    if (!uploadedFile || !imagePreviewUrl) {
      setError('Please upload an image first.');
      return;
    }

    setIsLoading(true);
    setGeneratedImages([]);
    setError(null);
    setProgressMessage('Initializing generation process...');

    try {
      // The imagePreviewUrl is already a base64 data URL
      const base64Data = imagePreviewUrl.split(',')[1];
      
      const images = await generateArchitecturalViews(base64Data, uploadedFile.type, (message) => {
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
                imagePreviewUrl={imagePreviewUrl}
                isLoading={isLoading}
              />
              <button
                onClick={handleGenerate}
                disabled={!uploadedFile || isLoading}
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
                <WelcomeScreen hasImage={!!imagePreviewUrl} />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
