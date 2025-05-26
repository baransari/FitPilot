import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch, RootState } from './index';

// AppThunk tipi
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => Promise<ReturnType>;

// Depolama anahtarları
export const STORAGE_KEYS = {
  FOOD_ENTRIES: '@HealthTrackAI:foodEntries',
  FOOD_GOALS: '@HealthTrackAI:foodGoals',
};

/**
 * Besin içeriği tipi
 * Besin değerlerini gram cinsinden temsil eder
 */
export interface Nutrition {
  calories: number;
  protein: number; // gram
  carbs: number; // gram
  fat: number; // gram
  fiber?: number; // gram
  sugar?: number; // gram
}

/**
 * Yemek kaydı tipi
 * Kullanıcının tükettiği besinleri ve besin değerlerini tutar
 */
export interface FoodEntry {
  id: string;
  name: string;
  amount: number; // gram/ml cinsinden miktar
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutrition: Nutrition;
  timestamp: string;
  imageUrl?: string;
}

/**
 * Günlük beslenme hedefleri
 */
export interface DailyGoals {
  calories: number;
  protein: number; // gram
  carbs: number; // gram
  fat: number; // gram
  fiber?: number; // gram
  sugar?: number; // gram
}

/**
 * Yemek takibi durumu
 */
interface FoodTrackerState {
  entries: FoodEntry[]; // Yemek kayıtları
  goals: DailyGoals; // Günlük hedefler
  loading: boolean;
  error: string | null;
}

// Varsayılan günlük hedefler (ortalama bir yetişkin için)
const defaultGoals: DailyGoals = {
  calories: 2000,
  protein: 50, // gram
  carbs: 250, // gram
  fat: 70, // gram
  fiber: 25, // gram
  sugar: 50, // gram
};

// Başlangıç durumu
const initialState: FoodTrackerState = {
  entries: [],
  goals: defaultGoals,
  loading: false,
  error: null,
};

// Thunk actions for AsyncStorage operations
export const saveFoodEntriesToStorage = (entries: FoodEntry[]): AppThunk => async (dispatch) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FOOD_ENTRIES, JSON.stringify(entries));
  } catch (error) {
    console.error('Yemek kayıtları kaydedilirken hata oluştu:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Veri kaydedilirken hata oluştu'));
  }
};

export const saveFoodGoalsToStorage = (goals: DailyGoals): AppThunk => async (dispatch) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FOOD_GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error('Beslenme hedefleri kaydedilirken hata oluştu:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Veri kaydedilirken hata oluştu'));
  }
};

export const loadFoodData = (): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Yemek kayıtlarını yükle
    const storedEntries = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_ENTRIES);
    if (storedEntries) {
      dispatch(setFoodEntries(JSON.parse(storedEntries)));
    }
    
    // Beslenme hedeflerini yükle
    const storedGoals = await AsyncStorage.getItem(STORAGE_KEYS.FOOD_GOALS);
    if (storedGoals) {
      dispatch(updateGoals(JSON.parse(storedGoals)));
    }
    
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Veri yüklenirken hata oluştu'));
    dispatch(setLoading(false));
  }
};

// Combined actions with AsyncStorage
export const addFoodEntryWithStorage = (food: Omit<FoodEntry, 'id' | 'timestamp'>): AppThunk => async (dispatch, getState) => {
  // Create a unique ID using timestamp + random string to avoid collisions
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  
  const entry: FoodEntry = {
    id: uniqueId,
    ...food,
    timestamp: new Date().toISOString(),
  };
  
  dispatch(addFoodEntry(entry));
  await dispatch(saveFoodEntriesToStorage(getState().foodTracker.entries));
};

export const removeFoodEntryWithStorage = (id: string): AppThunk => async (dispatch, getState) => {
  dispatch(removeFoodEntry(id));
  await dispatch(saveFoodEntriesToStorage(getState().foodTracker.entries));
};

export const updateFoodEntryWithStorage = (id: string, entryData: Partial<FoodEntry>): AppThunk => async (dispatch, getState) => {
  dispatch(updateFoodEntry({ id, entry: entryData }));
  await dispatch(saveFoodEntriesToStorage(getState().foodTracker.entries));
};

export const clearFoodEntriesWithStorage = (): AppThunk => async (dispatch) => {
  dispatch(clearFoodEntries());
  await dispatch(saveFoodEntriesToStorage([]));
};

export const updateGoalsWithStorage = (goals: Partial<DailyGoals>): AppThunk => async (dispatch, getState) => {
  dispatch(updateGoals(goals));
  await dispatch(saveFoodGoalsToStorage(getState().foodTracker.goals));
};

// Yemek takibi slice oluşturma
const foodTrackerSlice = createSlice({
  name: 'foodTracker',
  initialState,
  reducers: {
    // Yemek ekleme
    addFoodEntry: (state, action: PayloadAction<FoodEntry>) => {
      state.entries.push(action.payload);
    },

    // Yemek kaydı silme
    removeFoodEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter(entry => entry.id !== action.payload);
    },

    // Yemek kaydı güncelleme
    updateFoodEntry: (state, action: PayloadAction<{ id: string; entry: Partial<FoodEntry> }>) => {
      const index = state.entries.findIndex(entry => entry.id === action.payload.id);
      if (index !== -1) {
        state.entries[index] = { ...state.entries[index], ...action.payload.entry };
      }
    },

    // Tüm kayıtları temizleme
    clearFoodEntries: state => {
      state.entries = [];
    },

    // Günlük hedefleri güncelleme
    updateGoals: (state, action: PayloadAction<Partial<DailyGoals>>) => {
      state.goals = { ...state.goals, ...action.payload };
    },

    // Yemek kayıtlarını set etme (ör. depolamadan yükleme)
    setFoodEntries: (state, action: PayloadAction<FoodEntry[]>) => {
      state.entries = action.payload;
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
  addFoodEntry,
  removeFoodEntry,
  updateFoodEntry,
  clearFoodEntries,
  updateGoals,
  setFoodEntries,
  setLoading,
  setError,
} = foodTrackerSlice.actions;

export default foodTrackerSlice.reducer;
