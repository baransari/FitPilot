import { ViewStyle, TextStyle, ImageStyle } from 'react-native';
import { ThemeMode, ThemeType, CustomTheme } from '../theme';
// Removing the conflicting import since StylesType is defined in this file
// import { StylesType } from './styles';
import type { MD3Theme } from 'react-native-paper/lib/typescript/types';

/**
 * Temel React Native ve React Native Paper tipleri
 */
export type { ViewStyle, TextStyle, ImageStyle } from 'react-native';
export type { MD3Theme } from 'react-native-paper/lib/typescript/types';
export type { ThemeMode, ThemeType, CustomTheme };

// ExtendedMD3Theme tipini CustomTheme'den üretiyoruz
export type ExtendedMD3Theme = MD3Theme & Omit<CustomTheme, keyof MD3Theme>;

/**
 * Kullanıcı tipi - Uygulama kullanıcısının verilerini tanımlar
 */
export type User = {
  id: string;
  name: string;
  email: string;

  // Fiziksel ölçüler
  weight?: number;
  height?: number;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

  // Hedefler
  goals?: {
    weight: number;
    steps: number;
    water: number;
    sleep: number;
    calories: number;
  };

  // İzleme verileri
  streak: number;
  steps: number;
  calories: number;
  waterIntake: number;
  sleepHours: number;
  completedWorkouts: number;
  totalWorkouts: number;

  // Kişisel ayarlar
  profilePhoto?: string | null;
  stepsGoal: number;
  caloriesGoal: number;
  sleepGoal: number;
  waterGoal: number;
  notificationsEnabled?: boolean;
  darkModeEnabled?: boolean;
  dataSync?: boolean;
  metricUnits?: boolean;
  language?: 'tr' | 'en';
};

/**
 * Stil tipi - Bileşen stillerini tanımlar
 */
export type StylesType = {
  [key: string]: ViewStyle | TextStyle | ImageStyle;
};

/**
 * Bileşen Props Tipleri
 */

/**
 * İstatistik Kartı Props - Ana ekrandaki istatistik kartları için
 */
export type StatsCardProps = {
  backgroundColor: string;
  iconBackgroundColor: string;
  icon: any; // Consider using a more specific type for icons
  value: string | number;
  label: string;
  progress: number;
  onPress?: () => void;
  showDetails?: boolean;
};

/**
 * Antrenman İlerleme Kartı Props
 */
export type WorkoutProgressCardProps = {
  completedWorkouts: number;
  totalWorkouts: number;
  primaryColor: string;
  onPress: () => void;
};

/**
 * Beslenme Kartı Props
 */
export type NutritionCardProps = {
  calories: number;
  caloriesGoal: number;
  primaryColor: string;
  onPress: () => void;
};

/**
 * Veri Tipleri
 */

/**
 * Beslenme Hedefleri
 */
export type NutritionGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
};

/**
 * Yemek Kaydı
 */
export type FoodEntry = {
  id: string;
  name: string;
  amount: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  };
  date: string;
  timestamp?: string;
  imageUrl?: string;
};

/**
 * Uyku Verisi
 */
export type SleepData = {
  id: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  notes?: string;
  deepSleepPercentage?: number;
  remSleepPercentage?: number;
};

/**
 * Antrenman Verisi
 */
export type WorkoutData = {
  id: string;
  name: string;
  duration: number;
  caloriesBurned: number;
  completed: boolean;
  date: Date;
  exercises?: {
    id: string;
    name: string;
    sets?: number;
    reps?: number;
    weight?: number;
    duration?: number;
  }[];
};

/**
 * Context Tipleri
 */

/**
 * Kullanıcı Context Tipi
 */
export type UserContextType = {
  user: User | null;
  setUser: (user: User) => void;
  loading: boolean;
  error: string | null;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout?: () => Promise<void>;
};

/**
 * Tema Context Tipi
 */
export type ThemeContextType = {
  isDarkMode: boolean;
  toggleTheme: () => void;
  theme: ExtendedMD3Theme;
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
};
