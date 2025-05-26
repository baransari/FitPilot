import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import useAuth from '../../hooks/useAuth';
import {
  Button,
  Text as PaperText,
  TextInput as PaperTextInput,
} from '../../utils/paperComponents';
import { useTheme } from '../../context/ThemeContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faEnvelope, 
  faLock, 
  faArrowRight,
  faHeartPulse
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

// Type for the navigation prop specific to this screen
type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

type Props = {
  navigation: LoginScreenNavigationProp;
};

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { theme } = useTheme();
  const themeAsAny = theme as any;
  const isDarkMode = themeAsAny.dark;
  const { login, error } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const validateForm = (): boolean => {
    let isValid = true;

    // Validate email
    if (!isValidEmail(email)) {
      setEmailError(t('errors.invalidEmail', 'Lütfen geçerli bir e-posta adresi girin'));
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validate password
    if (!isValidPassword(password)) {
      setPasswordError(t('errors.weakPassword', 'Şifre en az 6 karakter olmalıdır'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoggingIn(true);

    try {
      const success = await login(email, password);

      if (success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      } else {
        Alert.alert(t('error', 'Hata'), t('auth.invalidCredentials', 'Geçersiz e-posta veya şifre'));
      }
    } catch (err) {
      console.error('[LoginScreen] Login error:', err);
      Alert.alert(t('error', 'Hata'), t('auth.loginError', 'Giriş sırasında bir hata oluştu'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const headerBackgroundColor = isDarkMode 
    ? themeAsAny.colors.primary + '80' 
    : themeAsAny.colors.primary;

  const cardBackgroundColor = isDarkMode 
    ? '#1E1E2E' 
    : '#FFFFFF';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeAsAny.colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent"
        translucent 
      />
      
      {/* Header Section */}
      <View style={[
        styles.headerContainer, 
        { 
          backgroundColor: headerBackgroundColor,
          shadowColor: themeAsAny.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 8,
          elevation: 8
        }
      ]}>
        <View style={styles.logoCircle}>
          <FontAwesomeIcon 
            icon={faHeartPulse} 
            size={60} 
            color="#FFF" 
          />
        </View>
        <PaperText
          variant="headlineLarge"
          style={styles.logoText}
        >
          {t('appName', 'Health Tracker')}
        </PaperText>
        <PaperText
          variant="bodyLarge"
          style={styles.logoSubtitle}
        >
          {t('auth.trackHealthFitness', 'Sağlık ve fitness hedeflerinizi takip edin')}
        </PaperText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[
            styles.formCard, 
            { 
              backgroundColor: cardBackgroundColor,
              shadowColor: isDarkMode ? themeAsAny.colors.primary : '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDarkMode ? 0.3 : 0.1,
              shadowRadius: 12,
              elevation: 8 
            }
          ]}>
            <PaperText
              variant="titleLarge"
              style={[styles.formTitle, { color: themeAsAny.colors.onSurface }]}
            >
              {t('auth.signInToAccount', 'Hesabınıza Giriş Yapın')}
            </PaperText>

            <View style={styles.inputContainer}>
              <FontAwesomeIcon 
                icon={faEnvelope} 
                size={20} 
                color={themeAsAny.colors.primary} 
                style={styles.inputIcon}
              />
              <PaperTextInput
                label={t('auth.email', 'E-posta')}
                value={email}
                onChangeText={(text: string) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                mode="outlined"
                style={[styles.input, { backgroundColor: 'transparent' }]}
                autoCapitalize="none"
                keyboardType="email-address"
                error={!!emailError}
                outlineColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
                activeOutlineColor={themeAsAny.colors.primary}
              />
            </View>
            {emailError ? (
              <PaperText
                variant="labelSmall"
                style={[styles.errorText, { color: themeAsAny.colors.error }]}
              >
                {emailError}
              </PaperText>
            ) : null}

            <View style={styles.inputContainer}>
              <FontAwesomeIcon 
                icon={faLock} 
                size={20} 
                color={themeAsAny.colors.primary} 
                style={styles.inputIcon}
              />
              <PaperTextInput
                label={t('auth.password', 'Şifre')}
                value={password}
                onChangeText={(text: string) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                mode="outlined"
                style={[styles.input, { backgroundColor: 'transparent' }]}
                secureTextEntry
                error={!!passwordError}
                outlineColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
                activeOutlineColor={themeAsAny.colors.primary}
              />
            </View>
            {passwordError ? (
              <PaperText
                variant="labelSmall"
                style={[styles.errorText, { color: themeAsAny.colors.error }]}
              >
                {passwordError}
              </PaperText>
            ) : null}

            <TouchableOpacity 
              style={[styles.forgotPasswordLink]}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <PaperText
                variant="labelLarge"
                style={{ color: themeAsAny.colors.primary }}
              >
                {t('auth.forgotPassword', 'Şifrenizi mi unuttunuz?')}
              </PaperText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton, 
                { 
                  backgroundColor: themeAsAny.colors.primary,
                  shadowColor: themeAsAny.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5
                }
              ]}
              onPress={handleLogin}
              disabled={isLoggingIn}
            >
              <PaperText variant="titleMedium" style={styles.loginButtonText}>
                {isLoggingIn ? t('auth.loggingIn', 'Giriş Yapılıyor...') : t('auth.login', 'Giriş Yap')}
              </PaperText>
              {!isLoggingIn && (
                <FontAwesomeIcon 
                  icon={faArrowRight} 
                  size={18} 
                  color="#FFFFFF" 
                  style={styles.loginButtonIcon}
                />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.registerContainer}>
            <PaperText
              variant="bodyMedium"
              style={{ color: themeAsAny.colors.onSurfaceVariant }}
            >
              {t('auth.dontHaveAccount', 'Hesabınız yok mu?')}
            </PaperText>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <PaperText
                variant="titleMedium"
                style={{ color: themeAsAny.colors.primary, marginLeft: 8 }}
              >
                {t('auth.register', 'Kayıt Ol')}
              </PaperText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 32,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginTop: -20,
  },
  formTitle: {
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputIcon: {
    marginRight: 12,
    marginLeft: 4,
    marginTop: 8,
  },
  input: {
    flex: 1,
    marginBottom: 4,
  },
  errorText: {
    marginLeft: 36,
    marginBottom: 12,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 24,
  },
  loginButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loginButtonIcon: {
    marginLeft: 12,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
});

export default LoginScreen;
