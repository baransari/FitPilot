import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Modern import syntax kullanıyoruz
import tr from './locales/tr';
import en from './locales/en';

console.log("i18n module loaded");

// Dil kaynaklarımızı sağlayalım
const resources = {
  tr: {
    translation: tr,
  },
  en: {
    translation: en,
  },
};

// İlk başlatma - uygulama açıldığında hemen çalışsın
i18n.use(initReactI18next).init({
  resources,
  lng: 'tr', // varsayılan dil
  fallbackLng: 'tr',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  debug: false, // Production'da false olmalı
});

// Dil tercihini AsyncStorage'dan alıp güncelleyen fonksiyon
const loadSavedLanguage = async (): Promise<void> => {
  try {
    const savedLanguage = await AsyncStorage.getItem('userLanguage');
    if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
      await i18n.changeLanguage(savedLanguage);
      console.log("Loaded language from storage:", savedLanguage);
    }
  } catch (error) {
    console.error("Error loading language preference:", error);
  }
};

// Dil değiştirme yardımcı fonksiyonu
export const changeLanguage = async (language: string): Promise<boolean> => {
  try {
    if (!['tr', 'en'].includes(language)) {
      console.warn('Unsupported language:', language);
      return false;
    }
    
    console.log("Changing language to:", language);
    await AsyncStorage.setItem('userLanguage', language);
    await i18n.changeLanguage(language);
    console.log("Language changed successfully");
    return true;
  } catch (error) {
    console.error('Dil değiştirilirken hata oluştu:', error);
    return false;
  }
};

// Dışa aktarılan basitleştirilmiş fonksiyon
export const initI18n = async (): Promise<typeof i18n> => {
  await loadSavedLanguage();
  return i18n;
};

export default i18n; 