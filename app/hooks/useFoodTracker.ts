import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector, RootState } from '../store';
import {
  addFoodEntry,
  removeFoodEntry,
  updateFoodEntry,
  clearFoodEntries,
  updateGoals,
  setFoodEntries,
  FoodEntry,
  DailyGoals,
  Nutrition,
} from '../store/foodTrackerSlice';
import StorageService from '../services/StorageService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Yemek takibi hook'u
export default function useFoodTracker() {
  const dispatch = useAppDispatch();

  // Redux state'inden yemek takip verilerini çekme
  const { entries, goals, loading, error } = useAppSelector((state: RootState) => state.foodTracker);

  // Component mount olduğunda AsyncStorage'dan verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        // Yemek kayıtlarını yükle
        const storedEntries = await AsyncStorage.getItem('@HealthTrackAI:foodEntries');
        if (storedEntries) {
          dispatch(setFoodEntries(JSON.parse(storedEntries)));
        }

        // Besin hedeflerini yükle
        const storedGoals = await AsyncStorage.getItem('@HealthTrackAI:nutritionGoals');
        if (storedGoals) {
          dispatch(updateGoals(JSON.parse(storedGoals)));
        }
      } catch (error) {
        console.error('Veri yüklenirken hata oluştu:', error);
      }
    };

    loadData();
  }, [dispatch]);

  // Bugünün kayıtlarını filtrele
  const getTodayEntries = (): FoodEntry[] => {
    const today = new Date().toISOString().split('T')[0];
    return entries.filter(entry => entry.timestamp.startsWith(today));
  };

  // Yemek kaydı ekleme
  const addFood = async (food: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    // Create a unique ID using timestamp + random string to avoid collisions
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    const newEntry = {
      ...food,
      id: uniqueId,
      timestamp: new Date().toISOString(),
    };

    dispatch(addFoodEntry(newEntry));

    try {
      // Mevcut kayıtları al ve güncelle
      const storedEntries = await AsyncStorage.getItem('@HealthTrackAI:foodEntries');
      const updatedEntries = storedEntries ? [...JSON.parse(storedEntries), newEntry] : [newEntry];

      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('@HealthTrackAI:foodEntries', JSON.stringify(updatedEntries));
    } catch (error) {
      console.error('Yemek kaydı eklenirken hata oluştu:', error);
    }
  };

  // Yemek kaydı silme
  const removeFood = async (id: string) => {
    dispatch(removeFoodEntry(id));

    try {
      // Mevcut kayıtları al ve güncelle
      const storedEntries = await AsyncStorage.getItem('@HealthTrackAI:foodEntries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        const updatedEntries = entries.filter((entry: FoodEntry) => entry.id !== id);

        // AsyncStorage'a kaydet
        await AsyncStorage.setItem('@HealthTrackAI:foodEntries', JSON.stringify(updatedEntries));
      }
    } catch (error) {
      console.error('Yemek kaydı silinirken hata oluştu:', error);
    }
  };

  // Yemek kaydı güncelleme
  const updateFood = async (id: string, entry: Partial<FoodEntry>) => {
    dispatch(updateFoodEntry({ id, entry }));

    try {
      // Mevcut kayıtları al ve güncelle
      const storedEntries = await AsyncStorage.getItem('@HealthTrackAI:foodEntries');
      if (storedEntries) {
        const entries = JSON.parse(storedEntries);
        const updatedEntries = entries.map((item: FoodEntry) =>
          item.id === id ? { ...item, ...entry } : item,
        );

        // AsyncStorage'a kaydet
        await AsyncStorage.setItem('@HealthTrackAI:foodEntries', JSON.stringify(updatedEntries));
      }
    } catch (error) {
      console.error('Yemek kaydı güncellenirken hata oluştu:', error);
    }
  };

  // Günlük besin değerleri toplamını hesaplama
  const calculateDailyNutrition = (): Nutrition => {
    const todayEntries = getTodayEntries();

    return todayEntries.reduce(
      (total, entry) => {
        return {
          calories: total.calories + entry.nutrition.calories,
          protein: total.protein + entry.nutrition.protein,
          carbs: total.carbs + entry.nutrition.carbs,
          fat: total.fat + entry.nutrition.fat,
          fiber: (total.fiber || 0) + (entry.nutrition.fiber || 0),
          sugar: (total.sugar || 0) + (entry.nutrition.sugar || 0),
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
    );
  };

  // Günlük hedefleri güncelleme
  const updateNutritionGoals = async (newGoals: Partial<DailyGoals>) => {
    const updatedGoals = { ...goals, ...newGoals };
    dispatch(updateGoals(newGoals));

    try {
      // AsyncStorage'a kaydet
      await AsyncStorage.setItem('@HealthTrackAI:nutritionGoals', JSON.stringify(updatedGoals));
    } catch (error) {
      console.error('Besin hedefleri güncellenirken hata oluştu:', error);
    }
  };

  // Öğün tipine göre kayıtları filtreleme
  const getEntriesByMealType = (
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
  ): FoodEntry[] => {
    return getTodayEntries().filter(entry => entry.mealType === mealType);
  };

  // Hedeflere göre yüzde hesaplama
  const getGoalPercentages = (): Record<keyof Nutrition, number> => {
    const dailyNutrition = calculateDailyNutrition();

    return {
      calories: Math.min((dailyNutrition.calories / goals.calories) * 100, 100),
      protein: Math.min((dailyNutrition.protein / goals.protein) * 100, 100),
      carbs: Math.min((dailyNutrition.carbs / goals.carbs) * 100, 100),
      fat: Math.min((dailyNutrition.fat / goals.fat) * 100, 100),
      fiber: dailyNutrition.fiber ? Math.min((dailyNutrition.fiber / 25) * 100, 100) : 0, // 25g varsayılan lif hedefi
      sugar: dailyNutrition.sugar ? Math.min((dailyNutrition.sugar / 50) * 100, 100) : 0, // 50g varsayılan şeker hedefi
    };
  };

  return {
    entries,
    todayEntries: getTodayEntries(),
    goals,
    loading,
    error,
    addFood,
    removeFood,
    updateFood,
    dailyNutrition: calculateDailyNutrition(),
    goalPercentages: getGoalPercentages(),
    updateNutritionGoals,
    getEntriesByMealType,
  };
}
