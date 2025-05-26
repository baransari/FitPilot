import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageKeys {
  USER_PROFILE: string;
  HEALTH_DATA: string;
  FOOD_LOG: string;
  EXERCISE_LOG: string;
  SLEEP_LOG: string;
  SETTINGS: string;
}

const STORAGE_KEYS: StorageKeys = {
  USER_PROFILE: '@HealthTrackAI:userProfile',
  HEALTH_DATA: '@HealthTrackAI:healthData',
  FOOD_LOG: '@HealthTrackAI:foodLog',
  EXERCISE_LOG: '@HealthTrackAI:exerciseLog',
  SLEEP_LOG: '@HealthTrackAI:sleepLog',
  SETTINGS: '@HealthTrackAI:settings',
};

const USER_STORAGE_KEY = '@HealthTrackAI:userData';

export const StorageService = {
  /**
   * Verileri AsyncStorage'a kaydeder
   */
  storeData: async (key: string, value: any): Promise<boolean> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('Error storing data:', error);
      return false;
    }
  },

  /**
   * AsyncStorage'dan verileri alır
   */
  getData: async (key: string): Promise<any> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue !== null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting data:', error);
      return null;
    }
  },

  /**
   * AsyncStorage'dan veri siler
   */
  removeData: async (key: string): Promise<boolean> => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  },

  /**
   * Tüm AsyncStorage'ı temizler
   */
  clearAll: async (): Promise<boolean> => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  },

  /**
   * Kullanıcı profilini kaydetme
   */
  saveUserProfile: async (userProfile: any): Promise<boolean> => {
    return await StorageService.storeData(STORAGE_KEYS.USER_PROFILE, userProfile);
  },

  /**
   * Kullanıcı profilini getirme
   */
  getUserProfile: async (): Promise<any> => {
    return await StorageService.getData(STORAGE_KEYS.USER_PROFILE);
  },

  /**
   * Sağlık verilerini kaydetme
   */
  saveHealthData: async (healthData: any): Promise<boolean> => {
    return await StorageService.storeData(STORAGE_KEYS.HEALTH_DATA, healthData);
  },

  /**
   * Sağlık verilerini getirme
   */
  getHealthData: async (): Promise<any> => {
    return await StorageService.getData(STORAGE_KEYS.HEALTH_DATA);
  },

  /**
   * Yemek günlüğüne yeni öğün ekleme
   */
  addFoodEntry: async (foodEntry: any): Promise<boolean> => {
    try {
      const existingLog = (await StorageService.getData(STORAGE_KEYS.FOOD_LOG)) || [];
      existingLog.unshift(foodEntry); // Yeni girdiyi listenin başına ekle
      return await StorageService.storeData(STORAGE_KEYS.FOOD_LOG, existingLog);
    } catch (error) {
      console.error('Error adding food entry:', error);
      return false;
    }
  },

  /**
   * Tüm yemek günlüğünü getirme
   */
  getFoodLog: async (): Promise<any[]> => {
    return (await StorageService.getData(STORAGE_KEYS.FOOD_LOG)) || [];
  },

  /**
   * Egzersiz günlüğüne yeni egzersiz ekleme
   */
  addExerciseEntry: async (exerciseEntry: any): Promise<boolean> => {
    try {
      const existingLog = (await StorageService.getData(STORAGE_KEYS.EXERCISE_LOG)) || [];
      existingLog.unshift(exerciseEntry);
      return await StorageService.storeData(STORAGE_KEYS.EXERCISE_LOG, existingLog);
    } catch (error) {
      console.error('Error adding exercise entry:', error);
      return false;
    }
  },

  /**
   * Tüm egzersiz günlüğünü getirme
   */
  getExerciseLog: async (): Promise<any[]> => {
    return (await StorageService.getData(STORAGE_KEYS.EXERCISE_LOG)) || [];
  },

  /**
   * Uyku günlüğüne yeni kayıt ekleme
   */
  addSleepEntry: async (sleepEntry: any): Promise<boolean> => {
    try {
      const existingLog = (await StorageService.getData(STORAGE_KEYS.SLEEP_LOG)) || [];
      existingLog.unshift(sleepEntry);
      return await StorageService.storeData(STORAGE_KEYS.SLEEP_LOG, existingLog);
    } catch (error) {
      console.error('Error adding sleep entry:', error);
      return false;
    }
  },

  /**
   * Tüm uyku günlüğünü getirme
   */
  getSleepLog: async (): Promise<any[]> => {
    return (await StorageService.getData(STORAGE_KEYS.SLEEP_LOG)) || [];
  },

  /**
   * Uygulama ayarlarını kaydetme
   */
  saveSettings: async (settings: any): Promise<boolean> => {
    return await StorageService.storeData(STORAGE_KEYS.SETTINGS, settings);
  },

  /**
   * Uygulama ayarlarını getirme
   */
  getSettings: async (): Promise<any> => {
    return await StorageService.getData(STORAGE_KEYS.SETTINGS);
  },

  /**
   * Alternative method for storeData to match expected API in UserContext
   */
  setItem: async (key: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item:', error);
      throw error;
    }
  },

  /**
   * Alternative method for getData to match expected API in UserContext
   */
  getItem: async (key: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item:', error);
      throw error;
    }
  },
};

export default StorageService;
