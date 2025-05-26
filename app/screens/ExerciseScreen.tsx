import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Alert, 
  useColorScheme,
  SafeAreaView,
  Image,
  Pressable,
  ViewStyle,
  Animated
} from 'react-native';
// Import from paperComponents utility
import {
  Card,
  Button,
  Divider,
  Chip,
  IconButton as PaperIconButton,
  Surface,
  ProgressBar
} from '../utils/paperComponents';
// FontAwesome ikonları
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faRunning,
  faDumbbell,
  faYinYang,
  faBalanceScale,
  faPlay,
  faPencil,
  faPlus,
  faXmark,
  faClock,
  faFire,
  faSignal,
  faCalendarDays,
  faEllipsisH,
  faHeartbeat,
  faStopwatch,
  faChartLine,
  faCheck,
  faTrash,
  faEdit,
  faCalendarAlt,
  faCalendarCheck,
} from '@fortawesome/free-solid-svg-icons';
import { useExerciseTracker, WorkoutExercise } from '../hooks/useExerciseTracker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import {
  WorkoutPlan,
  WorkoutSession as ReduxWorkoutSession,
  WorkoutSessionExercise,
  Exercise as ReduxExercise,
} from '../store/exerciseTrackerSlice';
import AddExerciseModal from '../components/AddExerciseModal';
import EditWorkoutPlanModal from '../components/EditWorkoutPlanModal';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

// Define navigation type
type ExerciseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ExerciseScreenProps {
  navigation: ExerciseScreenNavigationProp;
}

// Extended Redux Exercise type for internal type checking
interface StoreExerciseType {
  id: string;
  name: string;
  category: string;
  caloriesPerMinute?: number;
  description?: string;
  difficulty?: string;
  estimatedDuration?: number;
  imageUrl?: string;
  muscleGroups?: string[];
  equipment?: string[];
  caloriesBurnedPerMinute?: number;
}

// Ekrandaki gösterim için yerel Exercise tipi
interface Exercise {
  id: string;
  name: string;
  category: 'kardiyo' | 'kuvvet' | 'esneklik' | 'denge' | 'cardio' | 'strength' | 'flexibility' | 'balance';
  duration: number; // minutes
  caloriesBurned: number;
  difficulty: 'kolay' | 'orta' | 'zor' | 'easy' | 'medium' | 'hard';
  description: string;
  imageUrl?: string;
  sets?: ExerciseSet[];
}

// Exercise set interface
interface ExerciseSet {
  weight: number;
  reps: number;
}

// Ekrandaki gösterim için yerel WorkoutSession tipi
interface WorkoutSession {
  id: string;
  date: string;
  name?: string;
  exercises: Exercise[];
  totalDuration: number;
  totalCalories: number;
}

// Custom IconButton component
interface IconButtonProps {
  icon: React.ReactNode;
  size?: number;
  onPress?: () => void;
  style?: object;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, size = 24, onPress, style }) => {
  return (
    <TouchableOpacity style={[{ padding: 8, borderRadius: 20 }, style]} onPress={onPress}>
      {icon}
    </TouchableOpacity>
  );
};

// Custom Badge component
interface BadgeProps {
  children: React.ReactNode;
  style?: object;
}

const Badge: React.FC<BadgeProps> = ({ children, style }) => {
  return (
    <View
      style={[
        {
          backgroundColor: '#FF3B30',
          minWidth: 20,
          height: 20,
          borderRadius: 10,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 4,
        },
        style,
      ]}
    >
      <Text style={{ color: 'white', fontSize: 12 }}>{children}</Text>
    </View>
  );
};

const ExerciseScreen: React.FC<ExerciseScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const systemColorScheme = useColorScheme();
  const actualDarkMode = isDarkMode ?? systemColorScheme === 'dark';
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  const [activeTab, setActiveTab] = useState<'plans' | 'history'>('plans');
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newPlanModalVisible, setNewPlanModalVisible] = useState(false);
  const [editPlanModalVisible, setEditPlanModalVisible] = useState(false);
  const [addExerciseModalVisible, setAddExerciseModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | undefined>(undefined);

  const {
    exercises: storeExercises,
    workoutSessions: storeWorkoutSessions,
    workoutPlans: storeWorkoutPlans,
    createWorkoutPlan,
    modifyWorkoutPlan,
    createExercise,
    startWorkoutSession,
    getExercisesByCategory,
  } = useExerciseTracker();

  // Kütüphanedeki egzersizler - API'den veya Redux'tan gelecek
  const [exerciseLibrary, setExerciseLibrary] = useState<Exercise[]>([]);
  
  // Egzersiz kütüphanesini yükle - gerçek senaryoda bir API çağrısı yapılacak
  useEffect(() => {
    const loadExercises = async () => {
      try {
        // Zaten Redux store'da varsa, onları kullan
        if (storeExercises && storeExercises.length > 0) {
          setExerciseLibrary(storeExercises.map((exercise: StoreExerciseType) => ({
            id: exercise.id,
            name: exercise.name,
            category: exercise.category as 'kardiyo' | 'kuvvet' | 'esneklik' | 'denge' | 'cardio' | 'strength' | 'flexibility' | 'balance',
            duration: exercise.estimatedDuration || 20,
            caloriesBurned: exercise.caloriesBurnedPerMinute ? 
              exercise.caloriesBurnedPerMinute * (exercise.estimatedDuration || 20) : 
              (exercise.caloriesPerMinute || 5) * (exercise.estimatedDuration || 20),
            difficulty: (exercise.difficulty || 'orta') as 'kolay' | 'orta' | 'zor' | 'easy' | 'medium' | 'hard',
            description: exercise.description || '',
            imageUrl: exercise.imageUrl,
          })));
          return;
        }
        
        // Yoksa, örnek verileri oluştur
        const sampleExercises: Exercise[] = [
          {
            id: '1',
            name: t('exercise.samples.walking.name', 'Brisk Walking'),
            category: 'kardiyo',
            duration: 30,
            caloriesBurned: 180,
            difficulty: 'easy',
            description: t('exercise.samples.walking.description', 'Walk at a moderate pace to maintain your heart health and burn calories. This exercise improves heart health and stamina.'),
          },
          {
            id: '2',
            name: t('exercise.samples.squat.name', 'Bodyweight Squat'),
            category: 'kuvvet',
            duration: 15,
            caloriesBurned: 120,
            difficulty: 'medium',
            description: t('exercise.samples.squat.description', 'Strengthen your leg muscles. Stand with feet shoulder-width apart, bend your knees to a sitting position, and stand back up.'),
          },
          {
            id: '3',
            name: t('exercise.samples.yoga.name', 'Yoga - Sun Salutation'),
            category: 'esneklik',
            duration: 20,
            caloriesBurned: 100,
            difficulty: 'medium',
            description: t('exercise.samples.yoga.description', 'Stretch and achieve mental relaxation with a series of classic yoga movements. Ideal for morning routine.'),
          },
          {
            id: '4',
            name: t('exercise.samples.hiit.name', 'HIIT Workout'),
            category: 'kardiyo',
            duration: 25,
            caloriesBurned: 300,
            difficulty: 'hard',
            description: t('exercise.samples.hiit.description', 'Burn maximum calories in a short time with high-intensity interval training. Consists of 30 seconds of intense exercise followed by 10 seconds of rest.'),
          },
          {
            id: '5',
            name: t('exercise.samples.plank.name', 'Plank'),
            category: 'kuvvet',
            duration: 10,
            caloriesBurned: 80,
            difficulty: 'medium',
            description: t('exercise.samples.plank.description', 'Strengthen your core and back muscles. Create a straight line on your elbows and toes and maintain the position.'),
          },
          {
            id: '6',
            name: t('exercise.samples.cycling.name', 'Cycling'),
            category: 'kardiyo',
            duration: 40,
            caloriesBurned: 280,
            difficulty: 'medium',
            description: t('exercise.samples.cycling.description', 'Aerobic exercise performed outdoors or on a stationary bike. Strengthens leg muscles and supports heart health.'),
          },
          {
            id: '7',
            name: t('exercise.samples.pushup.name', 'Push-Up'),
            category: 'kuvvet',
            duration: 15,
            caloriesBurned: 140,
            difficulty: 'hard',
            description: t('exercise.samples.pushup.description', 'Basic exercise that increases upper body strength. Works chest, shoulder and arm muscles. Beginners can do it with knees on the floor.'),
          },
          {
            id: '8',
            name: t('exercise.samples.pilates.name', 'Pilates - Basic Movements'),
            category: 'esneklik',
            duration: 25,
            caloriesBurned: 120,
            difficulty: 'easy',
            description: t('exercise.samples.pilates.description', 'A series of controlled movements that strengthen your core muscles. Improves posture and increases flexibility.'),
          },
        ];

        // Örnek egzersizleri store'a ekle
        sampleExercises.forEach(exercise => {
          createExercise({
            name: exercise.name,
            category: exercise.category,
            caloriesBurnedPerMinute: Math.round(exercise.caloriesBurned / exercise.duration),
            description: exercise.description
          });
        });
        
        setExerciseLibrary(sampleExercises);
      } catch (error) {
        console.error('Egzersiz verileri yüklenirken hata:', error);
      }
    };
    
    loadExercises();
  }, [storeExercises, createExercise]);

  // Format WorkoutPlans data properly
  const formatWorkoutPlans = (plans: WorkoutPlan[]): any[] => {
    if (!plans || !Array.isArray(plans)) return [];
    
    return plans.map(plan => ({
      ...plan,
      exercises: plan.exercises.map(e => {
        // Find exercise detail from the store
        const exerciseDetail = storeExercises.find(
          (storeEx: ReduxExercise) => storeEx.id === e.exerciseId,
        );
        if (exerciseDetail) {
          return {
            id: exerciseDetail.id,
            name: exerciseDetail.name,
            category: exerciseDetail.category,
            duration: e.recommendedDuration || 30,
            caloriesBurned: exerciseDetail.caloriesBurnedPerMinute * (e.recommendedDuration || 30),
            difficulty: t('exercise.difficulty.medium', 'orta'), // Default value
            description: exerciseDetail.description || '',
          };
        }
        return e;
      }),
      frequency: plan.frequency || t('exercise.frequency.threeDaysWeek', 'Haftada 3 gün'),
      duration: plan.exercises.reduce((total, e) => total + (e.recommendedDuration || 30), 0),
    }));
  };

  // Format WorkoutSessions data properly
  const formatWorkoutSessions = (sessions: ReduxWorkoutSession[]): WorkoutSession[] => {
    if (!sessions || !Array.isArray(sessions)) return [];
    
    return sessions.map(session => ({
      ...session,
      totalCalories: session.totalCaloriesBurned,
      exercises: session.exercises.map(e => {
        const exerciseDetail = storeExercises.find(
          (storeEx: ReduxExercise) => storeEx.id === e.exerciseId,
        );
        if (exerciseDetail) {
          return {
            id: e.exerciseId,
            name: e.exerciseName || exerciseDetail.name,
            category: exerciseDetail.category as any,
            duration: e.duration,
            caloriesBurned: e.caloriesBurned || exerciseDetail.caloriesBurnedPerMinute * e.duration,
            difficulty: t('exercise.difficulty.medium', 'orta') as any,
            description: exerciseDetail.description || '',
          };
        }
        return {
          id: e.exerciseId,
          name: e.exerciseName || t('exercise.defaultName', 'Egzersiz'),
          category: 'kardiyo' as any,
          duration: e.duration,
          caloriesBurned: e.caloriesBurned || 0,
          difficulty: t('exercise.difficulty.medium', 'orta') as any,
          description: '',
        };
      }),
    }));
  };

  // Use the exercise data from store or fallback to defaults
  console.log('Store workout plans:', storeWorkoutPlans);

  // Forcing the use of default data for demonstration purposes - remove this in production
  const defaultWorkoutPlans = [
        {
          id: 'plan1',
          name: t('exercise.planTypes.beginnerFitness', 'Beginner Level Fitness'),
          description: t('exercise.planTypes.beginnerDescription', 'Ideal program to start your fitness journey'),
          difficulty: 'easy',
          exercises: exerciseLibrary.slice(0, 3).map(ex => ({
            exerciseId: ex.id,
            recommendedDuration: ex.duration || 30,
            recommendedSets: 3,
            recommendedReps: 12,
            difficulty: 'easy'
          })),
          days: [
            t('exercise.days.monday', 'Monday'), 
            t('exercise.days.wednesday', 'Wednesday'), 
            t('exercise.days.friday', 'Friday')
          ],
          frequency: t('exercise.frequency.threeDaysWeek', '3 days a week'),
        },
        {
          id: 'plan2',
          name: t('exercise.planTypes.cardioFocused', 'Cardio Focused Program'),
          description: t('exercise.planTypes.cardioDescription', 'Intense cardio exercises for heart health and endurance'),
          difficulty: 'medium',
          exercises: exerciseLibrary.filter(ex => ex.category === 'kardiyo').slice(0, 4).map(ex => ({
            exerciseId: ex.id,
            recommendedDuration: ex.duration || 30,
            recommendedSets: 3,
            recommendedReps: 15,
            difficulty: 'medium'
          })),
          days: [
            t('exercise.days.monday', 'Monday'), 
            t('exercise.days.tuesday', 'Tuesday'), 
            t('exercise.days.thursday', 'Thursday'), 
            t('exercise.days.saturday', 'Saturday')
          ],
          frequency: t('exercise.frequency.fourDaysWeek', '4 days a week'),
        },
        {
          id: 'plan3',
          name: t('exercise.planTypes.strengthMuscle', 'Strength and Muscle Building'),
          description: t('exercise.planTypes.strengthDescription', 'Ideal program to increase muscle mass and develop strength'),
          difficulty: 'hard',
          exercises: exerciseLibrary.filter(ex => ex.category === 'kuvvet').map(ex => ({
            exerciseId: ex.id,
            recommendedDuration: ex.duration || 30,
            recommendedSets: 4,
            recommendedReps: 10,
            recommendedWeight: 5,
            difficulty: 'hard'
          })),
          days: [
            t('exercise.days.monday', 'Monday'), 
            t('exercise.days.wednesday', 'Wednesday'), 
            t('exercise.days.friday', 'Friday')
          ],
          frequency: t('exercise.frequency.threeDaysWeek', '3 days a week'),
        },
        {
          id: 'plan4',
          name: t('exercise.planTypes.flexibilityBalance', 'Flexibility and Balance Program'),
          description: t('exercise.planTypes.flexibilityDescription', 'For increasing body flexibility and improving balance'),
          difficulty: 'medium',
          exercises: [
            ...exerciseLibrary.filter(ex => ex.category === 'esneklik'),
            ...exerciseLibrary.filter(ex => ex.category === 'kuvvet').slice(0, 2)
          ].map(ex => ({
            exerciseId: ex.id,
            recommendedDuration: ex.duration || 25,
            recommendedSets: 3,
            recommendedReps: 12,
            difficulty: 'medium'
          })),
          days: [
            t('exercise.days.tuesday', 'Tuesday'), 
            t('exercise.days.thursday', 'Thursday'), 
            t('exercise.days.sunday', 'Sunday')
          ],
          frequency: t('exercise.frequency.threeDaysWeek', '3 days a week'),
        }
      ];

  // Use default workout plans for development purposes    
  const workoutPlansData = formatWorkoutPlans(defaultWorkoutPlans);
  
  // Original conditional loading
  /*
  const workoutPlansData = storeWorkoutPlans?.length > 0
    ? formatWorkoutPlans(storeWorkoutPlans)
    : formatWorkoutPlans(defaultWorkoutPlans);
  */

  const workoutHistoryData = storeWorkoutSessions?.length > 0
    ? formatWorkoutSessions(storeWorkoutSessions)
    : [
        {
          id: 'session1',
          date: '2023-11-10',
          exercises: exerciseLibrary.slice(0, 2),
          totalDuration: 40,
          totalCalories: 260,
        },
        // ... other default sessions
      ];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'cardio':
      case 'kardiyo':
        return faRunning;
      case 'strength':
      case 'kuvvet':
        return faDumbbell;
      case 'flexibility':
      case 'esneklik':
        return faYinYang;
      case 'balance':
      case 'denge':
        return faBalanceScale;
      default:
        return faRunning;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const lowerDifficulty = difficulty.toLowerCase();
    switch (lowerDifficulty) {
      case 'easy':
      case 'kolay':
        return '#4CAF50';
      case 'medium':
      case 'orta':
        return '#FF9800';
      case 'hard':
      case 'zor':
        return '#F44336';
      default:
        return '#FF9800'; // Default to medium color
    }
  };

  const getDifficultyText = (difficulty: string) => {
    const lowerDifficulty = difficulty.toLowerCase();
    switch (lowerDifficulty) {
      case 'easy':
      case 'kolay':
        return t('exercise.difficulty.easy', 'Easy');
      case 'medium':
      case 'orta':
        return t('exercise.difficulty.medium', 'Medium');
      case 'hard':
      case 'zor':
        return t('exercise.difficulty.hard', 'Hard');
      default:
        return t('exercise.difficulty.medium', 'Medium');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', weekday: 'long' });
  };

  const getCategoryText = (category: string) => {
    const lowerCategory = category.toLowerCase();
    if (lowerCategory === 'kardiyo' || lowerCategory === 'cardio') {
      return t('exercise.categories.cardio', 'Cardio');
    } else if (lowerCategory === 'kuvvet' || lowerCategory === 'strength') {
      return t('exercise.categories.strength', 'Strength');
    } else if (lowerCategory === 'esneklik' || lowerCategory === 'flexibility') {
      return t('exercise.categories.flexibility', 'Flexibility');
    } else {
      return t('exercise.categories.balance', 'Balance');
    }
  };

  const showExerciseDetails = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setExerciseModalVisible(true);
  };

  // Start a workout properly with Redux integration
  const startWorkout = (plan: { name: string; exercises: any[] }) => {
    try {
      // Show loading or confirmation dialog
      Alert.alert(
        t('exercise.startWorkoutTitle', 'Antrenman Başlat'),
        t('exercise.startWorkoutPromptWithName', '{{name}} programını başlatmak istiyor musunuz?', { name: plan.name }),
        [
          {
            text: t('cancel', 'İptal'),
            style: 'cancel'
          },
          {
            text: t('start', 'Başlat'),
            onPress: () => {
              const exercises = plan.exercises.map((exercise: any) => ({
                exerciseId: exercise.id || exercise.exerciseId,
                exerciseName: exercise.name || t('exercise.defaultName', 'Egzersiz'),
                duration: exercise.duration || exercise.recommendedDuration || 30,
                caloriesBurned:
                  (exercise.caloriesBurned || exercise.caloriesBurnedPerMinute || 5) *
                  (exercise.duration || exercise.recommendedDuration || 30),
                sets: exercise.sets || exercise.recommendedSets || 3,
              }));

              const session = startWorkoutSession(exercises);
              
              // Başarılı başlatma bildirimi
              Alert.alert(
                t('exercise.workoutStartedTitle', 'Antrenman Başladı'),
                t('exercise.workoutStartedWithName', '"{{name}}" programı başlatıldı!', { name: plan.name }),
                [
                  {
                    text: t('ok', 'Tamam'),
                    onPress: () => {
                      // Geçmiş sekmesine geçiş yapmak için
                      setActiveTab('history');
                    }
                  }
                ]
              );
            }
          }
        ]
      );
    } catch (error) {
      console.error("Workout başlatılırken hata oluştu:", error);
      Alert.alert(
        t('error', 'Hata'), 
        t('exercise.workoutStartError', 'Antrenman başlatılırken bir hata oluştu.')
      );
    }
  };

  // Add new exercise with proper error handling
  const handleAddExercise = (exerciseData: {
    name: string;
    category: string;
    caloriesBurnedPerMinute: number;
    description: string;
  }) => {
    try {
      createExercise(exerciseData);
      setAddExerciseModalVisible(false);
      Alert.alert('Başarılı', 'Yeni egzersiz başarıyla eklendi!');
    } catch (error) {
      console.error("Egzersiz eklenirken hata oluştu:", error);
      Alert.alert("Hata", "Egzersiz eklenirken bir hata oluştu.");
    }
  };

  // Create a workout plan with proper error handling
  const handleCreatePlan = (planData: Omit<WorkoutPlan, 'id'>) => {
    try {
      createWorkoutPlan(planData);
      setNewPlanModalVisible(false);
      Alert.alert('Başarılı', 'Yeni program oluşturuldu!');
    } catch (error) {
      console.error("Program oluşturulurken hata oluştu:", error);
      Alert.alert("Hata", "Program oluşturulurken bir hata oluştu.");
    }
  };

  // Edit a workout plan with proper error handling
  const handleEditPlan = (planData: Omit<WorkoutPlan, 'id'>) => {
    try {
      if (selectedPlan) {
        modifyWorkoutPlan({
          ...planData,
          id: selectedPlan.id,
        });
        setEditPlanModalVisible(false);
        Alert.alert('Başarılı', 'Program güncellendi!');
      } else {
        throw new Error("No selected plan to edit");
      }
    } catch (error) {
      console.error("Program güncellenirken hata oluştu:", error);
      Alert.alert("Hata", "Program güncellenirken bir hata oluştu.");
    }
  };

  // Handle navigation to the exercise details screen
  const navigateToExerciseDetails = (exerciseId: string) => {
    if (navigation && exerciseId) {
      navigation.navigate('ExerciseDetails', { exerciseId });
    }
  };

  const openEditPlanModal = (plan: WorkoutPlan) => {
    setSelectedPlan(plan);
    setEditPlanModalVisible(true);
  };

  const createNewPlan = () => {
    setSelectedPlan(undefined);
    setNewPlanModalVisible(true);
  };

  // Get the formatted date
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Render workout plans with proper theme integration
  const renderWorkoutPlans = () => {
    // Boş durum kontrolü
    if ((!workoutPlansData || workoutPlansData.length === 0) && 
        (!storeWorkoutPlans || storeWorkoutPlans.length === 0)) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={[styles.emptyStateIcon, { 
            backgroundColor: `${theme.colors.primary}20`,
          }]}>
            <FontAwesomeIcon icon={faDumbbell} size={40} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
            {t('exercise.noPlans', 'No exercise program yet')}
          </Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
            {t('exercise.createPlanPrompt', 'Create an exercise program suitable for your fitness goals')}
          </Text>
          <TouchableOpacity 
            style={[
              styles.startButton, 
              { 
                backgroundColor: theme.colors.primary,
                marginTop: 16,
                paddingHorizontal: 24
              }
            ]} 
            onPress={createNewPlan}
          >
            <FontAwesomeIcon 
              icon={faPlus} 
              size={20} 
              color={theme.colors.onPrimary} 
              style={styles.buttonIcon}
            />
            <Text style={[styles.startButtonText, { color: theme.colors.onPrimary }]}>
              {t('exercise.addFirstProgram', 'ADD FIRST PROGRAM')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <>
        <View style={styles.summaryCard}>
          <Surface style={[styles.card, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8
          }]}>
            <View style={styles.cardContent}>
              <View style={styles.sectionTitleContainer}>
                <View style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  width: 50, 
                  height: 50, 
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                }}>
                  <FontAwesomeIcon icon={faChartLine} size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('exercise.fitnessProgress', 'Fitness Progress')}</Text>
              </View>

              {/* Progress stats */}
              <View style={styles.statsGrid}>
                <View style={[styles.statCard, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(30, 136, 229, 0.1)',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 136, 229, 0.2)',
                }]}>
                  <View style={styles.statIconContainer}>
                    <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#1E88E5" />
                  </View>
                  <Text style={styles.statLabel}>{t('exercise.completedWorkouts', 'Completed Workouts')}</Text>
                  <Text style={[styles.statValue, { color: "#1E88E5" }]}>8</Text>
                </View>
                
                <View style={[styles.statCard, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 87, 34, 0.1)',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 87, 34, 0.2)',
                }]}>
                  <View style={styles.statIconContainer}>
                    <FontAwesomeIcon icon={faFire} size={20} color="#FF5722" />
                  </View>
                  <Text style={styles.statLabel}>{t('exercise.totalCaloriesBurned', 'Total Calories Burned')}</Text>
                  <Text style={[styles.statValue, { color: "#FF5722" }]}>2,450</Text>
                </View>
                
                <View style={[styles.statCard, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(76, 175, 80, 0.1)',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(76, 175, 80, 0.2)',
                }]}>
                  <View style={styles.statIconContainer}>
                    <FontAwesomeIcon icon={faClock} size={20} color="#4CAF50" />
                  </View>
                  <Text style={styles.statLabel}>{t('exercise.totalDuration', 'Total Duration')}</Text>
                  <Text style={[styles.statValue, { color: "#4CAF50" }]}>5.5{t('exercise.hourShort', 'h')}</Text>
                </View>
                
                <View style={[styles.statCard, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(156, 39, 176, 0.1)',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(156, 39, 176, 0.2)',
                }]}>
                  <View style={styles.statIconContainer}>
                    <FontAwesomeIcon icon={faHeartbeat} size={20} color="#9C27B0" />
                  </View>
                  <Text style={styles.statLabel}>{t('exercise.averageHeartRate', 'Average Heart Rate')}</Text>
                  <Text style={[styles.statValue, { color: "#9C27B0" }]}>128</Text>
                </View>
              </View>
            </View>
          </Surface>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginLeft: 16, marginTop: 20, marginBottom: 10 }]}>{t('exercise.recommendedPlans', 'Recommended Programs')}</Text>
        
        {workoutPlansData && workoutPlansData.map(plan => (
          <Card key={plan.id} style={[styles.planCard, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            marginHorizontal: 16,
            marginBottom: 16
          }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.planHeader}>
                <View style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  width: 50, 
                  height: 50, 
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                  marginRight: 12
                }}>
                  <FontAwesomeIcon icon={faDumbbell} size={24} color={theme.colors.primary} />
                </View>
                <View style={styles.planTitleContainer}>
                  <Text style={[styles.planTitle, { color: theme.colors.onSurface }]}>{plan.name}</Text>
                  <Text style={[styles.planDescription, { color: theme.colors.onSurfaceVariant }]}>
                    {plan.description}
                  </Text>
                </View>
              </View>

              <View style={[styles.planDetailRow, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : theme.colors.surfaceVariant,
                borderRadius: 12,
                marginTop: 16,
                padding: 12
              }]}>
                <View style={styles.planDetailItem}>
                  <FontAwesomeIcon icon={faClock} size={18} color={theme.colors.primary} />
                  <Text style={[styles.planDetailText, { color: theme.colors.onSurfaceVariant }]}>
                    {plan.duration || '45'} {t('exercise.minutes', 'minutes')}
                  </Text>
                </View>
                <View style={styles.planDetailItem}>
                  <FontAwesomeIcon 
                    icon={faCalendarDays} 
                    size={18} 
                    color={theme.colors.primary} 
                  />
                  <Text style={[styles.planDetailText, { color: theme.colors.onSurfaceVariant }]}>
                    {plan.frequency || t('exercise.timesPerWeek', '3 days a week')}
                  </Text>
                </View>
              </View>

              <Divider style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)', marginVertical: 16 }]} />

              <Text style={[styles.exercisesTitle, { color: theme.colors.onSurface }]}>
                {t('exercise.exercises', 'Exercises')}
              </Text>
              {(plan.exercises || []).map((exercise: any) => (
                <TouchableOpacity
                  key={exercise.id || exercise.exerciseId}
                  style={[
                    styles.exerciseItem, 
                    { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: 16,
                      marginBottom: 10,
                      padding: 12,
                      borderBottomWidth: 0
                    }
                  ]}
                  onPress={() => showExerciseDetails(exercise)}
                >
                  <View style={styles.exerciseRow}>
                    <View style={[
                      styles.exerciseIconContainer, 
                      { 
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : `${theme.colors.primary}15`,
                        borderColor: theme.colors.primary,
                        width: 40,
                        height: 40,
                        borderRadius: 20
                      }
                    ]}>
                      <FontAwesomeIcon
                        icon={getCategoryIcon(exercise.category || 'cardio')}
                        size={20}
                        color={theme.colors.primary}
                      />
                    </View>
                    <View style={styles.exerciseContent}>
                      <Text style={[styles.exerciseName, { 
                        color: theme.colors.onSurface,
                        fontSize: 16,
                        fontWeight: '600'
                      }]}>
                        {exercise.name}
                      </Text>
                      <Text style={[styles.exerciseDetail, { 
                        color: theme.colors.onSurfaceVariant,
                        fontSize: 14
                      }]}>
                        {exercise.duration} {t('exercise.minutes', 'minutes')} • {exercise.caloriesBurned} {t('exercise.calories', 'calories')}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.difficultyIndicator,
                      { backgroundColor: getDifficultyColor(exercise.difficulty || plan.difficulty || 'medium') },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {getDifficultyText(exercise.difficulty || plan.difficulty || 'medium')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </Card.Content>
            <Card.Actions style={styles.cardActions}>
              <TouchableOpacity 
                style={[styles.startButton, { 
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                  width: 150
                }]} 
                onPress={() => startWorkout(plan)}
              >
                <FontAwesomeIcon 
                  icon={faPlay} 
                  size={20} 
                  color={theme.colors.onPrimary} 
                  style={styles.buttonIcon} 
                />
                <Text style={[styles.startButtonText, { color: theme.colors.onPrimary }]}>
                  {t('exercise.startProgram', 'START PROGRAM')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.editButtonContainer, 
                  { 
                    borderColor: theme.colors.primary,
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
                    width: 150
                  }
                ]}
                onPress={() => openEditPlanModal(plan)}
              >
                <FontAwesomeIcon
                  icon={faPencil}
                  size={20}
                  color={theme.colors.primary}
                  style={styles.buttonIcon}
                />
                <Text style={[styles.editButtonText, { color: theme.colors.primary }]}>
                  {t('exercise.edit', 'EDIT')}
                </Text>
              </TouchableOpacity>
            </Card.Actions>
          </Card>
        ))}

        <TouchableOpacity 
          style={[
            styles.editButtonContainer, 
            { 
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
              marginHorizontal: 16,
              marginTop: 10,
              marginBottom: 16,
              width: 220,
              alignSelf: 'center'
            }
          ]} 
          onPress={createNewPlan}
        >
          <FontAwesomeIcon 
            icon={faPlus} 
            size={20} 
            color={theme.colors.onPrimary} 
            style={styles.buttonIcon}
          />
          <Text style={[styles.editButtonText, { color: theme.colors.onPrimary }]}>
            {t('exercise.addProgram', 'ADD PROGRAM')}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  const renderWorkoutHistory = () => {
    // Boş durum kontrolü
    if ((!workoutHistoryData || workoutHistoryData.length === 0) && 
        (!storeWorkoutSessions || storeWorkoutSessions.length === 0)) {
      return (
        <View style={styles.emptyStateContainer}>
          <View style={[styles.emptyStateIcon, { 
            backgroundColor: `${theme.colors.primary}20`,
          }]}>
            <FontAwesomeIcon icon={faCalendarCheck} size={40} color={theme.colors.primary} />
          </View>
          <Text style={[styles.emptyStateTitle, { color: theme.colors.onSurface }]}>
            {t('exercise.noHistory', 'No workout history yet')}
          </Text>
          <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
            {t('exercise.startWorkoutPrompt', 'Start your fitness journey by starting a workout from the programs section')}
          </Text>
          <TouchableOpacity 
            style={[
              styles.startButton, 
              { 
                backgroundColor: theme.colors.primary,
                marginTop: 16,
                paddingHorizontal: 24
              }
            ]} 
            onPress={() => setActiveTab('plans')}
          >
            <FontAwesomeIcon 
              icon={faPlay} 
              size={20} 
              color={theme.colors.onPrimary} 
              style={styles.buttonIcon}
            />
            <Text style={[styles.startButtonText, { color: theme.colors.onPrimary }]}>
              {t('exercise.goToPlans', 'GO TO PROGRAMS')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.workoutHistoryContainer}>
        <View style={styles.summaryCard}>
          <Surface style={[styles.card, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            marginHorizontal: 16
          }]}>
            <View style={styles.cardContent}>
              <View style={styles.sectionTitleContainer}>
                <View style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  width: 50, 
                  height: 50, 
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3
                }}>
                  <FontAwesomeIcon icon={faCalendarCheck} size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('exercise.thisMonthActivity', 'This Month\'s Activity')}</Text>
              </View>

              {/* Activity calendar visualization */}
              <View style={styles.activityCalendar}>
                {/* This would be a calendar visualization in a real app */}
                <View style={styles.calendarGrid}>
                  {Array(7).fill(0).map((_, dayIndex) => (
                    <View key={`day-${dayIndex}`} style={styles.calendarDay}>
                      <Text style={styles.dayLabel}>
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'][dayIndex]}
                      </Text>
                      {Array(4).fill(0).map((_, weekIndex) => (
                        <View 
                          key={`cell-${dayIndex}-${weekIndex}`} 
                          style={[
                            styles.calendarCell,
                            {
                              backgroundColor: Math.random() > 0.6 
                                ? (isDarkMode ? 'rgba(66, 133, 244, 0.8)' : 'rgba(66, 133, 244, 0.7)')
                                : (isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)')
                            }
                          ]}
                        />
                      ))}
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.activityLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { 
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                  }]} />
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('exercise.noWorkout', 'No Workout')}</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { 
                    backgroundColor: isDarkMode ? 'rgba(66, 133, 244, 0.8)' : 'rgba(66, 133, 244, 0.7)'
                  }]} />
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>{t('exercise.workoutDone', 'Workout Done')}</Text>
                </View>
              </View>
            </View>
          </Surface>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.colors.onSurface, marginLeft: 16, marginTop: 20, marginBottom: 10 }]}>
          {t('exercise.pastWorkouts', 'Past Workouts')}
        </Text>

        {workoutHistoryData.map((session: WorkoutSession, index: number) => (
          <Card 
            key={index} 
            style={[
              styles.sessionCard, 
              { 
                backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
                borderRadius: 24,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
                elevation: 8,
                marginHorizontal: 16,
                marginBottom: 16
              }
            ]}
          >
            <Card.Content style={styles.sessionContent}>
              <View style={styles.sessionHeader}>
                <View style={{
                  backgroundColor: `${theme.colors.primary}20`,
                  width: 50, 
                  height: 50, 
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 3 },
                  shadowOpacity: 0.2,
                  shadowRadius: 4,
                  elevation: 3,
                  marginRight: 12
                }}>
                  <FontAwesomeIcon icon={faCalendarAlt} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.sessionInfo}>
                  <Text style={[styles.sessionDate, { 
                    color: theme.colors.onSurface,
                    fontSize: 18,
                    fontWeight: 'bold'
                  }]}>
                    {formatDate(session.date)}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {session.name ? session.name : `${session.exercises.length} ${t('exercise.exercise', 'exercise')} • ${session.totalDuration} ${t('exercise.min', 'min')}`}
                  </Text>
                </View>
                <View style={styles.sessionStats}>
                  <View style={styles.statBadge}>
                    <FontAwesomeIcon icon={faFire} size={14} color="#FF5722" style={{ marginRight: 4 }} />
                    <Text style={{ color: '#FF5722', fontWeight: '600' }}>{session.totalCalories}</Text>
                  </View>
                </View>
              </View>

              <Divider style={{ marginVertical: 12 }} />

              <View style={styles.exerciseList}>
                {session.exercises.map((exercise: Exercise, exIndex: number) => (
                  <View 
                    key={exIndex} 
                    style={[
                      styles.historyExerciseItem, 
                      { 
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 8
                      }
                    ]}
                  >
                    <View style={styles.exerciseRow}>
                      <View style={[
                        styles.exerciseIconContainer, 
                        { 
                          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : `${theme.colors.primary}15`,
                          borderColor: theme.colors.primary,
                          width: 36,
                          height: 36,
                          borderRadius: 18
                        }
                      ]}>
                        <FontAwesomeIcon
                          icon={getCategoryIcon(exercise.category || 'cardio')}
                          size={18}
                          color={theme.colors.primary}
                        />
                      </View>
                      <View style={styles.exerciseContent}>
                        <Text style={[styles.exerciseName, { 
                          color: theme.colors.onSurface,
                          fontSize: 16,
                          fontWeight: '600'
                        }]}>
                          {exercise.name}
                        </Text>
                        <Text style={[styles.exerciseDetail, { 
                          color: theme.colors.onSurfaceVariant,
                          fontSize: 14
                        }]}>
                          {exercise.duration} {t('exercise.minutes', 'minutes')} • {exercise.caloriesBurned} {t('exercise.calories', 'calories')}
                        </Text>
                      </View>
                    </View>
                    {exercise.sets && exercise.sets.length > 0 && (
                      <View style={styles.setsContainer}>
                        {exercise.sets.map((set, setIndex) => (
                          <Chip 
                            key={setIndex} 
                            style={[styles.setChip, { 
                              backgroundColor: theme.colors.primary,
                              height: 28,
                              marginRight: 6,
                              marginBottom: 3
                            }]} 
                            textStyle={[styles.setChipText, { color: theme.colors.onPrimary }]}
                          >
                            {set.weight}{t('exercise.kg', 'kg')} x {set.reps}
                          </Chip>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </Card.Content>
          </Card>
        ))}
      </View>
    );
  };

  // İyileştirilmiş egzersiz detay modalı
  <Modal
    animationType="fade"
    transparent={true}
    visible={exerciseModalVisible}
    statusBarTranslucent
    onRequestClose={() => setExerciseModalVisible(false)}
  >
    {selectedExercise && (
      <Pressable 
        style={[
          styles.modalBackdrop,
          { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
        ]} 
        onPress={() => setExerciseModalVisible(false)}
      >
        <Pressable 
          style={[
            styles.modalContent, 
            { 
              backgroundColor: theme.colors.surface,
              shadowColor: theme.colors.shadow,
            }
          ]}
          onPress={(e) => e.stopPropagation()} // Modalın içine tıklayınca kapanmaması için
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
              {selectedExercise.name}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setExerciseModalVisible(false)}
            >
              <FontAwesomeIcon icon={faXmark} size={22} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          <View style={[
            styles.exerciseDetails, 
            { backgroundColor: theme.colors.surfaceVariant }
          ]}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <FontAwesomeIcon icon={faClock} size={20} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                  {selectedExercise.duration} {t('exercise.minutes', 'minutes')}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <FontAwesomeIcon icon={faFire} size={20} color="#FF5722" />
                <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                  {selectedExercise.caloriesBurned} {t('exercise.calories', 'calories')}
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <FontAwesomeIcon
                  icon={getCategoryIcon(selectedExercise.category)}
                  size={20}
                  color={theme.colors.primary}
                />
                <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                  {getCategoryText(selectedExercise.category)}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <FontAwesomeIcon icon={faSignal} size={20} color={theme.colors.primary} />
                <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                  {getDifficultyText(selectedExercise.difficulty)}
                </Text>
                <View
                  style={[
                    styles.modalDifficultyIndicator,
                    {
                      backgroundColor: getDifficultyColor(selectedExercise.difficulty),
                    },
                  ]}
                >
                  <Text style={styles.difficultyText}>
                    {getDifficultyText(selectedExercise.difficulty)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <Divider style={[styles.modalDivider, { backgroundColor: theme.colors.outline }]} />

          <ScrollView 
            style={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={[styles.descriptionTitle, { color: theme.colors.onSurface }]}>
              {t('exercise.description', 'Description')}
            </Text>
            <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
              {selectedExercise.description}
            </Text>

            <Text style={[styles.tipsTitle, { color: theme.colors.onSurface }]}>{t('exercise.tips', 'Tips')}</Text>
            <Text style={[styles.tipsText, { color: theme.colors.onSurfaceVariant }]}>
              {t('exercise.tipContent', 'Make sure to use correct form while doing this exercise. Don\'t forget to breathe and stay hydrated during your workout.')}
            </Text>

            {/* Exercise steps */}
            <Text style={[styles.stepsTitle, { color: theme.colors.onSurface, marginTop: 16 }]}>
              {t('exercise.exerciseSteps', 'Steps')}
            </Text>
            <View style={styles.stepsList}>
              <View style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.onPrimary }]}>1</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('exercise.step1', 'Start with warm-up exercises and prepare your muscle groups.')}
                </Text>
              </View>
              <View style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.onPrimary }]}>2</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('exercise.step2', 'Perform the exercise at a regular pace maintaining proper form.')}
                </Text>
              </View>
              <View style={styles.stepItem}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                  <Text style={[styles.stepNumberText, { color: theme.colors.onPrimary }]}>3</Text>
                </View>
                <Text style={[styles.stepText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('exercise.step3', 'Finish with cool-down exercises to relax your muscles.')}
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActionRow}>
            <TouchableOpacity 
              style={[styles.modalActionButton, { 
                backgroundColor: 'transparent',
                borderWidth: 1, 
                borderColor: theme.colors.primary
              }]}
              onPress={() => {
                setExerciseModalVisible(false);
                // Single exercise start function can be added here
              }}
            >
              <FontAwesomeIcon icon={faPlay} size={18} color={theme.colors.primary} style={styles.buttonIcon} />
              <Text style={[styles.modalActionText, { color: theme.colors.primary }]}>
                {t('exercise.startSingle', 'START')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalActionButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => setExerciseModalVisible(false)}
            >
              <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>
                {t('close', 'KAPAT')}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    )}
  </Modal>

  // Floating Action Button animation için
  const fabScale = useState(new Animated.Value(1))[0];

  const handlePressIn = () => {
    Animated.spring(fabScale, {
      toValue: 0.9,
      useNativeDriver: true
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(fabScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  // FAB definition
  <Animated.View style={[
    styles.fabContainer,
    {
      transform: [{ scale: fabScale }]
    }
  ]}>
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      onPress={() => setAddExerciseModalVisible(true)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.7}
    >
      <FontAwesomeIcon icon={faPlus} size={24} color={theme.colors.onPrimary} />
    </TouchableOpacity>
  </Animated.View>

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header Section - Modern and vibrant design */}
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {t('exercise.fitnessProgram', 'Fitness Program')}
            </Text>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>
              {t('exercise.title', 'Exercise Tracking')}
            </Text>
            <Text style={[styles.headerInfo, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {getFormattedDate()}
            </Text>
          </View>
          <TouchableOpacity style={styles.headerAction}>
            <View style={[styles.avatarContainer, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <FontAwesomeIcon icon={faDumbbell} size={22} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Tabs Section */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'plans' && [styles.activeTab, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]
            ]}
            onPress={() => setActiveTab('plans')}
          >
            <Text style={[styles.tabText, { color: '#fff' }]}>{t('exercise.plans', 'Programs')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'history' && [styles.activeTab, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]
            ]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, { color: '#fff' }]}>{t('exercise.history', 'History')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Performans optimizasyonu için memoized ScrollView */}
      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        removeClippedSubviews={true} // Ekranda görünmeyen öğeleri bellekten kaldırır
        // Hızlı kaydırma için isteğe bağlı olarak devre dışı bırakılabilir
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'plans' ? renderWorkoutPlans() : renderWorkoutHistory()}
      </ScrollView>

      {/* Exercise Detail Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={exerciseModalVisible}
        statusBarTranslucent
        onRequestClose={() => setExerciseModalVisible(false)}
      >
        {selectedExercise && (
          <Pressable 
            style={[
              styles.modalBackdrop,
              { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
            ]} 
            onPress={() => setExerciseModalVisible(false)}
          >
            <Pressable 
              style={[
                styles.modalContent, 
                { 
                  backgroundColor: theme.colors.surface,
                  shadowColor: theme.colors.shadow,
                }
              ]}
              onPress={(e) => e.stopPropagation()} // Modalın içine tıklayınca kapanmaması için
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                  {selectedExercise.name}
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setExerciseModalVisible(false)}
                >
                  <FontAwesomeIcon icon={faXmark} size={22} color={theme.colors.onSurface} />
                </TouchableOpacity>
              </View>

              <View style={[
                styles.exerciseDetails, 
                { backgroundColor: theme.colors.surfaceVariant }
              ]}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <FontAwesomeIcon icon={faClock} size={20} color={theme.colors.primary} />
                    <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {selectedExercise.duration} {t('exercise.minutes', 'dakika')}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesomeIcon icon={faFire} size={20} color="#FF5722" />
                    <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {selectedExercise.caloriesBurned} {t('exercise.calories', 'kalori')}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <FontAwesomeIcon
                      icon={getCategoryIcon(selectedExercise.category)}
                      size={20}
                      color={theme.colors.primary}
                    />
                    <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {getCategoryText(selectedExercise.category)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <FontAwesomeIcon icon={faSignal} size={20} color={theme.colors.primary} />
                    <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>
                      {selectedExercise.difficulty === 'kolay'
                        ? t('exercise.difficulty.easy', 'Kolay')
                        : selectedExercise.difficulty === 'orta'
                        ? t('exercise.difficulty.medium', 'Orta')
                        : t('exercise.difficulty.hard', 'Zor')}
                    </Text>
                    <View
                      style={[
                        styles.modalDifficultyIndicator,
                        {
                          backgroundColor: getDifficultyColor(selectedExercise.difficulty),
                        },
                      ]}
                    >
                      <Text style={styles.difficultyText}>
                        {selectedExercise.difficulty === 'kolay' ? t('exercise.difficulty.easy', 'kolay') :
                         selectedExercise.difficulty === 'orta' ? t('exercise.difficulty.medium', 'orta') :
                         selectedExercise.difficulty === 'zor' ? t('exercise.difficulty.hard', 'zor') :
                         t('exercise.difficulty.medium', 'orta')}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              <Divider style={[styles.modalDivider, { backgroundColor: theme.colors.outline }]} />

              <ScrollView 
                style={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <Text style={[styles.descriptionTitle, { color: theme.colors.onSurface }]}>
                  {t('exercise.description', 'Açıklama')}
                </Text>
                <Text style={[styles.descriptionText, { color: theme.colors.onSurfaceVariant }]}>
                  {selectedExercise.description}
                </Text>

                <Text style={[styles.tipsTitle, { color: theme.colors.onSurface }]}>{t('exercise.tips', 'İpuçları')}</Text>
                <Text style={[styles.tipsText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('exercise.tipContent', 'Bu egzersizi yaparken doğru form kullanmaya özen gösterin. Nefes almayı unutmayın ve egzersiz sırasında sıvı tüketmeyi ihmal etmeyin.')}
                </Text>

                {/* Egzersiz sırasında izlenmesi gereken adımlar */}
                <Text style={[styles.stepsTitle, { color: theme.colors.onSurface, marginTop: 16 }]}>
                  {t('exercise.exerciseSteps', 'Adımlar')}
                </Text>
                <View style={styles.stepsList}>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.stepNumberText, { color: theme.colors.onPrimary }]}>1</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.colors.onSurfaceVariant }]}>
                      {t('exercise.step1', 'Isınma hareketleriyle başlayın ve kas gruplarınızı hazırlayın.')}
                    </Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.stepNumberText, { color: theme.colors.onPrimary }]}>2</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.colors.onSurfaceVariant }]}>
                      {t('exercise.step2', 'Doğru formu koruyarak egzersizi düzenli tempoda uygulayın.')}
                    </Text>
                  </View>
                  <View style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                      <Text style={[styles.stepNumberText, { color: theme.colors.onPrimary }]}>3</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.colors.onSurfaceVariant }]}>
                      {t('exercise.step3', 'Egzersiz sonunda soğuma hareketleri yaparak kaslarınızı rahatlatın.')}
                    </Text>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActionRow}>
                <TouchableOpacity 
                  style={[styles.modalActionButton, { 
                    backgroundColor: 'transparent',
                    borderWidth: 1, 
                    borderColor: theme.colors.primary
                  }]}
                  onPress={() => {
                    setExerciseModalVisible(false);
                    // Hemen tek bir egzersiz başlatma işlevi buraya eklenebilir
                  }}
                >
                  <FontAwesomeIcon icon={faPlay} size={18} color={theme.colors.primary} style={styles.buttonIcon} />
                  <Text style={[styles.modalActionText, { color: theme.colors.primary }]}>
                    {t('exercise.startSingle', 'BAŞLAT')}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalActionButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => setExerciseModalVisible(false)}
                >
                  <Text style={{ color: theme.colors.onPrimary, fontWeight: 'bold' }}>
                    {t('close', 'KAPAT')}
                  </Text>
                </TouchableOpacity>
              </View>
            </Pressable>
          </Pressable>
        )}
      </Modal>

      {/* Add Exercise Modal */}
      <AddExerciseModal
        visible={addExerciseModalVisible}
        onClose={() => setAddExerciseModalVisible(false)}
        onSave={handleAddExercise}
      />

      {/* New Plan Modal */}
      <EditWorkoutPlanModal
        visible={newPlanModalVisible}
        onClose={() => setNewPlanModalVisible(false)}
        onSave={handleCreatePlan}
        exercises={storeExercises}
      />

      {/* Edit Plan Modal */}
      <EditWorkoutPlanModal
        visible={editPlanModalVisible}
        onClose={() => setEditPlanModalVisible(false)}
        onSave={handleEditPlan}
        plan={selectedPlan}
        exercises={storeExercises}
      />

      {/* Animated FAB Button */}
      <Animated.View style={[
        styles.fabContainer,
        {
          transform: [{ scale: fabScale }]
        }
      ]}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => setAddExerciseModalVisible(true)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          <FontAwesomeIcon icon={faPlus} size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.9,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
  headerInfo: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerAction: {
    // For any additional styling for header actions
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    backgroundColor: 'transparent',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    flex: 1,
  },
  summaryCard: {
    marginTop: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  planCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planTitleContainer: {
    flex: 1,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  planDetailRow: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 12,
  },
  planDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  planDetailText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
  },
  divider: {
    marginVertical: 16,
  },
  exercisesTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
    fontSize: 16,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  exerciseContent: {
    flex: 1,
    marginLeft: 12,
  },
  exerciseName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  exerciseDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  difficultyIndicator: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  cardActions: {
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  startButton: {
    backgroundColor: '#4285F4',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
    marginRight: 12,
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  editButtonContainer: {
    borderColor: '#4285F4',
    borderWidth: 1,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
    textAlign: 'center',
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#4285F4',
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  workoutHistoryContainer: {
    flex: 1,
  },
  sessionCard: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sessionContent: {
    padding: 16,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 87, 34, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  exerciseList: {
    // For any additional styling
  },
  historyExerciseItem: {
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
  },
  setsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  setChip: {
    backgroundColor: '#4285F4',
    marginRight: 4,
    marginBottom: 4,
    height: 26,
  },
  setChipText: {
    color: 'white',
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  exerciseDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 10,
    fontSize: 14,
  },
  modalDivider: {
    marginVertical: 16,
  },
  modalScrollContent: {
    marginBottom: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  descriptionText: {
    lineHeight: 20,
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipsText: {
    lineHeight: 20,
    fontStyle: 'italic',
  },
  // Only include one copy of the modalActionRow
  modalActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  // Only include one copy of the modalActionButton
  modalActionButton: {
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: 6,
    flexDirection: 'row',
  },
  // Only include one copy of the modalActionText
  modalActionText: {
    fontWeight: 'bold',
  },
  // Only include one copy of the fabContainer
  fabContainer: {
    position: 'absolute',
    right: 20,
    bottom: 20,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalDifficultyIndicator: {
    height: 28,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    marginLeft: 8,
  },
  activityCalendar: {
    marginVertical: 16,
  },
  calendarGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calendarDay: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  calendarCell: {
    width: 32,
    height: 32,
    borderRadius: 6,
    margin: 2,
  },
  activityLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 6,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyStateIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  closeButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)'
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  stepsList: {
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    lineHeight: 20,
  },
});

export default ExerciseScreen;
