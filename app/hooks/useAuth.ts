import { useAppDispatch, useAppSelector } from '../store';
import { RootState } from '../store';
import { loginSuccess, logout as logoutAction, authFail } from '../store/authSlice';
import { User } from '../types';
import StorageService from '../services/StorageService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Navigasyon tipi tanımlaması
type AuthNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Storage anahtarları
const USER_STORAGE_KEY = '@HealthTrackAI:userData';
const USER_TOKEN_KEY = '@HealthTrackAI:userToken';

/**
 * Authentication hook that provides login, logout functionality and auth state
 */
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state: RootState) => state.auth);
  const navigation = useNavigation<AuthNavigationProp>();

  // Login function
  const login = async (email: string, password: string) => {
    try {
      console.log('[useAuth] Login attempt:', email);

      // Test login credentials check
      if (email === 'test@test.com' && password === 'password') {
        console.log('[useAuth] Credentials match, creating user');
        const user: User = {
          id: '1',
          name: 'Test User',
          email: email,
          steps: 0,
          stepsGoal: 10000,
          calories: 0,
          caloriesGoal: 2000,
          waterIntake: 0,
          waterGoal: 2000,
          sleepHours: 0,
          sleepGoal: 8,
          streak: 0,
          completedWorkouts: 0,
          totalWorkouts: 0,
        };

        // Save app settings for the new login session
        await StorageService.saveSettings({
          darkMode: false,
          notifications: true,
          dataSync: true,
          metricUnits: true,
          language: 'tr',
        });

        // Save user data and token
        await StorageService.setItem(USER_STORAGE_KEY, JSON.stringify(user));
        await AsyncStorage.setItem(USER_TOKEN_KEY, 'dummy-auth-token'); // Token anahtar değeri için kullanılır

        // Dispatch success action to Redux store
        console.log('[useAuth] Dispatching loginSuccess action');
        dispatch(loginSuccess(user));
        return true;
      } else {
        console.log('[useAuth] Invalid credentials');
        dispatch(authFail('Invalid email or password'));
        return false;
      }
    } catch (error) {
      console.error('[useAuth] Login error:', error);
      dispatch(authFail('An error occurred during login'));
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('[useAuth] Logging out user');

      // Clear user data from storage - tüm ilgili anahtarları temizle
      await Promise.all([
        StorageService.removeData(USER_STORAGE_KEY),
        AsyncStorage.removeItem(USER_TOKEN_KEY),
        AsyncStorage.removeItem('@user'), // Geriye dönük uyumluluk için eski anahtarı da temizle
      ]);

      console.log('[useAuth] User data cleared from storage');

      // Dispatch logout action to Redux store
      dispatch(logoutAction());

      console.log('[useAuth] User logged out, navigating to Login screen');
      // Login ekranına yönlendir - artık doğru tip tanımlamasıyla
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });

      return true;
    } catch (error) {
      console.error('[useAuth] Logout error:', error);
      return false;
    }
  };

  // Kullanıcının giriş yapmış olup olmadığını kontrol et
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      // Önce token'ı kontrol et
      const userToken = await AsyncStorage.getItem(USER_TOKEN_KEY);
      
      // Token yoksa kullanıcı giriş yapmamış demektir
      if (!userToken) {
        return false;
      }
      
      // Kullanıcı bilgilerini kontrol et
      const userData = await StorageService.getItem(USER_STORAGE_KEY);
      if (!userData) {
        // Geriye dönük uyumluluk için eski anahtar da kontrol et
        const oldUserData = await AsyncStorage.getItem('@user');
        if (!oldUserData) {
          return false;
        }
        
        // Eski veriden kullanıcı bilgilerini al ve Redux'a yükle
        const user = JSON.parse(oldUserData);
        dispatch(loginSuccess(user));
        
        // Yeni depoya geçir
        await StorageService.setItem(USER_STORAGE_KEY, oldUserData);
        return true;
      }
      
      // Kullanıcı verisini Redux store'a yükle
      dispatch(loginSuccess(JSON.parse(userData)));
      return true;
    } catch (error) {
      console.error('[useAuth] Error checking auth status:', error);
      return false;
    }
  };

  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    error: auth.error,
    login,
    logout,
    checkAuthStatus,
  };
};

export default useAuth;
