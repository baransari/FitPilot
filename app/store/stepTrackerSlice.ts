import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppDispatch, RootState } from './index';

// Storage anahtarları
export const STORAGE_KEYS = {
  DAILY_STEPS: '@HealthTrackAI:dailySteps',
  STEP_GOAL: '@HealthTrackAI:stepGoal',
  WEEKLY_STEPS: '@HealthTrackAI:weeklySteps'
};

// AppThunk tipi
export type AppThunk<ReturnType = void> = (
  dispatch: AppDispatch,
  getState: () => RootState
) => Promise<ReturnType>;

/**
 * Haftalık adım verisi tipi
 * Günlük adım kayıtlarını bir hafta için tutar
 */
export interface WeeklyStepData {
  date: string; // YYYY-MM-DD formatında tarih
  steps: number; // O güne ait toplam adım sayısı
}

/**
 * Adım takibi durum tipi
 * Kullanıcının adım verileri ve hedeflerini saklar
 */
interface StepTrackerState {
  dailySteps: number;           // Bugünkü adım sayısı
  stepGoal: number;             // Günlük adım hedefi
  weeklySteps?: WeeklyStepData[]; // Son 7 günün adım verileri (opsiyonel)
  isStepAvailable: boolean;     // Telefonda adım sayar varsa true
  loading: boolean;             // Yükleme durumu
  error: string | null;         // Hata mesajı
}

// Başlangıç durumu
const initialState: StepTrackerState = {
  dailySteps: 0,
  stepGoal: 10000,
  weeklySteps: [],
  isStepAvailable: false,
  loading: false,
  error: null,
};

// Adım takibi slice oluşturma
const stepTrackerSlice = createSlice({
  name: 'stepTracker',
  initialState,
  reducers: {
    // Günlük adım sayısını ayarla
    setDailySteps: (state, action: PayloadAction<number>) => {
      state.dailySteps = action.payload;
      
      // Haftalık verileri güncelle
      const today = new Date().toISOString().split('T')[0];
      
      if (!state.weeklySteps) {
        state.weeklySteps = [];
      }
      
      // Bugünkü veri var mı diye kontrol et
      const todayIndex = state.weeklySteps.findIndex(item => item.date === today);
      
      if (todayIndex >= 0) {
        // Bugünkü veriyi güncelle
        state.weeklySteps[todayIndex] = { 
          date: today, 
          steps: action.payload 
        };
      } else {
        // Yeni günün verisini ekle
        state.weeklySteps.push({ 
          date: today, 
          steps: action.payload 
        });
        
        // Sadece son 7 günü tut
        if (state.weeklySteps.length > 7) {
          state.weeklySteps = state.weeklySteps.slice(-7);
        }
      }
      
      // AsyncStorage'a kaydet
      const saveSteps = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.DAILY_STEPS, action.payload.toString());
          await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_STEPS, JSON.stringify(state.weeklySteps));
        } catch (error) {
          console.error('Adım verisi kaydedilirken hata oluştu:', error);
        }
      };
      
      saveSteps();
    },

    // Adım hedefini güncelle
    updateStepGoal: (state, action: PayloadAction<number>) => {
      state.stepGoal = action.payload;
      
      // AsyncStorage'a kaydet
      const saveGoal = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.STEP_GOAL, action.payload.toString());
        } catch (error) {
          console.error('Adım hedefi kaydedilirken hata oluştu:', error);
        }
      };
      
      saveGoal();
    },
    
    // Haftalık adım verilerini ayarla
    setWeeklySteps: (state, action: PayloadAction<WeeklyStepData[]>) => {
      state.weeklySteps = action.payload;
      
      // AsyncStorage'a kaydet
      const saveWeeklySteps = async () => {
        try {
          await AsyncStorage.setItem(STORAGE_KEYS.WEEKLY_STEPS, JSON.stringify(action.payload));
        } catch (error) {
          console.error('Haftalık adım verileri kaydedilirken hata oluştu:', error);
        }
      };
      
      saveWeeklySteps();
    },

    // Adım sayar erişilebilirliğini ayarla
    setIsStepAvailable: (state, action: PayloadAction<boolean>) => {
      state.isStepAvailable = action.payload;
    },

    // Yükleniyor durumunu güncelle
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (state.loading) {
        state.error = null;
      }
    },

    // Hata durumunu güncelle
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

// Action'ları dışa aktar
export const { 
  setDailySteps, 
  updateStepGoal, 
  setIsStepAvailable, 
  setLoading, 
  setError,
  setWeeklySteps 
} = stepTrackerSlice.actions;

export default stepTrackerSlice.reducer;

/**
 * Thunk ve yardımcı fonksiyonlar - Redux Store ve AsyncStorage koordinasyonu
 */

/**
 * AsyncStorage'dan adım verilerini yükle
 */
export const loadStepData = (): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Adım hedefini yükle
    const storedGoal = await AsyncStorage.getItem(STORAGE_KEYS.STEP_GOAL);
    if (storedGoal) {
      dispatch(updateStepGoal(parseInt(storedGoal, 10)));
    }
    
    // Günlük adım sayısını yükle
    const storedSteps = await AsyncStorage.getItem(STORAGE_KEYS.DAILY_STEPS);
    if (storedSteps) {
      dispatch(setDailySteps(parseInt(storedSteps, 10)));
    }
    
    // Haftalık adım verilerini yükle
    const storedWeeklySteps = await AsyncStorage.getItem(STORAGE_KEYS.WEEKLY_STEPS);
    if (storedWeeklySteps) {
      dispatch(setWeeklySteps(JSON.parse(storedWeeklySteps)));
    }
    
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Veri yüklenirken hata oluştu'));
    dispatch(setLoading(false));
  }
};

/**
 * Adım hedefini güncelle ve kaydet
 */
export const updateStepGoalWithStorage = (goal: number): AppThunk => async (dispatch) => {
  dispatch(updateStepGoal(goal));
  // updateStepGoal zaten AsyncStorage kaydetme işlemini içeriyor
};

/**
 * Adım sayısını artır
 */
export const incrementSteps = (stepsToAdd: number): AppThunk => async (dispatch, getState) => {
  const { dailySteps } = getState().stepTracker;
  const newSteps = dailySteps + stepsToAdd;
  dispatch(setDailySteps(newSteps));
  // setDailySteps zaten AsyncStorage kaydetme işlemini içeriyor
};

/**
 * Bugünkü adımların ilerleme yüzdesini hesapla
 */
export const calculateStepPercentage = (steps: number, goal: number): number => {
  if (!goal) return 0;
  return Math.min(Math.round((steps / goal) * 100), 100);
};

/**
 * Haftalık adım istatistiklerini hesapla
 */
export const calculateWeeklyStats = (weeklySteps: WeeklyStepData[] = []) => {
  if (!weeklySteps.length) return { totalSteps: 0, averageDailySteps: 0, maxSteps: 0, goalReachedDays: 0 };
  
  const totalSteps = weeklySteps.reduce((sum, day) => sum + day.steps, 0);
  const averageDailySteps = Math.round(totalSteps / weeklySteps.length);
  const maxSteps = Math.max(...weeklySteps.map(day => day.steps));
  
  return {
    totalSteps,
    averageDailySteps,
    maxSteps
  };
};
