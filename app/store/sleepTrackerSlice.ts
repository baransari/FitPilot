import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import StorageService from '../services/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch, RootState } from './index';

// Depolama anahtarları
export const STORAGE_KEYS = {
  SLEEP_ENTRIES: '@HealthTrackAI:sleepEntries',
  SLEEP_GOAL: '@HealthTrackAI:sleepGoal'
};

// AppThunk tipi
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => Promise<ReturnType>;

/**
 * Uyku kalitesi düzeyi
 * poor: kötü uyku
 * fair: orta düzey uyku
 * good: iyi uyku
 * excellent: mükemmel uyku
 */
export type SleepQuality = 'poor' | 'fair' | 'good' | 'excellent';

/**
 * Uyku kaydı
 * Bir uyku seansının tüm bilgilerini içerir.
 */
export interface SleepEntry {
  id: string;
  date: string;              // YYYY-MM-DD formatında tarih
  startTime: string;         // HH:MM formatında uyku başlangıç saati
  endTime: string;           // HH:MM formatında uyanma saati
  duration: number;          // Saat cinsinden toplam uyku süresi
  quality: SleepQuality;     // Uyku kalitesi değerlendirmesi
  notes?: string;            // Opsiyonel notlar
  deepSleepPercentage?: number; // Derin uyku yüzdesi
  remSleepPercentage?: number;  // REM uyku yüzdesi

  // Geriye dönük uyumluluk alanları
  bedTime?: string;          // startTime'ın alternatifi
  wakeTime?: string;         // endTime'ın alternatifi
}

/**
 * Uyku takibi durumu
 */
interface SleepTrackerState {
  entries: SleepEntry[];        // Tüm uyku kayıtları
  lastSleep: SleepEntry | null; // Son uyku kaydı
  sleepGoal: number;            // Saat cinsinden günlük uyku hedefi
  loading: boolean;             // Yükleme durumu
  error: string | null;         // Hata mesajı
  averageDuration: number;      // Ortalama uyku süresi (saat)
}

// Initial state
const initialState: SleepTrackerState = {
  entries: [],
  lastSleep: {
    id: 'default-sleep',
    date: new Date().toISOString().split('T')[0],
    startTime: '23:00',
    endTime: '07:00',
    duration: 8.0,
    quality: 'good',
    deepSleepPercentage: 25,
    remSleepPercentage: 20,
    bedTime: '23:00',
    wakeTime: '07:00',
  },
  sleepGoal: 8.0,
  loading: false,
  error: null,
  averageDuration: 8.0,
};

// Helper function to calculate average sleep duration
const calculateAverageDuration = (entries: SleepEntry[]): number => {
  if (entries.length === 0) return 0;
  const total = entries.reduce((sum, entry) => sum + entry.duration, 0);
  return parseFloat((total / entries.length).toFixed(1));
};

/**
 * AsyncStorage'dan uyku verilerini yükleme işlemi
 * Hem Storage hizmeti hem de AsyncStorage kontrol edilir
 */
export const loadSleepData = createAsyncThunk('sleepTracker/loadSleepData', async () => {
  try {
    // Önce StorageService'den yüklemeyi dene
    const storageData = await StorageService.getSleepLog();
    
    // Sonra AsyncStorage'den yüklemeyi dene
    const asyncStorageData = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_ENTRIES);
    const parsedAsyncData = asyncStorageData ? JSON.parse(asyncStorageData) : [];
    
    // Hedefi de yükleyelim
    const sleepGoalString = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_GOAL);
    const sleepGoal = sleepGoalString ? parseFloat(sleepGoalString) : 8.0;
    
    // Verileri birleştir ve geri döndür
    // StorageService verileri varsa öncelik tanı
    const entries = storageData?.length ? storageData : parsedAsyncData;
    
    return { 
      entries: entries || [],
      sleepGoal
    };
  } catch (error) {
    console.error('Error loading sleep data:', error);
    throw error;
  }
});

/**
 * Uyku verilerini AsyncStorage'a kaydetme
 */
export const saveAllSleepData = createAsyncThunk(
  'sleepTracker/saveAllSleepData',
  async (entries: SleepEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_ENTRIES, JSON.stringify(entries));
      return entries;
    } catch (error) {
      console.error('Error saving sleep entries:', error);
      throw error;
    }
  }
);

/**
 * Uyku hedefini AsyncStorage'a kaydetme
 */
export const saveSleepGoal = createAsyncThunk(
  'sleepTracker/saveSleepGoal',
  async (goal: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_GOAL, goal.toString());
      return goal;
    } catch (error) {
      console.error('Error saving sleep goal:', error);
      throw error;
    }
  }
);

// Sleep tracker slice
const sleepTrackerSlice = createSlice({
  name: 'sleepTracker',
  initialState,
  reducers: {
    // Set all sleep entries
    setSleepEntries: (state, action: PayloadAction<SleepEntry[]>) => {
      state.entries = action.payload;
      state.lastSleep = action.payload.length > 0 ? action.payload[0] : null;
      state.averageDuration = calculateAverageDuration(action.payload);
      
      // Save to AsyncStorage
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_ENTRIES, JSON.stringify(action.payload));
        } catch (error) {
          console.error('Error saving sleep entries:', error);
        }
      };
      
      saveData();
    },

    // Add a new sleep entry
    addSleepEntry: (state, action: PayloadAction<SleepEntry>) => {
      // Convert bedTime/wakeTime to startTime/endTime if needed
      const entry: SleepEntry = {
        ...action.payload,
        startTime: action.payload.startTime || action.payload.bedTime || '00:00',
        endTime: action.payload.endTime || action.payload.wakeTime || '08:00',
      };

      state.entries.unshift(entry);
      state.lastSleep = entry;
      state.averageDuration = calculateAverageDuration(state.entries);

      // Save to storage
      const saveSleepEntry = async () => {
        try {
          // StorageService için
          await StorageService.addSleepEntry(entry);
          
          // AsyncStorage için
          await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_ENTRIES, JSON.stringify(state.entries));
          
          console.log('Sleep entry saved to storage');
        } catch (error) {
          console.error('Error saving sleep entry:', error);
        }
      };

      saveSleepEntry();
    },

    // Update an existing sleep entry
    updateSleepEntry: (state, action: PayloadAction<SleepEntry>) => {
      const index = state.entries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        state.entries[index] = action.payload;

        // If updating the last sleep entry, update lastSleep too
        if (state.lastSleep && state.lastSleep.id === action.payload.id) {
          state.lastSleep = action.payload;
        }

        state.averageDuration = calculateAverageDuration(state.entries);
        
        // Save to AsyncStorage
        const saveData = async () => {
          try {
            await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_ENTRIES, JSON.stringify(state.entries));
          } catch (error) {
            console.error('Error updating sleep entry in storage:', error);
          }
        };
        
        saveData();
      }
    },

    // Remove a sleep entry
    removeSleepEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(entry => entry.id !== action.payload);

      // If removing the last sleep entry, update lastSleep
      if (state.lastSleep && state.lastSleep.id === action.payload) {
        state.lastSleep = state.entries.length > 0 ? state.entries[0] : null;
      }

      state.averageDuration = calculateAverageDuration(state.entries);
      
      // Save to AsyncStorage
      const saveData = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_ENTRIES, JSON.stringify(state.entries));
        } catch (error) {
          console.error('Error removing sleep entry from storage:', error);
        }
      };
      
      saveData();
    },

    // Set sleep goal
    setSleepGoal: (state, action: PayloadAction<number>) => {
      state.sleepGoal = action.payload;
      
      // Save to AsyncStorage
      const saveGoal = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_GOAL, action.payload.toString());
        } catch (error) {
          console.error('Error saving sleep goal to storage:', error);
        }
      };
      
      saveGoal();
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error state
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadSleepData.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSleepData.fulfilled, (state, action) => {
        state.entries = action.payload.entries;
        state.lastSleep = action.payload.entries.length > 0 ? action.payload.entries[0] : state.lastSleep;
        state.averageDuration = calculateAverageDuration(action.payload.entries);
        state.sleepGoal = action.payload.sleepGoal;
        state.loading = false;
      })
      .addCase(loadSleepData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load sleep data';
      })
      .addCase(saveAllSleepData.fulfilled, (state, action) => {
        // Zaten state'i değiştirmek için bir şey yapmamıza gerek yok
        // çünkü sadece mevcut entries'i kaydediyoruz
        console.log('All sleep data saved successfully');
      })
      .addCase(saveAllSleepData.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save sleep data';
        console.error('Failed to save sleep data:', action.error);
      })
      .addCase(saveSleepGoal.fulfilled, (state, action) => {
        console.log('Sleep goal saved successfully:', action.payload);
      })
      .addCase(saveSleepGoal.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to save sleep goal';
        console.error('Failed to save sleep goal:', action.error);
      });
  },
});

// Export actions and reducer
export const {
  setSleepEntries,
  addSleepEntry,
  updateSleepEntry,
  removeSleepEntry,
  setSleepGoal,
  setLoading,
  setError,
} = sleepTrackerSlice.actions;

/**
 * Birleşik işlevler - Redux Store ve AsyncStorage koordinasyonu 
 * Bu fonksiyonlar, useCallback içinde kullanılmak için daha uygundur.
 */

// Uyku kaydı ekleme ve depolamaya da kaydetme
export const addSleepEntryWithStorage = (entry: Omit<SleepEntry, 'id'>): AppThunk => async (dispatch) => {
  // Yeni ID oluştur
  const newEntry: SleepEntry = {
    ...entry,
    id: Date.now().toString(),
  };
  
  dispatch(addSleepEntry(newEntry));
  // addSleepEntry zaten AsyncStorage kaydetme işlemini içeriyor
};

// Uyku kaydını güncelleyip depolamaya kaydetme
export const updateSleepEntryWithStorage = (entry: SleepEntry): AppThunk => async (dispatch) => {
  dispatch(updateSleepEntry(entry));
  // updateSleepEntry zaten AsyncStorage kaydetme işlemini içeriyor
};

// Uyku kaydını silip depolamadan da kaldırma
export const removeSleepEntryWithStorage = (id: string): AppThunk => async (dispatch) => {
  dispatch(removeSleepEntry(id));
  // removeSleepEntry zaten AsyncStorage kaydetme işlemini içeriyor
};

// Uyku hedefini güncelleme ve depolamaya kaydetme
export const updateSleepGoalWithStorage = (goal: number): AppThunk => async (dispatch) => {
  dispatch(setSleepGoal(goal));
  // setSleepGoal zaten AsyncStorage kaydetme işlemini içeriyor
};

// Bugünün uyku verilerini al yardımcı fonksiyonu
export const getTodaySleepEntry = (entries: SleepEntry[]): SleepEntry | undefined => {
  const today = new Date().toISOString().split('T')[0];
  return entries.find(entry => entry.date === today);
};

// Bu haftanın uyku verilerini al yardımcı fonksiyonu
export const getWeeklySleepEntries = (entries: SleepEntry[], days: number = 7): SleepEntry[] => {
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(oneWeekAgo.getDate() - days);
  
  return entries.filter(entry => new Date(entry.date) >= oneWeekAgo);
};

export default sleepTrackerSlice.reducer;
