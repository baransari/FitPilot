import { configureStore, combineReducers, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  PersistConfig,
} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './authSlice';
import waterTrackerReducer from './waterTrackerSlice';
import foodTrackerReducer from './foodTrackerSlice';
import exerciseTrackerReducer from './exerciseTrackerSlice';
import stepTrackerReducer from './stepTrackerSlice';
import sleepTrackerReducer from './sleepTrackerSlice';

// Root reducer tanımı - tip çıkarımı için
const rootReducer = combineReducers({
  auth: authReducer,
  waterTracker: waterTrackerReducer,
  foodTracker: foodTrackerReducer,
  exerciseTracker: exerciseTrackerReducer,
  stepTracker: stepTrackerReducer,
  sleepTracker: sleepTrackerReducer,
});

// Root state tipi - tüm diğer tiplerin temeli
export type RootState = ReturnType<typeof rootReducer>;

// Ortam değişkenleri için tip tanımı
declare const process: {
  env: {
    NODE_ENV: 'production' | 'development' | 'test';
  };
};

// Redux persist yapılandırması - döngüsel bağımlılık olmadan
const persistConfig: PersistConfig<RootState> = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: [
    'auth',
    'waterTracker',
    'foodTracker',
    'exerciseTracker',
    'stepTracker',
    'sleepTracker',
  ],
  // Daha hızlı başlangıç için
  timeout: 10000, // 10 saniye
};

// Persist reducer oluşturma
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Store yapılandırması
const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      // Büyük durum ağaçları için performans iyileştirmesi
      immutableCheck: { warnAfter: 300 },
      serializableCheck: { 
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        warnAfter: 300,
      },
    }),
  // Geliştirici araçları sadece geliştirme ortamında etkinleştir
  devTools: process.env.NODE_ENV !== 'production',
});

// Redux persistor
export const persistor = persistStore(store);

// Uygulamadaki temel tip tanımları
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Typed hooks - type güvenliği için
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Varsayılan export
export default store;
