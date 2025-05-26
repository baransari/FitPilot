import { useCallback, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { RootState } from '../store';
import {
  setWaterGoal,
  addWaterEntry,
  removeWaterEntry,
  clearWaterEntries,
  WaterEntry,
  setWaterEntries,
} from '../store/waterTrackerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Depolama anahtarları
const STORAGE_KEYS = {
  WATER_GOAL: '@HealthTrackAI:waterGoal',
  WATER_ENTRIES: '@HealthTrackAI:waterEntries',
};

// Varsayılan su hedefi (ml cinsinden)
const DEFAULT_WATER_GOAL = 2500;

// Su takipçisi hook'u
export default function useWaterTracker() {
  const dispatch = useAppDispatch();

  // Redux state'inden su takip verilerini çekme
  const { goal, entries } = useAppSelector((state) => state.waterTracker);

  // Component mount olduğunda veriyi yükle
  useEffect(() => {
    const loadWaterData = async () => {
      try {
        // Su hedefini yükle
        const savedGoal = await AsyncStorage.getItem(STORAGE_KEYS.WATER_GOAL);
        if (savedGoal) {
          dispatch(setWaterGoal(parseInt(savedGoal, 10)));
        }

        // Su kayıtlarını yükle
        const savedEntries = await AsyncStorage.getItem(STORAGE_KEYS.WATER_ENTRIES);
        if (savedEntries) {
          dispatch(setWaterEntries(JSON.parse(savedEntries)));
        }
      } catch (error) {
        console.error('Su verileri yüklenirken hata:', error);
      }
    };

    loadWaterData();
  }, [dispatch]);

  // Su hedefini güncelleme
  const updateWaterGoal = useCallback(
    async (newGoal: number) => {
      dispatch(setWaterGoal(newGoal));
      // AsyncStorage'a kaydetme
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.WATER_GOAL, newGoal.toString());
      } catch (error) {
        console.error('Su hedefi kaydedilirken hata:', error);
      }
    },
    [dispatch],
  );

  // Su ekleme
  const addWater = useCallback(
    async (amount: number) => {
      // Generate a more unique ID using timestamp + random string, ensuring no collisions
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const uniqueId = `water-entry-${timestamp}-${random}`;
      
      const newEntry = { 
        id: uniqueId, 
        amount, 
        timestamp: new Date().toISOString() 
      };
      dispatch(addWaterEntry(newEntry));
      
      // AsyncStorage'a kaydetme
      try {
        const savedEntries = await AsyncStorage.getItem(STORAGE_KEYS.WATER_ENTRIES);
        const allEntries = savedEntries ? [...JSON.parse(savedEntries), newEntry] : [newEntry];
        await AsyncStorage.setItem(STORAGE_KEYS.WATER_ENTRIES, JSON.stringify(allEntries));
      } catch (error) {
        console.error('Su kaydı eklenirken hata:', error);
      }
    },
    [dispatch],
  );

  // Su kaydı silme
  const removeEntry = useCallback(
    async (id: string) => {
      dispatch(removeWaterEntry(id));
      
      // AsyncStorage'dan silme
      try {
        const savedEntries = await AsyncStorage.getItem(STORAGE_KEYS.WATER_ENTRIES);
        if (savedEntries) {
          const allEntries = JSON.parse(savedEntries);
          const updatedEntries = allEntries.filter((entry: WaterEntry) => entry.id !== id);
          await AsyncStorage.setItem(STORAGE_KEYS.WATER_ENTRIES, JSON.stringify(updatedEntries));
        }
      } catch (error) {
        console.error('Su kaydı silinirken hata:', error);
      }
    },
    [dispatch],
  );

  // Tüm kayıtları temizleme
  const clearEntries = useCallback(async () => {
    dispatch(clearWaterEntries());
    
    // AsyncStorage'dan silme
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.WATER_ENTRIES);
    } catch (error) {
      console.error('Su kayıtları temizlenirken hata:', error);
    }
  }, [dispatch]);

  // Toplam alınan su miktarını hesaplama
  const calculateTotalIntake = useCallback((): number => {
    return entries.reduce((total: number, entry: WaterEntry) => total + entry.amount, 0);
  }, [entries]);

  // Bugünün toplam su alımını hesaplama
  const calculateTodayIntake = useCallback((): number => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD formatında bugünün tarihi
    const todayEntries = entries.filter(
      (entry: WaterEntry) => entry.timestamp && entry.timestamp.startsWith(today)
    );
    return todayEntries.reduce((total: number, entry: WaterEntry) => total + entry.amount, 0);
  }, [entries]);

  // Hedefin yüzde kaçının tamamlandığını hesaplama
  const calculatePercentage = useCallback((): number => {
    const total = calculateTodayIntake(); // Bugünün tüketimini kullanıyoruz
    const currentGoal = goal || DEFAULT_WATER_GOAL;
    const percentage = (total / currentGoal) * 100;
    return Math.min(Math.max(percentage, 0), 100); // 0-100 aralığında sınırla
  }, [calculateTodayIntake, goal]);

  return useMemo(
    () => ({
      waterGoal: goal || DEFAULT_WATER_GOAL,
      waterEntries: entries || [],
      updateWaterGoal,
      addWater,
      removeEntry,
      clearEntries,
      totalIntake: calculateTotalIntake(),
      todayIntake: calculateTodayIntake(),
      percentage: calculatePercentage(),
      
      // Belirli bir tarihteki su kayıtlarını getirme
      getEntriesByDate: (date: string) => {
        return entries.filter((entry: WaterEntry) => 
          entry.timestamp && entry.timestamp.startsWith(date)
        );
      },
      
      // Zaman aralığına göre su tüketimini hesaplama
      getIntakeByDateRange: (startDate: string, endDate: string) => {
        const filteredEntries = entries.filter((entry: WaterEntry) => {
          if (!entry.timestamp) return false;
          return entry.timestamp >= startDate && entry.timestamp <= endDate;
        });
        return filteredEntries.reduce((total: number, entry: WaterEntry) => total + entry.amount, 0);
      }
    }),
    [
      goal,
      entries,
      updateWaterGoal,
      addWater,
      removeEntry,
      clearEntries,
      calculateTotalIntake,
      calculateTodayIntake,
      calculatePercentage,
    ],
  );
}
