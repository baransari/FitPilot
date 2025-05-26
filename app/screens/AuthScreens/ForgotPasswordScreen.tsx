import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import {
  Button,
  Text as PaperText,
  TextInput as PaperTextInput,
} from '../../utils/paperComponents';
import { useTheme } from '../../context/ThemeContext';
import { isValidEmail } from '../../utils/validation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faEnvelope, 
  faArrowLeft,
  faShieldAlt,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';

const { width, height } = Dimensions.get('window');

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ForgotPassword'
>;

type Props = {
  navigation: ForgotPasswordScreenNavigationProp;
};

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { theme } = useTheme();
  const themeAsAny = theme as any;
  const isDarkMode = themeAsAny.dark;
  const { t } = useTranslation();

  const validateForm = (): boolean => {
    if (!isValidEmail(email)) {
      setEmailError(t('errors.invalidEmail', 'Lütfen geçerli bir e-posta adresi girin'));
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleResetPassword = () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Şifre sıfırlama başarılı olursa
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        t('success', 'Başarılı'),
        t('auth.resetPasswordEmailSent', 'Bu e-posta adresine sahip bir hesap varsa, şifre sıfırlama talimatlarını alacaksınız.'),
        [
          {
            text: t('ok', 'Tamam'),
            onPress: () => navigation.navigate('Login'),
          },
        ],
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
            icon={faShieldAlt} 
            size={40} 
            color="#FFF" 
          />
        </View>
        <PaperText
          variant="headlineMedium"
          style={styles.logoText}
        >
          {t('auth.resetPassword', 'Şifre Sıfırlama')}
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
              variant="bodyLarge"
              style={[styles.formDescription, { color: themeAsAny.colors.onSurfaceVariant }]}
            >
              {t('auth.resetPasswordInstructions', 'E-posta adresinizi girin ve şifrenizi sıfırlamak için talimatları göndereceğiz.')}
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

            <TouchableOpacity
              style={[
                styles.resetButton, 
                { 
                  backgroundColor: themeAsAny.colors.primary,
                  shadowColor: themeAsAny.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5,
                  opacity: isSubmitting ? 0.7 : 1
                }
              ]}
              onPress={handleResetPassword}
              disabled={isSubmitting}
            >
              <PaperText variant="titleMedium" style={styles.resetButtonText}>
                {isSubmitting 
                  ? t('auth.sending', 'Gönderiliyor...') 
                  : t('auth.sendInstructions', 'Talimatları Gönder')
                }
              </PaperText>
              {!isSubmitting && (
                <FontAwesomeIcon 
                  icon={faPaperPlane} 
                  size={18} 
                  color="#FFFFFF" 
                  style={styles.resetButtonIcon}
                />
              )}
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.loginLink} 
            onPress={() => navigation.navigate('Login')}
          >
            <FontAwesomeIcon 
              icon={faArrowLeft} 
              size={16} 
              color={themeAsAny.colors.primary} 
              style={{ marginRight: 8 }}
            />
            <PaperText
              variant="titleMedium"
              style={{ color: themeAsAny.colors.primary }}
            >
              {t('auth.backToLogin', 'Giriş Ekranına Dön')}
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
  formDescription: {
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
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
  resetButton: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  resetButtonIcon: {
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

export default ForgotPasswordScreen;
