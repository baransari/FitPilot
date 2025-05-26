import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18n, { changeLanguage } from '../i18n';

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => Promise<boolean>;
  isRTL: boolean;
};

type LanguageProviderProps = {
  children: ReactNode;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>(i18n.language || 'tr');
  const [isRTL, setIsRTL] = useState<boolean>(false);

  // i18n dil değişikliğini dinle
  useEffect(() => {
    // Güncel dili takip et
    const handleLanguageChanged = (lng: string) => {
      console.log("Language changed to:", lng);
      setLanguage(lng);
      setIsRTL(['ar', 'he', 'fa'].includes(lng));
    };

    // Dil değiştiğinde tetiklenecek olay
    i18n.on('languageChanged', handleLanguageChanged);

    // Temizleme
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  // Dil değiştirme fonksiyonu
  const handleChangeLanguage = async (lang: string): Promise<boolean> => {
    try {
      const success = await changeLanguage(lang);
      return success;
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
      return false;
    }
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage: handleChangeLanguage,
        isRTL,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Kolay kullanım için hook
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext; 