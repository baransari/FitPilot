import React, { memo, useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Image,
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import LoadingComponent from '../components/LoadingComponent';
import { User } from '../types';
import useTheme from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useUser } from '../context/UserContext';
import { useAppSelector } from '../store';

// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faFire,
  faWalking,
  faWater,
  faBed,
  faDumbbell,
  faBrain,
  faLightbulb,
  faAppleAlt,
  faCalendarCheck,
  faCheckCircle,
  faClock,
  faSync,
  faUtensils,
} from '@fortawesome/free-solid-svg-icons';

// Import from paperComponents utility (our compatibility layer)
import { Card, Button, Divider, Chip } from '../utils/paperComponents';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

// Type definition for the StatsCard component
interface StatsCardProps {
  backgroundColor: string;
  iconBackgroundColor: string;
  icon: IconDefinition;
  value: string | number;
  label: string;
  progress: number;
  onPress?: (() => void) | null;
  showDetails?: boolean;
}

// Memoized card components to prevent unnecessary re-renders
const StatsCard = memo<StatsCardProps>(
  ({
    backgroundColor,
    iconBackgroundColor,
    icon,
    value,
    label,
    progress,
    onPress = null,
    showDetails = false,
  }) => {
    const { theme, isDarkMode } = useTheme();
    const themeAsAny = theme as any;
    
    const content = (
      <View style={styles.statsCardContent}>
        {/* Header with icon and value */}
        <View style={styles.statsCardHeader}>
          <View style={[styles.statsIconContainer, { backgroundColor: iconBackgroundColor }]}>
            <FontAwesomeIcon icon={icon} size={22} color="#fff" />
          </View>
          <View style={styles.statsValueContainer}>
            <Text style={[styles.statsValue, { color: themeAsAny.colors.text }]}>{value}</Text>
            <Text style={[styles.statsLabel, { color: themeAsAny.colors.textSecondary || '#666' }]}>{label}</Text>
          </View>
        </View>
        
        {/* Progress section */}
        <View style={styles.statsProgressSection}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  backgroundColor: iconBackgroundColor,
                  width: `${Math.min(progress, 100)}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: iconBackgroundColor }]}>{progress}%</Text>
        </View>
        
        {/* Optional details button */}
        {showDetails && (
          <View style={[styles.customButtonContainer, { backgroundColor: iconBackgroundColor }]}>
            <Text style={styles.customButtonText}>Detaylar</Text>
          </View>
        )}
      </View>
    );

    if (onPress) {
      return (
        <TouchableOpacity 
          onPress={onPress} 
          activeOpacity={0.9}
          style={[styles.statsCard, { backgroundColor }]}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return <View style={[styles.statsCard, { backgroundColor }]}>{content}</View>;
  },
);

// Workout Progress Card Component
interface WorkoutProgressCardProps {
  completedWorkouts: number;
  totalWorkouts: number;
  primaryColor: string;
  onPress: () => void;
}

const WorkoutProgressCard = memo<WorkoutProgressCardProps>(
  ({ completedWorkouts, totalWorkouts, primaryColor, onPress }) => {
    const { theme, isDarkMode } = useTheme();
    const themeAsAny = theme as any;
    const percentComplete = Math.round((completedWorkouts / totalWorkouts) * 100);
    const { t } = useTranslation();
    
    return (
      <View style={[styles.card, { 
        backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
        borderWidth: 0,
      }]}>
        <View style={[styles.cardContent, { paddingTop: 24 }]}>
          <View style={styles.sectionTitleContainer}>
            <View style={{
              backgroundColor: `${primaryColor}20`,
              width: 50, 
              height: 50, 
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}>
              <FontAwesomeIcon icon={faDumbbell} size={24} color={primaryColor} />
            </View>
            <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>{t('home.workoutProgress')}</Text>
          </View>

          <View style={styles.workoutProgressContainer}>
            <View style={styles.workoutProgressInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <FontAwesomeIcon icon={faCheckCircle} size={16} color={primaryColor} style={{ marginRight: 8 }} />
                <Text style={[styles.workoutProgressText, { color: themeAsAny.colors.text }]}>
                  <Text style={[styles.workoutProgressCount, { color: primaryColor }]}>{completedWorkouts}</Text>/{totalWorkouts}{' '}
                  {t('home.workoutsCompleted')}
                </Text>
              </View>
              <Text style={[styles.workoutProgressPercentage, { color: primaryColor }]}>{percentComplete}%</Text>
            </View>

            <View style={[styles.workoutProgressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <View
                style={[
                  styles.workoutProgressBarFill,
                  { 
                    width: `${Math.min(percentComplete, 100)}%`,
                    backgroundColor: primaryColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onPress}
            style={[styles.actionButton, { 
              backgroundColor: primaryColor,
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5
            }]}
          >
            <Text style={styles.actionButtonText}>{t('home.goToWorkouts', 'Antrenmanlara Git')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

// Nutrition Status Card Component
interface NutritionCardProps {
  calories: number;
  caloriesGoal: number;
  primaryColor: string;
  onPress: () => void;
}

const NutritionCard = memo<NutritionCardProps>(
  ({ calories, caloriesGoal, primaryColor, onPress }) => {
    const { theme, isDarkMode } = useTheme();
    const themeAsAny = theme as any;
    const percentComplete = Math.round((calories / caloriesGoal) * 100);
    const remaining = caloriesGoal - calories;
    const { t } = useTranslation();
    
    return (
      <View style={[styles.card, styles.lastCard, { 
        backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
        borderWidth: 0,
      }]}>
        <View style={[styles.cardContent, { paddingTop: 24 }]}>
          <View style={styles.sectionTitleContainer}>
            <View style={{
              backgroundColor: `${primaryColor}20`,
              width: 50, 
              height: 50, 
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}>
              <FontAwesomeIcon icon={faUtensils} size={24} color={primaryColor} />
            </View>
            <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>{t('home.nutritionStatus', 'Beslenme Durumu')}</Text>
          </View>

          <View style={styles.nutritionContainer}>
            <View style={[styles.nutritionItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.03)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }]}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('calories.consumed')}</Text>
              <Text style={[styles.nutritionValue, { color: primaryColor }]}>{calories}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('food.calories')}</Text>
            </View>

            <View style={[styles.nutritionItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.03)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }]}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('calories.remaining')}</Text>
              <Text style={[styles.nutritionValue, { color: themeAsAny.colors.onSurface }]}>{remaining}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('food.calories')}</Text>
            </View>

            <View style={[styles.nutritionItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.03)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
            }]}>
              <Text style={[styles.nutritionLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('calories.goal')}</Text>
              <Text style={[styles.nutritionValue, { color: themeAsAny.colors.onSurface }]}>{caloriesGoal}</Text>
              <Text style={[styles.nutritionUnit, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('food.calories')}</Text>
            </View>
          </View>
          
          {/* Progress bar for calories */}
          <View style={{ width: '100%', paddingHorizontal: 4, marginTop: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontSize: 14, color: themeAsAny.colors.textSecondary || '#666' }}>{t('calories.dailyGoal', 'Günlük Hedef')}</Text>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: primaryColor }}>{percentComplete}%</Text>
            </View>
            <View style={[styles.workoutProgressBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <View
                style={[
                  styles.workoutProgressBarFill,
                  { 
                    width: `${Math.min(percentComplete, 100)}%`,
                    backgroundColor: primaryColor 
                  },
                ]}
              />
            </View>
          </View>
        </View>
        
        <View style={styles.cardActions}>
          <TouchableOpacity
            onPress={onPress}
            style={[styles.actionButton, { 
              backgroundColor: primaryColor,
              shadowColor: primaryColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 5
            }]}
          >
            <Text style={styles.actionButtonText}>{t('home.goToNutrition', 'Beslenme Takibine Git')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const HomeScreen: React.FunctionComponent<HomeScreenProps> = ({ navigation }) => {
  console.log("Rendering HomeScreen");
  
  const { user } = useUser();
  const { theme, isDarkMode } = useTheme();
  const themeAsAny = theme as any;
  const { t, i18n } = useTranslation();
  const { language } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(true);

  // Doğrudan sleepTracker verisini al
  const sleepTracker = useAppSelector((state: RootState) => state.sleepTracker);

  useEffect(() => {
    console.log("HomeScreen mount effect - checking for data readiness");
    console.log("i18n initialized:", i18n.isInitialized);
    console.log("Current language:", language);
    console.log("User data:", user ? "Available" : "Not available");
    
    // Verilerin yüklenmesi için kısa bir bekleme
    const timer = setTimeout(() => {
      console.log("Timer fired, removing loading state");
      setIsLoading(false);
    }, 500);
    
    return () => {
      console.log("HomeScreen unmounting, clearing timer");
      clearTimeout(timer);
    };
  }, []);

  const calculateProgressPercentage = (current: number, goal: number) => {
    return Math.min(Math.round((current / goal) * 100), 100);
  };

  if (isLoading) {
    console.log("Rendering HomeScreen loading state");
    return (
      <SafeAreaView style={[styles.safeArea, {backgroundColor: themeAsAny.colors?.background || '#fff'}]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themeAsAny.colors?.primary || '#6200EA'} />
          <Text style={[styles.loadingText, {color: themeAsAny.colors?.onBackground || '#333'}]}>
            {t('loading')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log("Rendering HomeScreen content");
  
  if (!user) {
    console.log("No user data, showing login message");
    return (
      <SafeAreaView style={[styles.safeArea, {backgroundColor: themeAsAny.colors?.background || '#fff'}]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, {color: themeAsAny.colors?.error || '#E53935'}]}>
            {t('errors.pleaseLogin')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const stepsProgress = calculateProgressPercentage(user.steps || 0, user.stepsGoal || 10000);
  const caloriesProgress = calculateProgressPercentage(user.calories || 0, user.caloriesGoal || 2000);
  const sleepHours = sleepTracker?.lastSleep?.duration || user.sleepHours || 0;
  const sleepGoal = sleepTracker?.sleepGoal || user.sleepGoal || 8;
  const sleepProgress = calculateProgressPercentage(sleepHours, sleepGoal);
  const waterProgress = calculateProgressPercentage(user.waterIntake || 0, user.waterGoal || 2);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t('home.greeting.morning');
    } else if (hour < 18) {
      return t('home.greeting.afternoon');
    } else if (hour < 22) {
      return t('home.greeting.evening');
    } else {
      return t('home.greeting.night');
    }
  };

  function isValidUser(user: User | null): user is User {
    return user !== null;
  }

  // Günün renk temaları (değiştirebilirsiniz)
  const primaryColor = themeAsAny.colors.primary || '#4285F4';
  const secondaryColor = isDarkMode ? '#2C2C2C' : '#fff';
  const headerColor = isDarkMode ? '#1E1E2E' : 'rgba(66, 133, 244, 0.95)';
  const gradientColors = isDarkMode 
    ? ['#272838', '#1E1E2E'] 
    : ['#4285F4', '#5C9CFF'];

  // Tracker ve detay sayfalarına yönlendirmek için yardımcı fonksiyon
  const navigateToTracker = (screen: keyof RootStackParamList, params?: Record<string, any>) => {
    // Navigate fonksiyonunu doğrudan çağıralım
    navigation.navigate(screen, params as any);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeAsAny.colors.background }]}>
      <ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - Modern ve canlı bir tasarım */}
        <View style={[styles.headerContainer, { backgroundColor: headerColor }]}>
          <View style={styles.headerContent}>
            <View>
              <Text style={[styles.greetingText, { color: 'rgba(255, 255, 255, 0.9)' }]}>{getGreeting()},</Text>
              <Text style={[styles.welcomeText, { color: '#fff' }]}>{user.name || t('home.title')}!</Text>
              <Text style={[styles.dateText, { color: 'rgba(255, 255, 255, 0.9)' }]}>
                {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <LanguageSwitcher compact={true} />
              <TouchableOpacity 
                style={{marginLeft: 8}}
                onPress={() => navigation.navigate('Profile')}
              >
                {user.profilePhoto ? (
                  <Image
                    source={{ uri: user.profilePhoto }}
                    style={[styles.avatar, { borderColor: secondaryColor, borderWidth: 3 }]}
                  />
                ) : (
                  <View style={[styles.avatar, { backgroundColor: secondaryColor }]}>
                    <Text style={{ 
                      color: isDarkMode ? '#fff' : primaryColor, 
                      fontSize: 26,
                      fontWeight: 'bold' 
                    }}>
                      {user.name?.charAt(0) || 'K'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Streak Chip - Daha yuvarlak ve canlı */}
          <Chip
            icon={({ size, color }: { size: number; color: string }) => (
              <FontAwesomeIcon icon={faFire} size={size} color="#FF9800" />
            )}
            style={[styles.streakChip, { 
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.5)'
            }]}
            textStyle={[styles.streakChipText, { color: '#fff' }]}
          >
            {user.streak || 0} {t('home.streakDays')}!
          </Chip>
        </View>

        {/* Stats Cards - Daha yuvarlak ve gölgeli tasarım */}
        <View style={styles.statsRow}>
          <StatsCard
            backgroundColor={isDarkMode ? '#1E1E2E' : '#E3F2FD'}
            iconBackgroundColor="#1E88E5"
            icon={faWalking}
            value={user.steps || 0}
            label={t('steps.steps')}
            progress={stepsProgress}
            onPress={() => navigateToTracker('StepTracker')}
          />
          <StatsCard
            backgroundColor={isDarkMode ? '#1E1E2E' : '#FFF8E1'}
            iconBackgroundColor="#FFC107"
            icon={faFire}
            value={user.calories || 0}
            label={t('food.calories')}
            progress={caloriesProgress}
            onPress={() => navigateToTracker('CalorieTracker')}
          />
        </View>

        <View style={styles.statsRow}>
          <StatsCard
            backgroundColor={isDarkMode ? '#1E1E2E' : '#E1F5FE'}
            iconBackgroundColor="#03A9F4"
            icon={faWater}
            value={`${user.waterIntake || 0}L`}
            label={t('water.title')}
            progress={waterProgress}
            onPress={() => navigateToTracker('WaterTracker')}
          />
          <StatsCard
            backgroundColor={isDarkMode ? '#1E1E2E' : '#E8EAF6'}
            iconBackgroundColor="#3F51B5"
            icon={faBed}
            value={`${sleepHours}s`}
            label={t('sleep.title')}
            progress={sleepProgress}
            showDetails={false}
            onPress={() => navigateToTracker('SleepTracker')}
          />
        </View>

        {/* Workout Progress - Modern ve temiz tasarım */}
        <WorkoutProgressCard
          completedWorkouts={user.completedWorkouts || 0}
          totalWorkouts={user.totalWorkouts || 0}
          primaryColor={primaryColor}
          onPress={() => navigateToTracker('ExerciseTracker')}
        />

        {/* AI Health Advice - Daha modern kartlar */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
          borderWidth: 0,
        }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${primaryColor}20`,
                width: 50, 
                height: 50, 
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faBrain} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>AI {t('home.healthAdvice', 'Sağlık Tavsiyeleri')}</Text>
            </View>
            
            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faLightbulb} size={22} color="#FFC107" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  {t('home.stepsAdvice', 'Bugün {{stepsGoal}} adım hedefine yakınsın! {{remainingSteps}} adım daha at ve günlük hedefe ulaş.', {
                    stepsGoal: user.stepsGoal || 10000,
                    remainingSteps: Math.max(0, (user.stepsGoal || 10000) - (user.steps || 0))
                  })}
                </Text>
              </View>
            </View>

            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)', 
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faAppleAlt} size={22} color="#4CAF50" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  {t('home.waterAdvice', 'Günlük su hedefinizin {{percent}}%\'ini tamamladınız. Gün boyunca düzenli olarak su içmeyi unutmayın.', {
                    percent: Math.floor(waterProgress)
                  })}
                </Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              style={[styles.actionButton, { 
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
              }]}
            >
              {t('home.viewAllAdvice', 'Tüm Tavsiyeleri Gör')}
            </Button>
          </Card.Actions>
        </Card>

        {/* Activity Schedule - Modern program görünümü */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
          borderWidth: 0,
        }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${primaryColor}20`,
                width: 50, 
                height: 50, 
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faCalendarCheck} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.onSurface }]}>{t('home.dailySchedule', 'Günlük Program')}</Text>
            </View>
            
            <View style={[styles.activityItem, { 
              backgroundColor: isDarkMode ? 'rgba(3, 169, 244, 0.1)' : 'rgba(3, 169, 244, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(3, 169, 244, 0.2)' : 'rgba(3, 169, 244, 0.1)',
            }]}>
              <View style={[styles.activityTimeContainer, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <Text style={[styles.activityTime, { color: '#03A9F4' }]}>09:00</Text>
              </View>
              <View style={styles.activityContentContainer}>
                <Text style={[styles.activityName, { color: themeAsAny.colors.onSurface }]}>{t('home.morningWalk', 'Sabah Yürüyüşü')}</Text>
                <Text style={[styles.activityDuration, { color: themeAsAny.colors.onSurfaceVariant }]}>30 {t('exercise.min')}</Text>
              </View>
            </View>

            <View style={[styles.activityItem, { 
              backgroundColor: isDarkMode ? 'rgba(156, 39, 176, 0.1)' : 'rgba(156, 39, 176, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(156, 39, 176, 0.2)' : 'rgba(156, 39, 176, 0.1)',
            }]}>
              <View style={[styles.activityTimeContainer, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <Text style={[styles.activityTime, { color: '#9C27B0' }]}>18:30</Text>
              </View>
              <View style={styles.activityContentContainer}>
                <Text style={[styles.activityName, { color: themeAsAny.colors.text }]}>{t('exercise.yoga', 'Yoga')}</Text>
                <Text style={[styles.activityDuration, { color: themeAsAny.colors.textSecondary || '#666' }]}>45 {t('exercise.min')}</Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="contained"
              onPress={() => navigateToTracker('ExerciseTracker')}
              style={[styles.actionButton, { 
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
              }]}
            >
              {t('home.scheduleDetails', 'Program Detayı')}
            </Button>
          </Card.Actions>
        </Card>

        {/* Debug/Dev Card - Sadece geliştirme aşamasında */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
          borderWidth: 0,
          opacity: 0.9
        }]}>
          <Card.Content>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${primaryColor}20`,
                width: 50, 
                height: 50, 
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faSync} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: themeAsAny.colors.text }]}>{t('home.integrationStatus', 'Entegrasyon Durumu')} (DEV)</Text>
            </View>
            
            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(3, 169, 244, 0.1)' : 'rgba(3, 169, 244, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(3, 169, 244, 0.2)' : 'rgba(3, 169, 244, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faWater} size={22} color="#03A9F4" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={styles.adviceBold}>{t('water.title')}:</Text> Redux Store'da{' '}
                  {((user.waterIntake || 0) * 1000).toFixed(0)}ml /{' '}
                  {((user.waterGoal || 0) * 1000).toFixed(0)}ml
                </Text>
              </View>
            </View>

            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faAppleAlt} size={22} color="#4CAF50" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={styles.adviceBold}>{t('food.title')}:</Text> Redux Store'da{' '}
                  {user.calories || 0} / {user.caloriesGoal || 0} {t('food.calories')}
                </Text>
              </View>
            </View>

            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)',
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faDumbbell} size={22} color="#FF9800" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: themeAsAny.colors.text }]}>
                  <Text style={styles.adviceBold}>{t('exercise.title')}:</Text> Redux Store'da{' '}
                  {user.completedWorkouts || 0} / {user.totalWorkouts || 0} {t('home.workoutsCompleted')}
                </Text>
              </View>
            </View>
          </Card.Content>
          <Card.Actions style={styles.cardActions}>
            <Button 
              mode="contained" 
              onPress={() => null} 
              style={[styles.actionButton, { 
                backgroundColor: primaryColor,
                opacity: 0.8,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
              }]}
            >
              {t('home.developerInfo', 'Geliştirici Bilgisi')}
            </Button>
          </Card.Actions>
        </Card>

        {/* Nutrition Status - Modern beslenme kartı */}
        <NutritionCard
          calories={user.calories || 0}
          caloriesGoal={user.caloriesGoal || 2500}
          primaryColor={primaryColor}
          onPress={() => navigateToTracker('FoodTracker')}
        />
      </ScrollView>
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
  greetingText: {
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.9,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 4,
  },
  dateText: {
    fontSize: 14,
    marginTop: 8,
    opacity: 0.8,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderWidth: 3,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
    backgroundColor: '#4285F4',
  },
  streakChip: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  streakChipText: {
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
  },
  statsCard: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  statsCardContent: {
    width: '100%',
  },
  statsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  statsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
  },
  statsValueContainer: {
    flex: 1,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 16,
    marginBottom: 10,
    opacity: 0.7,
  },
  statsProgressSection: {
    width: '100%',
    marginVertical: 10,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
    alignSelf: 'flex-end',
  },
  cardContent: {
    padding: 16,
    alignItems: 'center',
  },
  card: {
    margin: 16,
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  lastCard: {
    marginBottom: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  workoutProgressContainer: {
    marginVertical: 14,
  },
  workoutProgressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  workoutProgressText: {
    fontSize: 16,
    opacity: 0.8,
  },
  workoutProgressCount: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  workoutProgressPercentage: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  workoutProgressBar: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  workoutProgressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  adviceContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
  },
  adviceIcon: {
    marginRight: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  adviceContent: {
    flex: 1,
  },
  adviceText: {
    fontSize: 16,
    lineHeight: 22,
  },
  adviceBold: {
    fontWeight: 'bold',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  activityTimeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  activityTime: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityContentContainer: {
    flex: 1,
  },
  activityName: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  activityDuration: {
    fontSize: 16,
    opacity: 0.7,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    paddingVertical: 10,
  },
  nutritionItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    padding: 16,
    borderRadius: 16,
    width: '30%',
  },
  nutritionLabel: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  nutritionValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  nutritionUnit: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  customButtonContainer: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  customButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default HomeScreen;
