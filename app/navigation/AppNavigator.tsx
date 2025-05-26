import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from './types';
import { useTheme } from '../hooks/useTheme';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHome,
  faWater,
  faAppleWhole,
  faFire,
  faRunning,
  faPersonWalking,
  faUser,
  faQuestion,
  faBed,
  faCog,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';

// Auth Screens
import LoginScreen from '../screens/AuthScreens/LoginScreen';
import RegisterScreen from '../screens/AuthScreens/RegisterScreen';
import ForgotPasswordScreen from '../screens/AuthScreens/ForgotPasswordScreen';

// Main Screens
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ExerciseScreen from '../screens/ExerciseScreen';
import NutritionGoalsScreen from '../screens/NutritionGoalsScreen';
import SplashScreen from '../screens/SplashScreen';
import FoodDetailsScreen from '../screens/FoodDetailsScreen';
import AddFoodScreen from '../screens/AddFoodScreen';
import WaterTrackerScreen from '../screens/WaterTrackerScreen';
import FoodTrackerScreen from '../screens/FoodTrackerScreen';
import CalorieTrackerScreen from '../screens/CalorieTrackerScreen';
import StepTrackerScreen from '../screens/StepTrackerScreen';
import SleepTrackerScreen from '../screens/SleepTrackerScreen';

// Components
import AutoUpdaterComponent from '../components/AutoUpdaterComponent';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// String indexing interface
interface TabIconInfo {
  icon: IconDefinition;
  label: string;
}

// Tab icons mapping
const TAB_ICONS: Record<keyof MainTabParamList, TabIconInfo> = {
  Home: { icon: faHome, label: 'Home' },
  Profile: { icon: faUser, label: 'Profile' },
  Settings: { icon: faCog, label: 'Settings' },
};

// Custom Tab Bar Button Component
function TabBarButton({ isFocused, onPress, icon, label, theme, index, totalTabs }: { 
  isFocused: boolean; 
  onPress: () => void; 
  icon: IconDefinition; 
  label: string;
  theme: any;
  index: number;
  totalTabs: number;
}) {
  // Animation value for transition
  const animValue = React.useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: isFocused ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [isFocused, animValue]);
  
  // Interpolate multiple animation values
  const bgColorInterpolation = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', theme.colors.primary]
  });
  
  const iconScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15]
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      activeOpacity={0.65}
      style={styles.tabButton}
    >
      <Animated.View 
        style={[
          styles.tabContentContainer,
          isFocused && {
            transform: [{ translateY: -8 }]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.iconBackground,
            { 
              backgroundColor: bgColorInterpolation,
              transform: [{ scale: iconScale }],
              shadowColor: theme.colors.primary,
              shadowOffset: { width: 0, height: isFocused ? 4 : 0 },
              shadowOpacity: isFocused ? 0.3 : 0,
              shadowRadius: 8,
              elevation: isFocused ? 5 : 0,
            }
          ]}
        >
          <FontAwesomeIcon
            icon={icon}
            size={22}
            color={isFocused ? '#FFFFFF' : theme.colors.onSurfaceVariant}
          />
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.tabLabel,
            { 
              color: isFocused ? theme.colors.primary : theme.colors.onSurfaceVariant,
              opacity: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.7, 1]
              }),
              fontWeight: isFocused ? '600' : '400',
            }
          ]}
        >
          {label}
        </Animated.Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// Custom Tab Bar component
function CustomTabBar({ state, descriptors, navigation }: any) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[
      styles.tabBarContainer, 
      { 
        backgroundColor: theme.colors.surface,
        paddingBottom: Math.max(insets.bottom, 10),
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        shadowColor: theme.colors.shadow,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 12,
      }
    ]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const label = TAB_ICONS[route.name as keyof MainTabParamList]?.label || 'Unknown';
        const icon = TAB_ICONS[route.name as keyof MainTabParamList]?.icon || faQuestion;
        
        const isFocused = state.index === index;
        
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate({ name: route.name, merge: true });
          }
        };

        return (
          <TabBarButton
            key={index}
            index={index}
            totalTabs={state.routes.length}
            isFocused={isFocused}
            onPress={onPress}
            icon={icon}
            label={label}
            theme={theme}
          />
        );
      })}
    </View>
  );
}

const MainTabs: React.FC = React.memo(() => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerTitle: 'Ana Sayfa',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          headerTitle: 'Profil',
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerTitle: 'Ayarlar',
        }}
      />
    </Tab.Navigator>
  );
});

const AppNavigator: React.FC = React.memo(() => {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Navigator
        initialRouteName="SplashScreen"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen
          name="SplashScreen"
          component={SplashScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{
            headerShown: false,
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="NutritionGoals"
          component={NutritionGoalsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Beslenme Hedefleri',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            animation: 'fade',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Ayarlar',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="ExerciseDetails"
          component={ExerciseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Egzersiz Detayları',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="AddWorkout"
          component={ExerciseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Yeni Egzersiz Ekle',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="EditProfile"
          component={ProfileScreen}
          options={{
            headerShown: true,
            headerTitle: 'Profil Düzenle',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="FoodDetails"
          component={FoodDetailsScreen}
          options={{
            headerShown: true,
            headerTitle: 'Besin Detayları',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="AddFood"
          component={AddFoodScreen}
          options={({ route }) => ({
            headerShown: true,
            headerTitle: `${
              route.params?.mealType === 'breakfast'
                ? 'Kahvaltı'
                : route.params?.mealType === 'lunch'
                ? 'Öğle Yemeği'
                : route.params?.mealType === 'dinner'
                ? 'Akşam Yemeği'
                : route.params?.mealType === 'snack'
                ? 'Atıştırmalık'
                : 'Besin'
            } Ekle`,
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          })}
        />
        <Stack.Screen
          name="WaterTracker"
          component={WaterTrackerScreen}
          options={{
            headerShown: true,
            headerTitle: 'Su Takibi',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="FoodTracker"
          component={FoodTrackerScreen}
          options={{
            headerShown: true,
            headerTitle: 'Beslenme Takibi',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="CalorieTracker"
          component={CalorieTrackerScreen}
          options={{
            headerShown: true,
            headerTitle: 'Kalori Takibi',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="StepTracker"
          component={StepTrackerScreen}
          options={{
            headerShown: true,
            headerTitle: 'Adım Takibi',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="SleepTracker"
          component={SleepTrackerScreen}
          options={{
            headerShown: true,
            headerTitle: 'Uyku Takibi',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
        <Stack.Screen
          name="ExerciseTracker"
          component={ExerciseScreen}
          options={{
            headerShown: true,
            headerTitle: 'Egzersiz Takibi',
            headerTintColor: theme.colors.onSurface,
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
          }}
        />
      </Stack.Navigator>
      <AutoUpdaterComponent />
    </>
  );
});

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 85,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: '100%',
  },
  tabContentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
  },
  iconBackground: {
    width: 52, 
    height: 52, 
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  tabLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default AppNavigator;




