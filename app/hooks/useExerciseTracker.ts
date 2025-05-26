import { useAppDispatch, useAppSelector } from '../store';
import { type RootState } from '../store';
import {
  Exercise,
  WorkoutSession,
  WorkoutPlan,
  ExerciseGoals,
  WorkoutSessionExercise,
  addExercise,
  updateExercise,
  removeExercise as deleteExercise,
  addWorkoutSession,
  updateWorkoutSession,
  removeWorkoutSession as deleteWorkoutSession,
  addWorkoutPlan,
  updateWorkoutPlan,
  removeWorkoutPlan as deleteWorkoutPlan,
  updateGoals,
  setExercises,
  setWorkoutSessions,
  setWorkoutPlans,
} from '../store/exerciseTrackerSlice';
import { useCallback, useMemo } from 'react';

// UUID oluşturucu
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// WorkoutExercise tipi
export interface WorkoutExercise {
  exerciseId: string;
  exerciseName: string;
  duration: number;
  caloriesBurned: number;
  sets?: number;
  reps?: number;
  weight?: number;
}

export const useExerciseTracker = () => {
  const dispatch = useAppDispatch();
  const { exercises, workoutSessions, workoutPlans, goals, loading, error } = useAppSelector(
    (state: RootState) => state.exerciseTracker,
  );

  // Exercise management
  const createExercise = useCallback(
    (exercise: Omit<Exercise, 'id'>) => {
      const newExercise: Exercise = {
        ...exercise,
        id: generateUUID(),
      };
      dispatch(addExercise(newExercise));
      return newExercise;
    },
    [dispatch],
  );

  const modifyExercise = useCallback(
    (exercise: Exercise) => {
      dispatch(updateExercise(exercise));
    },
    [dispatch],
  );

  const removeExercise = useCallback(
    (exerciseId: string) => {
      dispatch(deleteExercise(exerciseId));
    },
    [dispatch],
  );

  // Workout session management
  const startWorkoutSession = useCallback(
    (exercises: WorkoutExercise[] = []): WorkoutSession => {
      const totalCaloriesBurned = exercises.reduce((sum, ex) => sum + ex.caloriesBurned, 0);
      const totalDuration = exercises.reduce((sum, ex) => sum + ex.duration, 0);

      const newSession: WorkoutSession = {
        id: generateUUID(),
        name: `Antrenman ${workoutSessions.length + 1}`,
        date: new Date().toISOString(),
        exercises: exercises.map(ex => ({
          exerciseId: ex.exerciseId,
          exerciseName: ex.exerciseName,
          duration: ex.duration,
          caloriesBurned: ex.caloriesBurned,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
        })),
        completed: true,
        totalDuration,
        totalCaloriesBurned,
        notes: '',
      };

      dispatch(addWorkoutSession(newSession));
      return newSession;
    },
    [dispatch, workoutSessions.length],
  );

  const updateSession = useCallback(
    (session: WorkoutSession) => {
      // Toplam değerleri hesapla
      const totalCaloriesBurned = session.exercises.reduce(
        (sum: number, ex: WorkoutSessionExercise) => {
          return sum + (ex.caloriesBurned || 0);
        },
        0,
      );

      const totalDuration = session.exercises.reduce((sum: number, ex: WorkoutSessionExercise) => {
        return sum + (ex.duration || 0);
      }, 0);

      const updatedSession: WorkoutSession = {
        ...session,
        totalDuration,
        totalCaloriesBurned,
      };

      dispatch(updateWorkoutSession(updatedSession));
      return updatedSession;
    },
    [dispatch],
  );

  const removeSession = useCallback(
    (sessionId: string) => {
      dispatch(deleteWorkoutSession(sessionId));
    },
    [dispatch],
  );

  // Add exercise to session
  const addExerciseToSession = useCallback(
    (
      sessionId: string,
      exercise: Omit<WorkoutExercise, 'caloriesBurned'> & { caloriesPerMinute: number },
    ) => {
      const session = workoutSessions.find((s: WorkoutSession) => s.id === sessionId);
      if (!session) return null;

      const caloriesBurned = exercise.duration * exercise.caloriesPerMinute;
      const workoutExercise: WorkoutSessionExercise = {
        exerciseId: exercise.exerciseId,
        exerciseName: exercise.exerciseName,
        duration: exercise.duration,
        caloriesBurned,
        sets: exercise.sets,
        reps: exercise.reps,
        weight: exercise.weight,
      };

      const updatedExercises = [...session.exercises, workoutExercise];
      return updateSession({
        ...session,
        exercises: updatedExercises,
      });
    },
    [workoutSessions, updateSession],
  );

  // Remove exercise from session
  const removeExerciseFromSession = useCallback(
    (sessionId: string, exerciseIndex: number) => {
      const session = workoutSessions.find((s: WorkoutSession) => s.id === sessionId);
      if (!session) return null;

      const updatedExercises = session.exercises.filter(
        (_: WorkoutSessionExercise, index: number) => index !== exerciseIndex,
      );
      return updateSession({
        ...session,
        exercises: updatedExercises,
      });
    },
    [workoutSessions, updateSession],
  );

  // Workout plan management
  const createWorkoutPlan = useCallback(
    (plan: Omit<WorkoutPlan, 'id'>): WorkoutPlan => {
      const newPlan: WorkoutPlan = {
        ...plan,
        id: generateUUID(),
      };
      dispatch(addWorkoutPlan(newPlan));
      return newPlan;
    },
    [dispatch],
  );

  const modifyWorkoutPlan = useCallback(
    (plan: WorkoutPlan) => {
      dispatch(updateWorkoutPlan(plan));
    },
    [dispatch],
  );

  const removeWorkoutPlan = useCallback(
    (planId: string) => {
      dispatch(deleteWorkoutPlan(planId));
    },
    [dispatch],
  );

  // Goals management
  const updateExerciseGoals = useCallback(
    (newGoals: Partial<ExerciseGoals>) => {
      dispatch(
        updateGoals({
          ...goals,
          ...newGoals,
        }),
      );
    },
    [dispatch, goals],
  );

  // Stats calculations
  const getWeeklyStats = useCallback(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekSessions = workoutSessions.filter(
      (session: WorkoutSession) =>
        new Date(session.date) >= oneWeekAgo && new Date(session.date) <= now,
    );

    const totalDuration = thisWeekSessions.reduce((sum, session) => sum + session.totalDuration, 0);
    const totalCaloriesBurned = thisWeekSessions.reduce(
      (sum, session) => sum + session.totalCaloriesBurned,
      0,
    );
    const exerciseCount = thisWeekSessions.reduce(
      (sum, session) => sum + session.exercises.length,
      0,
    );
    const sessionsCount = thisWeekSessions.length;

    // Haftanın günlerine göre istatistikler
    const daysOfWeek = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    const dailyStats = daysOfWeek.map((day, index) => {
      const sessionsOnDay = thisWeekSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getDay() === index;
      });

      const duration = sessionsOnDay.reduce((sum, session) => sum + session.totalDuration, 0);
      const calories = sessionsOnDay.reduce((sum, session) => sum + session.totalCaloriesBurned, 0);

      return {
        day,
        duration,
        calories,
        sessions: sessionsOnDay.length,
      };
    });

    return {
      totalDuration,
      totalCaloriesBurned,
      exerciseCount,
      sessionsCount,
      dailyStats,
    };
  }, [workoutSessions]);

  const getMonthlyStats = useCallback(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthSessions = workoutSessions.filter(
      (session: WorkoutSession) =>
        new Date(session.date) >= firstDayOfMonth && new Date(session.date) <= now,
    );

    const totalDuration = thisMonthSessions.reduce(
      (sum, session) => sum + session.totalDuration,
      0,
    );
    const totalCaloriesBurned = thisMonthSessions.reduce(
      (sum, session) => sum + session.totalCaloriesBurned,
      0,
    );
    const exerciseCount = thisMonthSessions.reduce(
      (sum, session) => sum + session.exercises.length,
      0,
    );
    const sessionsCount = thisMonthSessions.length;

    // Egzersiz kategorilerine göre dağılım
    const categoryCounts: Record<string, number> = {};
    thisMonthSessions.forEach(session => {
      session.exercises.forEach(exercise => {
        const exerciseObj = exercises.find(ex => ex.id === exercise.exerciseId);
        if (exerciseObj && exerciseObj.category) {
          const category = exerciseObj.category;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
      });
    });

    return {
      totalDuration,
      totalCaloriesBurned,
      exerciseCount,
      sessionsCount,
      categoryCounts,
    };
  }, [workoutSessions, exercises]);

  // Egzersizleri kategorilere göre filtrele
  const getExercisesByCategory = useCallback(
    (category: string) => {
      return exercises.filter(exercise => exercise.category === category);
    },
    [exercises],
  );

  // En çok kullanılan egzersizler
  const getMostUsedExercises = useCallback(
    (limit: number = 5) => {
      const exerciseCounts: Record<string, { id: string; name: string; count: number }> = {};

      workoutSessions.forEach(session => {
        session.exercises.forEach(exercise => {
          if (!exerciseCounts[exercise.exerciseId]) {
            exerciseCounts[exercise.exerciseId] = {
              id: exercise.exerciseId,
              name: exercise.exerciseName || 'Unknown Exercise',
              count: 0,
            };
          }
          exerciseCounts[exercise.exerciseId].count++;
        });
      });

      return Object.values(exerciseCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    },
    [workoutSessions],
  );

  // Programları güncelle
  const importExercises = useCallback(
    (newExercises: Exercise[]) => {
      dispatch(setExercises(newExercises));
    },
    [dispatch],
  );

  const importWorkoutSessions = useCallback(
    (newSessions: WorkoutSession[]) => {
      dispatch(setWorkoutSessions(newSessions));
    },
    [dispatch],
  );

  const importWorkoutPlans = useCallback(
    (newPlans: WorkoutPlan[]) => {
      dispatch(setWorkoutPlans(newPlans));
    },
    [dispatch],
  );

  // Performans için useMemo ile tüm metodları expose et
  return useMemo(
    () => ({
      // State
      exercises,
      workoutSessions,
      workoutPlans,
      goals,
      loading,
      error,

      // Egzersiz yönetimi
      createExercise,
      modifyExercise,
      removeExercise,

      // Antrenman seansı yönetimi
      startWorkoutSession,
      updateSession,
      removeSession,
      addExerciseToSession,
      removeExerciseFromSession,

      // Antrenman programı yönetimi
      createWorkoutPlan,
      modifyWorkoutPlan,
      removeWorkoutPlan,

      // Hedefler
      updateExerciseGoals,

      // İstatistikler
      getWeeklyStats,
      getMonthlyStats,
      getExercisesByCategory,
      getMostUsedExercises,

      // Veri işlemleri
      importExercises,
      importWorkoutSessions,
      importWorkoutPlans,
    }),
    [
      exercises,
      workoutSessions,
      workoutPlans,
      goals,
      loading,
      error,
      createExercise,
      modifyExercise,
      removeExercise,
      startWorkoutSession,
      updateSession,
      removeSession,
      addExerciseToSession,
      removeExerciseFromSession,
      createWorkoutPlan,
      modifyWorkoutPlan,
      removeWorkoutPlan,
      updateExerciseGoals,
      getWeeklyStats,
      getMonthlyStats,
      getExercisesByCategory,
      getMostUsedExercises,
      importExercises,
      importWorkoutSessions,
      importWorkoutPlans,
    ],
  );
};
