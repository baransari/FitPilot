import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  Button,
  Text as PaperText,
  TextInput as PaperTextInput,
} from '../../utils/paperComponents';
import { useTheme } from '../../context/ThemeContext';
import { isValidEmail, isValidPassword } from '../../utils/validation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faArrowLeft, 
  faUserPlus,
  faCheck,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

type RegisterScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

type Props = {
  navigation: RegisterScreenNavigationProp;
};

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const { theme } = useTheme();
  const themeAsAny = theme as any;
  const isDarkMode = themeAsAny.dark;
  const { t } = useTranslation();

  const validateForm = (): boolean => {
    let isValid = true;

    if (!name.trim()) {
      setNameError(t('errors.nameRequired', 'Lütfen adınızı girin'));
      isValid = false;
    } else {
      setNameError('');
    }

    if (!isValidEmail(email)) {
      setEmailError(t('errors.invalidEmail', 'Lütfen geçerli bir e-posta adresi girin'));
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!isValidPassword(password)) {
      setPasswordError(t('errors.weakPassword', 'Şifre en az 6 karakter olmalıdır'));
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError(t('errors.passwordsDontMatch', 'Şifreler eşleşmiyor'));
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }

    return isValid;
  };

  const handleRegister = () => {
    if (!validateForm()) {
      return;
    }

    setIsRegistering(true);

    // Simulation of registration process
    setTimeout(() => {
      setIsRegistering(false);
      Alert.alert(
        t('success', 'Başarılı'), 
        t('auth.registrationComplete', 'Kayıt işlemi tamamlandı'), 
        [
          {
            text: t('ok', 'Tamam'),
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }, 1500);
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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <FontAwesomeIcon 
            icon={faArrowLeft} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>

        <View style={styles.logoCircle}>
          <FontAwesomeIcon 
            icon={faUserPlus} 
            size={40} 
            color="#FFF" 
          />
        </View>
        <PaperText
          variant="headlineMedium"
          style={styles.logoText}
        >
          {t('auth.createAccount', 'Hesap Oluştur')}
        </PaperText>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <FontAwesomeIcon 
                icon={faUser} 
                size={20} 
                color={themeAsAny.colors.primary} 
                style={styles.inputIcon}
              />
              <PaperTextInput
                label={t('auth.name', 'Ad Soyad')}
                value={name}
                onChangeText={(text: string) => {
                  setName(text);
                  if (nameError) setNameError('');
                }}
                mode="outlined"
                style={[styles.input, { backgroundColor: 'transparent' }]}
                error={!!nameError}
                autoCapitalize="words"
                outlineColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
                activeOutlineColor={themeAsAny.colors.primary}
              />
            </View>
            {nameError ? (
              <PaperText
                variant="labelSmall"
                style={[styles.errorText, { color: themeAsAny.colors.error }]}
              >
                {nameError}
              </PaperText>
            ) : null}

            {/* Email Input */}
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
                error={!!emailError}
                keyboardType="email-address"
                autoCapitalize="none"
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

            {/* Password Input */}
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
                error={!!passwordError}
                secureTextEntry
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

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <FontAwesomeIcon 
                icon={faCheck} 
                size={20} 
                color={themeAsAny.colors.primary} 
                style={styles.inputIcon}
              />
              <PaperTextInput
                label={t('auth.confirmPassword', 'Şifre (Tekrar)')}
                value={confirmPassword}
                onChangeText={(text: string) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                mode="outlined"
                style={[styles.input, { backgroundColor: 'transparent' }]}
                error={!!confirmPasswordError}
                secureTextEntry
                outlineColor={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}
                activeOutlineColor={themeAsAny.colors.primary}
              />
            </View>
            {confirmPasswordError ? (
              <PaperText
                variant="labelSmall"
                style={[styles.errorText, { color: themeAsAny.colors.error }]}
              >
                {confirmPasswordError}
              </PaperText>
            ) : null}

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton, 
                { 
                  backgroundColor: themeAsAny.colors.primary,
                  shadowColor: themeAsAny.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                  opacity: isRegistering ? 0.7 : 1
                }
              ]}
              onPress={handleRegister}
              disabled={isRegistering}
            >
              <PaperText variant="titleMedium" style={styles.registerButtonText}>
                {isRegistering ? t('auth.registering', 'Kayıt Yapılıyor...') : t('auth.register', 'Kayıt Ol')}
              </PaperText>
              {!isRegistering && (
                <FontAwesomeIcon 
                  icon={faArrowRight} 
                  size={18} 
                  color="#FFFFFF" 
                  style={styles.registerButtonIcon}
                />
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={() => navigation.navigate('Login')}
          >
            <PaperText
              variant="bodyMedium"
              style={{ color: themeAsAny.colors.onSurfaceVariant }}
            >
              {t('auth.alreadyHaveAccount', 'Zaten hesabınız var mı?')}
            </PaperText>
            <PaperText
              variant="titleMedium"
              style={{ color: themeAsAny.colors.primary, marginLeft: 8 }}
            >
              {t('auth.login', 'Giriş Yap')}
            </PaperText>
          </TouchableOpacity>
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
    paddingBottom: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  registerButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  registerButtonIcon: {
    marginLeft: 12,
  },
  loginLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 12,
  },
});

export default RegisterScreen;
