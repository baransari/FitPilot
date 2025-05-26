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
  EXERCISES: '@HealthTrackAI:exercises',
  WORKOUT_SESSIONS: '@HealthTrackAI:workoutSessions',
  WORKOUT_PLANS: '@HealthTrackAI:workoutPlans',
  EXERCISE_GOALS: '@HealthTrackAI:exerciseGoals'
};

/**
 * Egzersiz tanımı
 * @property id - Benzersiz tanımlayıcı
 * @property name - Egzersiz adı
 * @property category - Egzersiz kategorisi (örn. "cardio", "strength")
 * @property caloriesBurnedPerMinute - Dakika başına yakılan kalori
 * @property description - Opsiyonel egzersiz açıklaması
 */
export interface Exercise {
  id: string;
  name: string;
  category: string;
  caloriesBurnedPerMinute: number;
  description?: string;
}

/**
 * Workout seansında yapılan bir egzersiz
 * Temel egzersizin bir örneğidir ve gerçek kullanımla ilgili verileri içerir
 */
export interface WorkoutSessionExercise {
  exerciseId: string;
  exerciseName?: string;
  duration: number; // dakika cinsinden
  sets?: number;
  reps?: number;
  weight?: number;
  caloriesBurned?: number;
}

/**
 * Workout seansı - kullanıcının tamamladığı bir egzersiz grubu
 */
export interface WorkoutSession {
  id: string;
  name: string;
  date: string; // ISO formatında tarih
  exercises: WorkoutSessionExercise[];
  notes?: string;
  completed: boolean;
  totalDuration: number;
  totalCaloriesBurned: number;
}

/**
 * Workout planı - önerilen egzersizler grubu
 */
export interface WorkoutPlan {
  id: string;
  name: string;
  description?: string;
  exercises: {
    exerciseId: string;
    recommendedDuration?: number;
    recommendedSets?: number;
    recommendedReps?: number;
    recommendedWeight?: number;
  }[];
  frequency?: string; // Örn. "daily", "3 times a week"
}

/**
 * Egzersiz hedefleri
 */
export interface ExerciseGoals {
  weeklyWorkouts: number;
  weeklyMinutes: number;
  weeklyCaloriesBurn: number;
}

/**
 * Egzersiz takibi için state arayüzü
 */
interface ExerciseTrackerState {
  exercises: Exercise[];
  workoutSessions: WorkoutSession[];
  workoutPlans: WorkoutPlan[];
  goals: ExerciseGoals;
  loading: boolean;
  error: string | null;
}

// Başlangıç durumu
const initialState: ExerciseTrackerState = {
  exercises: [],
  workoutSessions: [],
  workoutPlans: [],
  goals: {
    weeklyWorkouts: 3,
    weeklyMinutes: 150,
    weeklyCaloriesBurn: 1000,
  },
  loading: false,
  error: null,
};

// Thunk actions
export const saveExercisesToStorage = (exercises: Exercise[]): AppThunk => async (dispatch) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(exercises));
  } catch (error) {
    console.error('Exercises kaydedilirken hata oluştu:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Veri kaydedilirken hata oluştu'));
  }
};

export const saveWorkoutSessionsToStorage = (sessions: WorkoutSession[]): AppThunk => async (dispatch) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_SESSIONS, JSON.stringify(sessions));
  } catch (error) {
    console.error('Workout sessions kaydedilirken hata oluştu:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Veri kaydedilirken hata oluştu'));
  }
};

export const saveWorkoutPlansToStorage = (plans: WorkoutPlan[]): AppThunk => async (dispatch) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.WORKOUT_PLANS, JSON.stringify(plans));
  } catch (error) {
    console.error('Workout plans kaydedilirken hata oluştu:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Veri kaydedilirken hata oluştu'));
  }
};

export const saveExerciseGoalsToStorage = (goals: ExerciseGoals): AppThunk => async (dispatch) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EXERCISE_GOALS, JSON.stringify(goals));
  } catch (error) {
    console.error('Exercise goals kaydedilirken hata oluştu:', error);
    dispatch(setError(error instanceof Error ? error.message : 'Veri kaydedilirken hata oluştu'));
  }
};

export const loadExerciseData = (): AppThunk => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    
    // Egzersizleri yükle
    const storedExercises = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISES);
    if (storedExercises) {
      dispatch(setExercises(JSON.parse(storedExercises)));
    }
    
    // Workout seanslarını yükle
    const storedSessions = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_SESSIONS);
    if (storedSessions) {
      dispatch(setWorkoutSessions(JSON.parse(storedSessions)));
    }
    
    // Workout planlarını yükle
    const storedPlans = await AsyncStorage.getItem(STORAGE_KEYS.WORKOUT_PLANS);
    if (storedPlans) {
      dispatch(setWorkoutPlans(JSON.parse(storedPlans)));
    }
    
    // Hedefleri yükle
    const storedGoals = await AsyncStorage.getItem(STORAGE_KEYS.EXERCISE_GOALS);
    if (storedGoals) {
      dispatch(updateGoals(JSON.parse(storedGoals)));
    }
    
    dispatch(setLoading(false));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'Veri yüklenirken hata oluştu'));
    dispatch(setLoading(false));
  }
};

// Egzersiz ekleme ve StorageAPI'ye kaydetme fonksiyonu
export const addExerciseWithStorage = (exercise: Exercise): AppThunk => async (dispatch, getState) => {
  dispatch(addExercise(exercise));
  await dispatch(saveExercisesToStorage(getState().exerciseTracker.exercises));
};

// Egzersiz güncelleme ve StorageAPI'ye kaydetme fonksiyonu
export const updateExerciseWithStorage = (exercise: Exercise): AppThunk => async (dispatch, getState) => {
  dispatch(updateExercise(exercise));
  await dispatch(saveExercisesToStorage(getState().exerciseTracker.exercises));
};

// Egzersiz silme ve StorageAPI'yi güncelleme fonksiyonu
export const removeExerciseWithStorage = (exerciseId: string): AppThunk => async (dispatch, getState) => {
  dispatch(removeExercise(exerciseId));
  await dispatch(saveExercisesToStorage(getState().exerciseTracker.exercises));
};

// Workout session ekleme ve StorageAPI'ye kaydetme fonksiyonu
export const addWorkoutSessionWithStorage = (session: WorkoutSession): AppThunk => async (dispatch, getState) => {
  dispatch(addWorkoutSession(session));
  await dispatch(saveWorkoutSessionsToStorage(getState().exerciseTracker.workoutSessions));
};

// Workout session güncelleme ve StorageAPI'ye kaydetme fonksiyonu
export const updateWorkoutSessionWithStorage = (session: WorkoutSession): AppThunk => async (dispatch, getState) => {
  dispatch(updateWorkoutSession(session));
  await dispatch(saveWorkoutSessionsToStorage(getState().exerciseTracker.workoutSessions));
};

// Workout session silme ve StorageAPI'yi güncelleme fonksiyonu
export const removeWorkoutSessionWithStorage = (sessionId: string): AppThunk => async (dispatch, getState) => {
  dispatch(removeWorkoutSession(sessionId));
  await dispatch(saveWorkoutSessionsToStorage(getState().exerciseTracker.workoutSessions));
};

// Workout plan ekleme ve StorageAPI'ye kaydetme fonksiyonu
export const addWorkoutPlanWithStorage = (plan: WorkoutPlan): AppThunk => async (dispatch, getState) => {
  dispatch(addWorkoutPlan(plan));
  await dispatch(saveWorkoutPlansToStorage(getState().exerciseTracker.workoutPlans));
};

// Workout plan güncelleme ve StorageAPI'ye kaydetme fonksiyonu
export const updateWorkoutPlanWithStorage = (plan: WorkoutPlan): AppThunk => async (dispatch, getState) => {
  dispatch(updateWorkoutPlan(plan));
  await dispatch(saveWorkoutPlansToStorage(getState().exerciseTracker.workoutPlans));
};

// Workout plan silme ve StorageAPI'yi güncelleme fonksiyonu
export const removeWorkoutPlanWithStorage = (planId: string): AppThunk => async (dispatch, getState) => {
  dispatch(removeWorkoutPlan(planId));
  await dispatch(saveWorkoutPlansToStorage(getState().exerciseTracker.workoutPlans));
};

// Egzersiz hedeflerini güncelleme ve StorageAPI'ye kaydetme fonksiyonu
export const updateGoalsWithStorage = (goals: ExerciseGoals): AppThunk => async (dispatch) => {
  dispatch(updateGoals(goals));
  await dispatch(saveExerciseGoalsToStorage(goals));
};

const exerciseTrackerSlice = createSlice({
  name: 'exerciseTracker',
  initialState,
  reducers: {
    // Exercise reducers
    addExercise: (state, action: PayloadAction<Exercise>) => {
      state.exercises.push(action.payload);
    },
    updateExercise: (state, action: PayloadAction<Exercise>) => {
      const index = state.exercises.findIndex(exercise => exercise.id === action.payload.id);
      if (index !== -1) {
        state.exercises[index] = action.payload;
      }
    },
    removeExercise: (state, action: PayloadAction<string>) => {
      state.exercises = state.exercises.filter(exercise => exercise.id !== action.payload);
    },
    setExercises: (state, action: PayloadAction<Exercise[]>) => {
      state.exercises = action.payload;
    },

    // Workout session reducers
    addWorkoutSession: (state, action: PayloadAction<WorkoutSession>) => {
      state.workoutSessions.push(action.payload);
    },
    updateWorkoutSession: (state, action: PayloadAction<WorkoutSession>) => {
      const index = state.workoutSessions.findIndex(session => session.id === action.payload.id);
      if (index !== -1) {
        state.workoutSessions[index] = action.payload;
      }
    },
    removeWorkoutSession: (state, action: PayloadAction<string>) => {
      state.workoutSessions = state.workoutSessions.filter(
        session => session.id !== action.payload,
      );
    },
    setWorkoutSessions: (state, action: PayloadAction<WorkoutSession[]>) => {
      state.workoutSessions = action.payload;
    },

    // Workout plan reducers
    addWorkoutPlan: (state, action: PayloadAction<WorkoutPlan>) => {
      state.workoutPlans.push(action.payload);
    },
    updateWorkoutPlan: (state, action: PayloadAction<WorkoutPlan>) => {
      const index = state.workoutPlans.findIndex(plan => plan.id === action.payload.id);
      if (index !== -1) {
        state.workoutPlans[index] = action.payload;
      }
    },
    removeWorkoutPlan: (state, action: PayloadAction<string>) => {
      state.workoutPlans = state.workoutPlans.filter(plan => plan.id !== action.payload);
    },
    setWorkoutPlans: (state, action: PayloadAction<WorkoutPlan[]>) => {
      state.workoutPlans = action.payload;
    },

    // Goals reducers
    updateGoals: (state, action: PayloadAction<ExerciseGoals>) => {
      state.goals = action.payload;
    },

    // Loading and error state reducers
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  addExercise,
  updateExercise,
  removeExercise,
  setExercises,
  addWorkoutSession,
  updateWorkoutSession,
  removeWorkoutSession,
  setWorkoutSessions,
  addWorkoutPlan,
  updateWorkoutPlan,
  removeWorkoutPlan,
  setWorkoutPlans,
  updateGoals,
  setLoading,
  setError,
} = exerciseTrackerSlice.actions;

export default exerciseTrackerSlice.reducer;
