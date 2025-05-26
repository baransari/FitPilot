import * as React from 'react';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, StatusBar, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeartPulse } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';
import type { ExtendedMD3Theme } from '../types';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SplashScreen'>;

const SplashScreen: React.FunctionComponent = () => {
  console.log('[SplashScreen] Component rendering');
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { checkAuthStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const moveAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    console.log('[SplashScreen] Component mounted');

    const loadApp = async () => {
      try {
        console.log('[SplashScreen] Starting app initialization...');

        // Start animations immediately
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(moveAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start();

        // Set a minimum delay for the splash screen to show animations
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Use the auth hook to check authentication status
        const isAuthenticated = await checkAuthStatus();
        console.log('[SplashScreen] Authentication status:', isAuthenticated);

        // Add small delay to ensure smooth animation
        await new Promise(resolve => setTimeout(resolve, 500));

        setIsLoading(false);

        if (isAuthenticated) {
          console.log('[SplashScreen] User is authenticated, navigating to MainTabs');
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        } else {
          console.log('[SplashScreen] User is not authenticated, navigating to Login');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        }
      } catch (error) {
        console.error('[SplashScreen] Error during app initialization:', error);
        setIsLoading(false);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    };

    loadApp();
  }, [fadeAnim, moveAnim, navigation, checkAuthStatus]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar
        backgroundColor={theme.colors.primary}
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
      />
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: moveAnim }],
          },
        ]}
      >
        <View style={[styles.logoCircle, { backgroundColor: theme.colors.primary }]}>
          <FontAwesomeIcon icon={faHeartPulse} size={60} color={theme.colors.surface} />
        </View>
        <Text style={[styles.appName, { color: theme.colors.primary }]}>
          {t('appName', 'Sağlık Takibi')}
        </Text>
        <Text style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>
          {t('appTagline', 'Sağlıklı bir yaşam için yanınızdayız')}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SplashScreen;
