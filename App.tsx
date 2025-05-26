/**
 * Health App
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
  ActivityIndicator,
  Text,
  SafeAreaView,
} from 'react-native';
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faMoon, faSun, faMobile, faBell, faLanguage, faSave, faArrowLeft, 
  faCog, faGlobe, faRulerCombined, faSync, faShieldAlt, faDatabase, 
  faBookOpen, faHeartPulse, faUser, faHome, faWater, faAppleWhole,
  faFire, faRunning, faPersonWalking, faQuestion, faBed, faEdit,
  faWalking, faDumbbell, faBrain, faLightbulb, faAppleAlt, faCalendarCheck,
  faCheckCircle, faClock, faUtensils, faPlus, faMinus, faTrash, faSearch,
  faChevronRight, faChevronLeft, faChevronDown, faChevronUp, faTimes,
  faCheck, faExclamationTriangle, faInfoCircle, faEye, faEyeSlash,
  faCamera, faImage, faDownload, faUpload, faShare, faCopy, faHeart,
  faThumbsUp, faStar, faBookmark, faFlag, faComment, faReply, faForward,
  faRefresh, faSpinner, faCircle, faSquare, faPlay, faPause, faStop,
  faVolumeUp, faVolumeDown, faVolumeMute, faBars, faEllipsisV, faEllipsisH,
  // Additional icons for SettingsScreen and ProfileScreen
  faUserEdit, faWeightScale, faRulerVertical, faCake, faPersonRunning,
  faFileExport, faCircleQuestion, faRightFromBracket, faXmark, faTrashCan,
  faWater as faWaterIcon, faAppleAlt as faAppleAltIcon
} from '@fortawesome/free-solid-svg-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from './app/context/ThemeContext';
import { LanguageProvider } from './app/context/LanguageContext';
import { useTheme } from './app/hooks/useTheme';
import { UserProvider } from './app/context/UserContext';
import AppNavigator from './app/navigation/AppNavigator';
import { CombinedDefaultTheme, CombinedDarkTheme } from './app/theme';
import store, { persistor } from './app/store';
import i18n, { initI18n } from './app/i18n';
import type { ExtendedMD3Theme } from './app/types';

// Initialize FontAwesome library with all icons
library.add(
  // Basic icons
  faMoon, faSun, faMobile, faBell, faLanguage, faSave, faArrowLeft, 
  faCog, faGlobe, faRulerCombined, faSync, faShieldAlt, faDatabase, 
  faBookOpen, faHeartPulse, faUser, faHome, faWater, faAppleWhole,
  faFire, faRunning, faPersonWalking, faQuestion, faBed, faEdit,
  faWalking, faDumbbell, faBrain, faLightbulb, faAppleAlt, faCalendarCheck,
  faCheckCircle, faClock, faUtensils,
  // Additional icons
  faPlus, faMinus, faTrash, faSearch, faChevronRight, faChevronLeft, 
  faChevronDown, faChevronUp, faTimes, faCheck, faExclamationTriangle, 
  faInfoCircle, faEye, faEyeSlash, faCamera, faImage, faDownload, 
  faUpload, faShare, faCopy, faHeart, faThumbsUp, faStar, faBookmark, 
  faFlag, faComment, faReply, faForward, faRefresh, faSpinner, faCircle, 
  faSquare, faPlay, faPause, faStop, faVolumeUp, faVolumeDown, 
  faVolumeMute, faBars, faEllipsisV, faEllipsisH,
  // Additional icons for SettingsScreen and ProfileScreen
  faUserEdit, faWeightScale, faRulerVertical, faCake, faPersonRunning,
  faFileExport, faCircleQuestion, faRightFromBracket, faXmark, faTrashCan,
  faWaterIcon, faAppleAltIcon
);

// i18n'i hemen başlat - asyncstorage'dan değer almayı daha sonra yapacak
console.log("App loaded, i18n is initialized:", i18n.isInitialized);

// NavigationContainer ile tema entegrasyonu
const AppContent = () => {
  const { isDarkMode, theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();
  
  // Tema seçimi için improved logic
  const navigationTheme = isDarkMode ? CombinedDarkTheme : CombinedDefaultTheme;
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.colors.background} 
      />
      <AppNavigator />
    </NavigationContainer>
  );
};

// Hata ayıklama için bir ErrorBoundary bileşeni
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Uygulama hatası</Text>
          <Text style={styles.errorText}>{this.state.error?.message || 'Bilinmeyen hata'}</Text>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

function App(): React.JSX.Element {
  const [appReady, setAppReady] = useState(false);

  // AsyncStorage'dan dil ayarını yükle
  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("Initializing app...");
        // AsyncStorage'dan dil tercihini yükle
        await initI18n();
        console.log("App initialized successfully");
      } catch (error) {
        console.error("Error initializing app:", error);
      } finally {
        // Hata olsa da olmasa da, 1 saniye sonra uygulama hazır olacak
        setTimeout(() => {
          setAppReady(true);
        }, 1000);
      }
    };

    initializeApp();
  }, []);

  // Uygulama hazır değilse yükleniyor göster
  if (!appReady) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200EA" />
          <Text style={styles.loadingText}>Uygulama başlatılıyor...</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <ErrorBoundary>
      <ReduxProvider store={store}>
        <PersistGate 
          loading={
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6200EA" />
              <Text style={styles.loadingText}>Veri yükleniyor...</Text>
            </View>
          } 
          persistor={persistor}
        >
          <SafeAreaProvider>
            <ThemeProvider>
              <LanguageProvider>
                <UserProvider>
                  <AppContent />
                </UserProvider>
              </LanguageProvider>
            </ThemeProvider>
          </SafeAreaProvider>
        </PersistGate>
      </ReduxProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53935',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  }
});

export default App;
