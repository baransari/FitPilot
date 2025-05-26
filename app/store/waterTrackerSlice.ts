import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch, RootState } from './index';

// Depolama anahtarları
export const STORAGE_KEYS = {
  WATER_GOAL: '@HealthTrackAI:waterGoal',
  WATER_ENTRIES: '@HealthTrackAI:waterEntries',
};

// AppThunk tipi
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => Promise<ReturnType>;

/**
 * Su kaydı tipi
 * Kullanıcının su tüketiminin tek bir girişini temsil eder
 */
export interface WaterEntry {
  id: string;          // Benzersiz tanımlayıcı
  amount: number;      // ml cinsinden miktar
  timestamp: string;   // ISO formatında tarih-saat
}

/**
 * Su takibi durumu
 * Tüm su tüketimi verilerini ve durumunu tutar
 */
interface WaterTrackerState {
  goal: number;        // Günlük hedef (ml)
  entries: WaterEntry[]; // Su kayıtları
  loading: boolean;    // Yükleme durumu
  error: string | null; // Hata mesajı
}

// Başlangıç durumu
const initialState: WaterTrackerState = {
  goal: 2500, // Varsayılan olarak 2500ml (2.5L)
  entries: [],
  loading: false,
  error: null,
};

// Su takibi slice oluşturma
const waterTrackerSlice = createSlice({
  name: 'waterTracker',
  initialState,
  reducers: {
    // Su hedefi güncelleme
    setWaterGoal: (state, action: PayloadAction<number>) => {
      state.goal = action.payload;
      
      // AsyncStorage'a kaydet
      const saveGoal = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.WATER_GOAL, action.payload.toString());
        } catch (error) {
          console.error('Su hedefi kaydedilirken hata oluştu:', error);
        }
      };
      
      saveGoal();
    },

    // Su ekleme
    addWaterEntry: (state, action: PayloadAction<WaterEntry | { amount: number }>) => {
      let entry: WaterEntry;
      
      // Payload WaterEntry tipinde mi yoksa sadece miktar mı kontrol et
      if ('id' in action.payload && 'timestamp' in action.payload) {
        entry = action.payload as WaterEntry;
      } else {
        // Yeni bir kayıt oluştur - benzersiz bir id oluştur
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const uniqueId = `water-entry-${timestamp}-${random}`;
        
        entry = {
          id: uniqueId,
          amount: (action.payload as { amount: number }).amount,
          timestamp: new Date().toISOString(),
        };
      }
      
      state.entries.push(entry);
      
      // AsyncStorage'a kaydet
      const saveEntries = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.WATER_ENTRIES, JSON.stringify(state.entries));
        } catch (error) {
          console.error('Su kayıtları kaydedilirken hata oluştu:', error);
        }
      };
      
      saveEntries();
    },

    // Su kaydı silme
    removeWaterEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(entry => entry.id !== action.payload);
      
      // AsyncStorage'a kaydet
      const saveEntries = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.WATER_ENTRIES, JSON.stringify(state.entries));
        } catch (error) {
          console.error('Su kaydı silinirken hata oluştu:', error);
        }
      };
      
      saveEntries();
    },

    // Tüm su kayıtlarını temizleme
    clearWaterEntries: state => {
      state.entries = [];
      
      // AsyncStorage'dan su kayıtlarını sil
      const clearEntries = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.WATER_ENTRIES, JSON.stringify([]));
        } catch (error) {
          console.error('Su kayıtları temizlenirken hata oluştu:', error);
        }
      };
      
      clearEntries();
    },

    // Su kayıtlarını güncelleme (örneğin, cihaz depolamasından yükleme)
    setWaterEntries: (state, action: PayloadAction<WaterEntry[]>) => {
      state.entries = action.payload;
      
      // AsyncStorage'a kaydet
      const saveEntries = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.WATER_ENTRIES, JSON.stringify(action.payload));
        } catch (error) {
          console.error('Su kayıtları güncellenirken hata oluştu:', error);
        }
      };
      
      saveEntries();
    },

    // Yükleme durumu başladı
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (state.loading) {
        state.error = null;
      }
    },

    // Hata durumu
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Action'ları dışa aktar
export const {
  setWaterGoal,
  addWaterEntry,
  removeWaterEntry,
  clearWaterEntries,
  setWaterEntries,
  setLoading,
  setError,
} = waterTrackerSlice.actions;

/**
 * AsyncStorage'dan su takibi verilerini yükle
 */
export const loadWaterData = (): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Su hedefini yükle
    const storedGoal = await AsyncStorage.getItem(STORAGE_KEYS.WATER_GOAL);
    if (storedGoal) {
      dispatch(setWaterGoal(parseInt(storedGoal, 10)));
    }
    
    // Su kayıtlarını yükle
    const storedEntries = await AsyncStorage.getItem(STORAGE_KEYS.WATER_ENTRIES);
    if (storedEntries) {
      dispatch(setWaterEntries(JSON.parse(storedEntries)));
    }
    
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Veri yüklenirken hata oluştu'));
    dispatch(setLoading(false));
  }
};

/**
 * Su hedefini güncelle ve kaydet
 */
export const updateWaterGoalWithStorage = (goal: number): AppThunk => async (dispatch) => {
  dispatch(setWaterGoal(goal));
  // setWaterGoal zaten AsyncStorage kaydetme işlemini içeriyor
};

/**
 * Su ekle ve kaydet
 */
export const addWaterWithStorage = (amount: number): AppThunk => async (dispatch) => {
  // Yeni kayıt oluştur - benzersiz bir id oluştur
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const uniqueId = `water-entry-${timestamp}-${random}`;
  
  const newEntry: WaterEntry = {
    id: uniqueId,
    amount,
    timestamp: new Date().toISOString(),
  };
  
  dispatch(addWaterEntry(newEntry));
  // addWaterEntry zaten AsyncStorage kaydetme işlemini içeriyor
};

/**
 * Belirli bir tarihte tüketilen toplam su miktarını hesapla
 * @param entries Tüm su kayıtları
 * @param date YYYY-MM-DD formatında tarih (varsayılan: bugün)
 * @returns ml cinsinden toplam su miktarı
 */
export const calculateDailyWaterIntake = (entries: WaterEntry[], date?: string): number => {
  const targetDate = date || new Date().toISOString().split('T')[0];
  
  return entries
    .filter(entry => entry.timestamp.startsWith(targetDate))
    .reduce((total, entry) => total + entry.amount, 0);
};

/**
 * Su hedefine ulaşma yüzdesini hesapla
 * @param intake Tüketilen su miktarı (ml)
 * @param goal Hedef su miktarı (ml)
 * @returns 0-100 arasında yüzde değeri
 */
export const calculateWaterPercentage = (intake: number, goal: number): number => {
  if (!goal) return 0;
  const percentage = (intake / goal) * 100;
  return Math.min(Math.max(percentage, 0), 100); // 0-100 aralığında sınırla
};

/**
 * Belirli bir tarih aralığındaki günlük su tüketimlerini hesapla
 * @param entries Tüm su kayıtları
 * @param days Kaç gün geriye gidileceği (varsayılan: 7)
 * @returns Her gün için tarih ve su tüketimi
 */
export const getWaterIntakeByDays = (entries: WaterEntry[], days: number = 7): { date: string; amount: number }[] => {
  const result: { date: string; amount: number }[] = [];
  const today = new Date();
  
  // Son 'days' günü hesapla
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // O gün için toplam su tüketimi
    const dailyAmount = calculateDailyWaterIntake(entries, dateStr);
    
    result.push({
      date: dateStr,
      amount: dailyAmount
    });
  }
  
  return result;
};

export default waterTrackerSlice.reducer;
