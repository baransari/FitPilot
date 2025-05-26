import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput as RNTextInput,
  PermissionsAndroid,
} from 'react-native';
import { launchImageLibrary, launchCamera, ImagePickerResponse, MediaType } from 'react-native-image-picker';
// Import from paperComponents utility
import {
  Button as PaperButton,
  Card as PaperCard,
  Divider as PaperDivider,
  Avatar,
  Surface,
  Title as PaperTitle,
  Paragraph as PaperParagraph,
  Chip,
} from '../utils/paperComponents';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import {
  faCamera,
  faUserEdit,
  faWeightScale,
  faRulerVertical,
  faCake,
  faFire,
  faChevronRight,
  faFlag,
  faPersonRunning,
  faCog,
  faFileExport,
  faCircleQuestion,
  faRightFromBracket,
  faXmark,
  faImage,
  faTrashCan,
  faCheck,
  faPlus,
  faSync,
  faWater,
  faAppleAlt,
  faDumbbell,
  faBed,
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector } from '../store';
import { RootState } from '../store';
import LoadingComponent from '../components/LoadingComponent';
import { StylesType, User, UserContextType } from '../types';
import useTheme from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';

// Custom Title component
interface TitleProps {
  children: React.ReactNode;
  style?: any;
}
const Title: React.FC<TitleProps> = ({ children, style }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  
  // Safety check for theme
  const textColor = (theme && theme.colors && themeAsAny.colors.onSurface) 
    ? themeAsAny.colors.onSurface 
    : '#000000';
  
  return (
    <Text
      style={[
        {
          fontSize: 20,
          fontWeight: 'bold',
          color: textColor,
          marginBottom: 8,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Custom Paragraph component
interface ParagraphProps {
  children: React.ReactNode;
  style?: any;
}
const Paragraph: React.FC<ParagraphProps> = ({ children, style }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  
  // Safety check for theme
  const textColor = (theme && theme.colors && themeAsAny.colors.onSurfaceVariant) 
    ? themeAsAny.colors.onSurfaceVariant 
    : '#666666';
  
  return (
    <Text
      style={[
        {
          fontSize: 14,
          color: textColor,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

// Custom TextInput component
interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  style?: any;
  underlineColor?: string;
  activeUnderlineColor?: string;
  mode?: 'flat' | 'outlined';
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
}
const TextInput: React.FC<TextInputProps> = ({
  value,
  onChangeText,
  style,
  underlineColor = 'transparent',
  activeUnderlineColor = 'transparent',
  mode = 'flat',
  keyboardType = 'default',
}) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  const [isFocused, setIsFocused] = useState(false);

  // Safety check for theme
  if (!theme || !theme.colors) {
    console.warn('Theme or theme.colors is undefined in TextInput component');
    return (
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        style={[
          {
            backgroundColor: '#f5f5f5',
            fontSize: 16,
            height: 50,
            borderRadius: 8,
            paddingHorizontal: 10,
            borderColor: '#ddd',
            borderWidth: 1,
          },
          style,
        ]}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    );
  }

  return (
    <RNTextInput
      value={value}
      onChangeText={onChangeText}
      style={[
        {
          backgroundColor: '#f5f5f5',
          fontSize: 16,
          height: 50,
          borderRadius: 8,
          paddingHorizontal: 10,
          borderColor: isFocused
            ? activeUnderlineColor !== 'transparent'
              ? activeUnderlineColor
              : themeAsAny.colors?.primary || '#007AFF'
            : underlineColor !== 'transparent'
            ? underlineColor
            : '#ddd',
          borderWidth: 1,
        },
        style,
      ]}
      keyboardType={keyboardType}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    />
  );
};

// Custom Switch component
interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  color?: string;
}
const Switch: React.FC<SwitchProps> = ({ value, onValueChange, color }) => {
  const theme = useTheme();
  const themeAsAny = theme as any;
  
  // Safety check for theme
  const primaryColor = (theme && theme.colors && themeAsAny.colors.primary) 
    ? themeAsAny.colors.primary 
    : '#007AFF';
  
  return (
    <TouchableOpacity
      style={{
        width: 50,
        height: 30,
        borderRadius: 15,
        padding: 2,
        backgroundColor: value ? color || primaryColor : '#ccc',
      }}
      onPress={() => onValueChange(!value)}
    >
      <View
        style={{
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: 'white',
          alignSelf: value ? 'flex-end' : 'flex-start',
        }}
      />
    </TouchableOpacity>
  );
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

const ProfileScreen: React.FunctionComponent<ProfileScreenProps> = () => {
  const { user, updateUser } = useUser() as UserContextType;
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { logout } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const { t } = useTranslation();
  const themeAsAny = theme as any;
  
  // Safety check for theme
  if (!theme || !theme.colors) {
    console.warn('Theme or theme.colors is undefined in ProfileScreen');
    return <LoadingComponent />;
  }
  
  const { colors } = theme;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [tempProfile, setTempProfile] = useState<User | null>(user);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  // Get sleep data from Redux
  const sleepTracker = useAppSelector((state: RootState) => state.sleepTracker);

  // Kullanıcı bilgileri değiştiğinde tempProfile'ı güncelle
  useEffect(() => {
    if (user) {
      setTempProfile(user);
    }
  }, [user]);

  const openEditModal = () => {
    if (user) {
      setTempProfile(user);
      setEditModalVisible(true);
      console.log('Edit modal opened');
    }
  };

  const saveProfile = () => {
    if (user && tempProfile) {
      updateUser({
        ...user, // Preserve existing user data
        name: tempProfile.name || user.name,
        email: tempProfile.email || user.email,
        weight: tempProfile.weight || user.weight,
        height: tempProfile.height || user.height,
        age: tempProfile.age || user.age,
      });
      setEditModalVisible(false);
    }
  };

  const takePicture = async () => {
    try {
      // Android permission check
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: t('profile.cameraAccess', 'Kamera Erişimi'),
            message: 'Bu uygulama profil fotoğrafı çekmek için kamera erişimine ihtiyaç duyuyor.',
            buttonNeutral: 'Daha Sonra Sor',
            buttonNegative: 'İptal',
            buttonPositive: 'Tamam',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Hata', 'Kamera izni verilmedi');
          setAvatarModalVisible(false);
          return;
        }
      }

      const options = {
        mediaType: 'photo' as MediaType,
        includeBase64: false,
        maxHeight: 2000,
        maxWidth: 2000,
        quality: 0.8,
      };

      launchCamera(options, (response: ImagePickerResponse) => {
        if (response.didCancel || response.errorMessage) {
          console.log('Camera cancelled or error:', response.errorMessage);
        } else if (response.assets && response.assets[0]) {
          const imageUri = response.assets[0].uri;
          if (imageUri && user) {
            updateUser({
              profilePhoto: imageUri,
            });
            console.log('Profile photo updated via camera:', imageUri);
          }
        }
        setAvatarModalVisible(false);
      });
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Hata', 'Kamera açılırken bir sorun oluştu');
      setAvatarModalVisible(false);
    }
  };

  const pickImage = () => {
    const options = {
      mediaType: 'photo' as MediaType,
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, (response: ImagePickerResponse) => {
      if (response.didCancel || response.errorMessage) {
        console.log('Gallery cancelled or error:', response.errorMessage);
      } else if (response.assets && response.assets[0]) {
        const imageUri = response.assets[0].uri;
        if (imageUri && user) {
          updateUser({
            profilePhoto: imageUri,
          });
          console.log('Profile photo updated via gallery:', imageUri);
        }
      }
      setAvatarModalVisible(false);
    });
  };

  const removeProfilePhoto = () => {
    if (user) {
      updateUser({
        profilePhoto: null,
      });
      setAvatarModalVisible(false);
    }
  };

  const calculateBMI = () => {
    if (!user?.height || !user?.weight) return null;
    const heightInMeters = user.height / 100;
    const bmi = user.weight / (heightInMeters * heightInMeters);
    return parseFloat(bmi.toFixed(1));
  };

  const getBMICategory = () => {
    const bmi = calculateBMI();
    if (!bmi) return { category: t('profile.notCalculated', 'Hesaplanamadı'), color: '#999' };
    if (bmi < 18.5) return { category: t('profile.bmiUnderweight', 'Zayıf'), color: '#2196F3' };
    if (bmi < 25) return { category: t('profile.bmiNormal', 'Normal'), color: '#4CAF50' };
    if (bmi < 30) return { category: t('profile.bmiOverweight', 'Kilolu'), color: '#FF9800' };
    return { category: t('profile.bmiObese', 'Obez'), color: '#F44336' };
  };

  const calculateBMR = () => {
    if (!user?.weight || !user?.height || !user?.age) return null;
    return 10 * user.weight + 6.25 * user.height - 5 * user.age;
  };

  const bmi = calculateBMI();
  const bmr = calculateBMR();

  const calculateDailyCalorieNeeds = () => {
    const bmr = calculateBMR();
    if (!bmr) return 0;
    // Assuming moderate activity level (1.55 multiplier)
    return Math.round(bmr * 1.55);
  };

  const getGoalText = () => {
    return t('profile.weightLossGoal', 'Kilo vermek (0.5kg/hafta)');
  };

  const getActivityLevelText = () => {
    return t('profile.activityLevelModerate', 'Orta seviye (haftada 3-5 gün)');
  };

  const handleLogout = async () => {
    try {
      const success = await logout();
      if (success) {
        // Navigation will be handled by the logout function
        console.log('User logged out successfully');
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (!user) {
    return <LoadingComponent />;
  }

  const renderProfileInfo = () => (
    <PaperCard style={[styles.card, { 
      backgroundColor: isDarkMode ? '#1E1E2E' : (themeAsAny.colors?.surface || '#FFFFFF'),
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      margin: 16,
      overflow: 'hidden'
    }]}>
      <PaperCard.Content style={styles.cardContent}>
        <View style={styles.sectionTitleContainer}>
          <View style={{
            backgroundColor: `${themeAsAny.colors?.primary || '#007AFF'}20`,
            width: 50, 
            height: 50, 
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: themeAsAny.colors?.primary || '#007AFF',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3
          }}>
            <FontAwesomeIcon icon={faUserEdit as IconProp} size={24} color={themeAsAny.colors?.primary || '#007AFF'} />
          </View>
          <Text style={[styles.cardTitle, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{t('profile.personalInfo', 'Kullanıcı Bilgileri')}</Text>
        </View>

        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={() => setAvatarModalVisible(true)}
          >
            {user.profilePhoto ? (
              <Image
                source={{ uri: user.profilePhoto }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: '#4285F4' }]}>
                <Text style={styles.avatarLetter}>{user.name[0]}</Text>
              </View>
            )}
            <View style={styles.cameraIconOverlay}>
              <FontAwesomeIcon icon={faCamera as IconProp} size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{user.name}</Text>
            <Text style={[styles.profileEmail, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{user.email}</Text>
            
            <TouchableOpacity
              style={[styles.editProfileButton, { backgroundColor: themeAsAny.colors?.primary || '#007AFF' }]}
              onPress={openEditModal}
            >
              <FontAwesomeIcon icon={faUserEdit as IconProp} size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
              <Text style={styles.editProfileButtonText}>{t('profile.editProfile', 'Profili Düzenle')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </PaperCard.Content>
    </PaperCard>
  );

  const renderHealthMetrics = () => {
    // Get the latest sleep data from sleepTracker
    const sleepHours = sleepTracker?.lastSleep?.duration || user.sleepHours || 0;
    const sleepQuality = sleepTracker?.lastSleep?.quality || 'good';

    // Get sleep quality color
    const getSleepQualityColor = (quality: string) => {
      switch (quality) {
        case 'poor':
          return '#FF6B6B';
        case 'fair':
          return '#FFD166';
        case 'good':
          return '#4CAF50';
        case 'excellent':
          return '#118AB2';
        default:
          return '#4CAF50';
      }
    };

    return (
      <PaperCard style={[styles.card, { 
        backgroundColor: isDarkMode ? '#1E1E2E' : (themeAsAny.colors?.surface || '#FFFFFF'),
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        margin: 16,
        overflow: 'hidden'
      }]}>
        <PaperCard.Content style={styles.cardContent}>
          <View style={styles.sectionTitleContainer}>
            <View style={{
              backgroundColor: `${themeAsAny.colors?.primary || '#007AFF'}20`,
              width: 50, 
              height: 50, 
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: themeAsAny.colors?.primary || '#007AFF',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.2,
              shadowRadius: 4,
              elevation: 3
            }}>
              <FontAwesomeIcon icon={faWeightScale as IconProp} size={24} color={themeAsAny.colors?.primary || '#007AFF'} />
            </View>
            <Text style={[styles.cardTitle, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{t('profile.healthMetrics', 'Sağlık Metrikleri')}</Text>
          </View>

          <View style={styles.metricsContainer}>
            <View style={[styles.metricItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(66, 133, 244, 0.05)',
              borderRadius: 16,
              padding: 16,
            }]}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#4285F4' }]}>
                <FontAwesomeIcon icon={faWeightScale as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.metricValue, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{user.weight} kg</Text>
              <Text style={[styles.metricLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.weight', 'Kilo')}</Text>
            </View>
            <View style={[styles.metricItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(76, 175, 80, 0.05)',
              borderRadius: 16,
              padding: 16,
            }]}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#4CAF50' }]}>
                <FontAwesomeIcon icon={faRulerVertical as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.metricValue, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{user.height} cm</Text>
              <Text style={[styles.metricLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.height', 'Boy')}</Text>
            </View>
            <View style={[styles.metricItem, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 152, 0, 0.05)',
              borderRadius: 16,
              padding: 16,
            }]}>
              <View style={[styles.metricIconContainer, { backgroundColor: '#FF9800' }]}>
                <FontAwesomeIcon icon={faCake as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.metricValue, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{user.age}</Text>
              <Text style={[styles.metricLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.age', 'Yaş')}</Text>
            </View>
          </View>

          <PaperDivider style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]} />

          {/* Sleep data section */}
          <View style={[styles.sleepContainer, { 
            backgroundColor: isDarkMode ? 'rgba(63, 81, 181, 0.1)' : 'rgba(63, 81, 181, 0.05)',
            borderRadius: 16,
            marginVertical: 16,
            padding: 16,
          }]}>
            <View style={styles.sleepHeaderContainer}>
              <View style={[styles.sleepIconContainer, { backgroundColor: '#3F51B5' }]}>
                <FontAwesomeIcon icon={faBed as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.sleepHeaderTitle, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{t('sleep.title', 'Uyku Verileri')}</Text>
            </View>

            <View style={styles.sleepDetailsContainer}>
              <View style={styles.sleepDetail}>
                <Text style={[styles.sleepDetailLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('sleep.lastSleepSummary', 'Son Uyku:')}</Text>
                <Text style={[styles.sleepDetailValue, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{sleepHours.toFixed(1)} {t('sleep.hours', 'saat')}</Text>
              </View>

              <View style={styles.sleepDetail}>
                <Text style={[styles.sleepDetailLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('sleep.sleepQuality', 'Kalite:')}</Text>
                <View
                  style={[
                    styles.sleepQualityBadge,
                    { backgroundColor: getSleepQualityColor(sleepQuality) },
                  ]}
                >
                  <Text style={styles.sleepQualityText}>
                    {sleepQuality === 'poor'
                      ? t('sleep.quality.poor', 'Kötü')
                      : sleepQuality === 'fair'
                      ? t('sleep.quality.fair', 'Orta')
                      : sleepQuality === 'good'
                      ? t('sleep.quality.good', 'İyi')
                      : t('sleep.quality.excellent', 'Mükemmel')}
                  </Text>
                </View>
              </View>

              <View style={styles.sleepDetail}>
                <Text style={[styles.sleepDetailLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('sleep.goal', 'Hedef:')}</Text>
                <Text style={[styles.sleepDetailValue, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                  {sleepTracker?.sleepGoal || user.sleepGoal || 8} {t('sleep.hours', 'saat')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.viewSleepDetailsButton}
              onPress={() => navigation.navigate('SleepTracker')}
            >
              <Text style={styles.viewSleepDetailsText}>{t('sleep.viewDetails', 'Uyku detaylarını görüntüle')}</Text>
              <FontAwesomeIcon icon={faChevronRight as IconProp} size={14} color="#4285F4" />
            </TouchableOpacity>
          </View>

          <PaperDivider style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]} />

          <View style={styles.bmiContainer}>
            <View style={styles.bmiInfo}>
              <Text style={[styles.bmiLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.bmi', 'Vücut Kitle İndeksi (BMI)')}</Text>
              <Text style={[styles.bmiValue, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{bmi?.toFixed(1) || '-'}</Text>
              <Text style={[styles.bmiCategory, { color: getBMICategory().color }]}>
                {getBMICategory().category}
              </Text>
            </View>
            <View style={styles.bmiGaugeContainer}>
              <View style={[styles.bmiGauge, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
                <View style={styles.bmiGaugeSegment1} />
                <View style={styles.bmiGaugeSegment2} />
                <View style={styles.bmiGaugeSegment3} />
                <View style={styles.bmiGaugeSegment4} />

                {/* Indicator konumu BMI değerine göre ayarlanıyor */}
                <View
                  style={[
                    styles.bmiIndicator,
                    {
                      left: `${Math.min(
                        Math.max(parseFloat(bmi?.toFixed(1) || '0') - 15, 0) * 4,
                        80,
                      )}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.bmiLegend}>
                <Text style={[styles.bmiLegendText, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.bmiUnderweight', 'Zayıf')}</Text>
                <Text style={[styles.bmiLegendText, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.bmiNormal', 'Normal')}</Text>
                <Text style={[styles.bmiLegendText, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.bmiOverweight', 'Kilolu')}</Text>
                <Text style={[styles.bmiLegendText, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.bmiObese', 'Obez')}</Text>
              </View>
            </View>

            <View style={[styles.calorieInfoContainer, {
              backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
              borderRadius: 16, 
              padding: 16,
              marginTop: 16,
            }]}>
              <View style={styles.calorieInfo}>
                <FontAwesomeIcon icon={faFire as IconProp} size={20} color="#FF9800" />
                <View style={styles.calorieTextContainer}>
                  <Text style={[styles.calorieLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>{t('profile.dailyCalorieNeeds', 'Günlük Kalori İhtiyacı')}</Text>
                  <Text style={[styles.calorieValue, { color: themeAsAny.colors?.onSurface || '#000000' }]}>{calculateDailyCalorieNeeds()} {t('food.calories', 'kalori')}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={[styles.calorieDetailsButton, {
                  backgroundColor: '#FF9800',
                  borderRadius: 8,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                }]}
              >
                <Text style={styles.calorieDetailsButtonText}>{t('details', 'Detaylar')}</Text>
                <FontAwesomeIcon icon={faChevronRight as IconProp} size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </PaperCard.Content>
      </PaperCard>
    );
  };

  const renderGoalsAndActivity = () => (
    <PaperCard style={[styles.card, { 
      backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      margin: 16,
      overflow: 'hidden'
    }]}>
      <PaperCard.Content style={styles.cardContent}>
        <View style={styles.sectionTitleContainer}>
          <View style={{
            backgroundColor: `${themeAsAny.colors.primary}20`,
            width: 50, 
            height: 50, 
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: themeAsAny.colors.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3
          }}>
            <FontAwesomeIcon icon={faFlag as IconProp} size={24} color={themeAsAny.colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: themeAsAny.colors.onSurface }]}>{t('profile.goalsAndActivity', 'Hedefler ve Aktivite')}</Text>
        </View>

        <View style={[styles.goalContainer, {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(66, 133, 244, 0.05)',
          borderRadius: 16,
          padding:
          16,
          marginBottom: 16,
        }]}>
          <View style={styles.goalIconContainer}>
            <FontAwesomeIcon icon={faFlag as IconProp} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('profile.currentGoal', 'Mevcut Hedef')}</Text>
            <Text style={[styles.goalValue, { color: themeAsAny.colors.onSurface }]}>{getGoalText()}</Text>
          </View>
        </View>

        <View style={[styles.goalContainer, {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 152, 0, 0.05)',
          borderRadius: 16,
          padding: 16,
          marginBottom: 16,
        }]}>
          <View style={[styles.goalIconContainer, { backgroundColor: '#FF9800' }]}>
            <FontAwesomeIcon icon={faPersonRunning as IconProp} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.goalInfo}>
            <Text style={[styles.goalLabel, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('profile.activityLevel', 'Aktivite Seviyesi')}</Text>
            <Text style={[styles.goalValue, { color: themeAsAny.colors.onSurface }]}>{getActivityLevelText()}</Text>
          </View>
        </View>

        <View style={[styles.progressSection, {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(76, 175, 80, 0.05)',
          borderRadius: 16,
          padding: 16,
        }]}>
          <Text style={[styles.progressTitle, { color: themeAsAny.colors.onSurface }]}>{t('profile.weeklyProgress', 'Haftalık İlerleme')}</Text>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBarContainer, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${
                      user.totalWorkouts > 0
                        ? Math.min((user.completedWorkouts / user.totalWorkouts) * 100, 100)
                        : 0
                    }%`,
                    backgroundColor: '#4CAF50',
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: themeAsAny.colors.onSurfaceVariant }]}>
              {user.completedWorkouts}/{user.totalWorkouts} {t('profile.workoutsCompleted', 'antrenman tamamlandı')}
            </Text>
          </View>

          <View style={styles.streakContainer}>
            <FontAwesomeIcon icon={faFire as IconProp} size={24} color="#FF5722" />
            <Text style={[styles.streakText, { color: themeAsAny.colors.onSurface }]}>{user.streak || 0} {t('home.streakDays', 'günlük seri!')}</Text>
          </View>
        </View>
      </PaperCard.Content>
    </PaperCard>
  );

  const renderSettings = () => (
    <PaperCard style={[styles.card, { 
      backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
      borderRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 8,
      margin: 16,
      overflow: 'hidden'
    }]}>
      <PaperCard.Content style={styles.cardContent}>
        <View style={styles.sectionTitleContainer}>
          <View style={{
            backgroundColor: `${themeAsAny.colors.primary}20`,
            width: 50, 
            height: 50, 
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: themeAsAny.colors.primary,
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 3
          }}>
            <FontAwesomeIcon icon={faCog as IconProp} size={24} color={themeAsAny.colors.primary} />
          </View>
          <Text style={[styles.cardTitle, { color: themeAsAny.colors.onSurface }]}>{t('settings.title', 'Ayarlar')}</Text>
        </View>

        <TouchableOpacity
          style={[styles.settingItem, {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(66, 133, 244, 0.05)',
            borderRadius: 16,
            marginBottom: 12,
          }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={styles.settingIconContainer}>
            <FontAwesomeIcon icon={faCog as IconProp} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: themeAsAny.colors.onSurface }]}>{t('settings.appSettings', 'Uygulama Ayarları')}</Text>
            <Text style={[styles.settingDescription, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('settings.appSettingsDescription', 'Bildirimler, karanlık mod ve daha fazlası')}</Text>
          </View>
          <FontAwesomeIcon icon={faChevronRight as IconProp} size={20} color={themeAsAny.colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(76, 175, 80, 0.05)',
          borderRadius: 16,
          marginBottom: 12,
        }]}>
          <View style={[styles.settingIconContainer, { backgroundColor: '#4CAF50' }]}>
            <FontAwesomeIcon icon={faFileExport as IconProp} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: themeAsAny.colors.onSurface }]}>{t('profile.exportData', 'Verileri Dışa Aktar')}</Text>
            <Text style={[styles.settingDescription, { color: themeAsAny.colors.onSurfaceVariant }]}>
              {t('profile.exportDataDescription', 'Egzersiz ve sağlık verilerinizi dışa aktarın')}
            </Text>
          </View>
          <FontAwesomeIcon icon={faChevronRight as IconProp} size={20} color="#4CAF50" />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.settingItem, {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(33, 150, 243, 0.05)',
          borderRadius: 16,
          marginBottom: 12,
        }]}>
          <View style={[styles.settingIconContainer, { backgroundColor: '#2196F3' }]}>
            <FontAwesomeIcon icon={faCircleQuestion as IconProp} size={20} color="#FFFFFF" />
          </View>
          <View style={styles.settingTextContainer}>
            <Text style={[styles.settingTitle, { color: themeAsAny.colors.onSurface }]}>{t('profile.helpSupport', 'Yardım ve Destek')}</Text>
            <Text style={[styles.settingDescription, { color: themeAsAny.colors.onSurfaceVariant }]}>{t('profile.helpSupportDescription', 'SSS ve destek bilgileri')}</Text>
          </View>
          <FontAwesomeIcon icon={faChevronRight as IconProp} size={20} color="#2196F3" />
        </TouchableOpacity>

        <View style={[styles.healthDataContainer, {
          backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.03)',
          borderRadius: 16,
          padding: 16,
          marginTop: 16,
          marginBottom: 16,
        }]}>
          <View style={styles.sectionTitleContainer}>
            <View style={{
              backgroundColor: `${themeAsAny.colors.primary}20`,
              width: 40, 
              height: 40, 
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: themeAsAny.colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 2
            }}>
              <FontAwesomeIcon icon={faSync as IconProp} size={20} color={themeAsAny.colors.primary} />
            </View>
            <Text style={[styles.healthDataTitle, { color: themeAsAny.colors.onSurface }]}>{t('profile.healthDataSummary', 'Sağlık Verileri Özeti')}</Text>
          </View>

          <View style={[styles.adviceContainer, { 
            backgroundColor: isDarkMode ? 'rgba(3, 169, 244, 0.1)' : 'rgba(3, 169, 244, 0.05)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(3, 169, 244, 0.2)' : 'rgba(3, 169, 244, 0.1)',
            borderRadius: 12,
          }]}>
            <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
              <FontAwesomeIcon icon={faWater as IconProp} size={20} color="#03A9F4" />
            </View>
            <View style={styles.adviceContent}>
              <Text style={[styles.adviceText, { color: themeAsAny.colors.onSurface }]}>
                <Text style={{ fontWeight: 'bold' }}>{t('water.title', 'Su Tüketimi')}:</Text> {t('profile.dailyWaterConsumption', 'Günlük')}{' '}
                {((user.waterIntake || 0) * 1000).toFixed(0)}ml / {((user.waterGoal || 0) * 1000).toFixed(0)}ml
              </Text>
            </View>
          </View>

          <View style={[styles.adviceContainer, { 
            backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
            borderRadius: 12,
          }]}>
            <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
              <FontAwesomeIcon icon={faAppleAlt as IconProp} size={20} color="#4CAF50" />
            </View>
            <View style={styles.adviceContent}>
              <Text style={[styles.adviceText, { color: themeAsAny.colors.onSurface }]}>
                <Text style={{ fontWeight: 'bold' }}>{t('food.title', 'Beslenme')}:</Text> {t('profile.dailyCalorieConsumption', 'Günlük')}{' '}
                {user.calories || 0} /{' '}
                {user.caloriesGoal || 0} {t('food.calories', 'kalori')} {t('profile.consumption', 'alımı')}
              </Text>
            </View>
          </View>

          <View style={[styles.adviceContainer, { 
            backgroundColor: isDarkMode ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
            borderWidth: 1,
            borderColor: isDarkMode ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 152, 0, 0.1)',
            borderRadius: 12,
            marginBottom: 0,
          }]}>
            <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
              <FontAwesomeIcon icon={faDumbbell as IconProp} size={20} color="#FF9800" />
            </View>
            <View style={styles.adviceContent}>
              <Text style={[styles.adviceText, { color: themeAsAny.colors.onSurface }]}>
                <Text style={{ fontWeight: 'bold' }}>{t('exercise.title', 'Egzersiz')}:</Text> {user.completedWorkouts || 0} /{' '}
                {user.totalWorkouts || 0} {t('profile.workoutsCompleted', 'antrenman tamamlandı')}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, {
            backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
            borderRadius: 12,
            padding: 14,
            marginTop: 4,
          }]}
          onPress={handleLogout}
        >
          <FontAwesomeIcon icon={faRightFromBracket as IconProp} size={20} color="#F44336" />
          <Text style={styles.logoutButtonText}>{t('settings.logout', 'Çıkış Yap')}</Text>
        </TouchableOpacity>
      </PaperCard.Content>
    </PaperCard>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: themeAsAny.colors.background }]}>
      {/* Header Section - Modern and vibrant design */}
      <View style={[styles.headerContainer, { backgroundColor: themeAsAny.colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              Merhaba
            </Text>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>
              {user.name}
            </Text>
            <Text style={[styles.headerInfo, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {new Date().toLocaleDateString('tr-TR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setAvatarModalVisible(true)}>
            <View style={styles.avatarHeaderContainer}>
              {user.profilePhoto ? (
                <Image
                  source={{ uri: user.profilePhoto }}
                  style={{ width: '100%', height: '100%', borderRadius: 32.5 }}
                />
              ) : (
                <View style={[styles.avatarHeaderPlaceholder]}>
                  <Text style={styles.avatarHeaderLetter}>{user.name[0]}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Streak Chip */}
        <Chip
          icon={({ size, color }: { size: number; color: string }) => (
            <FontAwesomeIcon icon={faFire as IconProp} size={size} color="#FF9800" />
          )}
          style={[styles.streakChip, { 
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.5)'
          }]}
          textStyle={[styles.streakChipText, { color: '#fff' }]}
        >
          {user.streak || 5} {t('home.streakDays', 'günlük seri!')}
        </Chip>
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderProfileInfo()}
        {renderHealthMetrics()}
        {renderGoalsAndActivity()}
        {renderSettings()}
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 12
          }]}>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: themeAsAny.colors.onSurface }]}>{t('profile.editProfile', 'Profili Düzenle')}</Text>
                <TouchableOpacity
                  onPress={() => setEditModalVisible(false)}
                  style={styles.closeButton}
                >
                  <FontAwesomeIcon icon={faXmark as IconProp} size={24} color={themeAsAny.colors.onSurfaceVariant} />
                </TouchableOpacity>
              </View>

              {tempProfile && (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeAsAny.colors.onSurface }]}>{t('profile.name', 'Ad Soyad')}</Text>
                    <TextInput
                      value={tempProfile.name}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, name: text })
                      }
                      style={[styles.input, {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        color: themeAsAny.colors.onSurface
                      }]}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      mode="flat"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeAsAny.colors.onSurface }]}>{t('profile.email', 'E-posta')}</Text>
                    <TextInput
                      value={tempProfile.email}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, email: text })
                      }
                      style={[styles.input, {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        color: themeAsAny.colors.onSurface
                      }]}
                      underlineColor="transparent"
                      activeUnderlineColor="transparent"
                      mode="flat"
                      keyboardType="email-address"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeAsAny.colors.onSurface }]}>{t('profile.weight', 'Kilo')} (kg)</Text>
                    <TextInput
                      value={tempProfile.weight?.toString() || ''}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, weight: parseFloat(text) || 0 })
                      }
                      keyboardType="numeric"
                      style={[styles.input, {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        color: themeAsAny.colors.onSurface
                      }]}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeAsAny.colors.onSurface }]}>{t('profile.height', 'Boy')} (cm)</Text>
                    <TextInput
                      value={tempProfile.height?.toString() || ''}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, height: parseFloat(text) || 0 })
                      }
                      keyboardType="numeric"
                      style={[styles.input, {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        color: themeAsAny.colors.onSurface
                      }]}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Text style={[styles.inputLabel, { color: themeAsAny.colors.onSurface }]}>{t('profile.age', 'Yaş')}</Text>
                    <TextInput
                      value={tempProfile.age?.toString() || ''}
                      onChangeText={(text: string) =>
                        setTempProfile({ ...tempProfile, age: parseInt(text) || 0 })
                      }
                      keyboardType="numeric"
                      style={[styles.input, {
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)',
                        color: themeAsAny.colors.onSurface
                      }]}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={[styles.saveButton, { 
                  backgroundColor: themeAsAny.colors.primary,
                  shadowColor: themeAsAny.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5
                }]}
                onPress={saveProfile}
              >
                <FontAwesomeIcon icon={faCheck as IconProp} size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>{t('save', 'Kaydet')}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Avatar Change Modal */}
      <Modal
        visible={avatarModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAvatarModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.avatarModalContent, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : themeAsAny.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 12
          }]}>
            <Text style={[styles.modalTitle, { color: themeAsAny.colors.onSurface }]}>{t('profile.profilePhoto', 'Profil Fotoğrafı')}</Text>

            <TouchableOpacity 
              style={[styles.avatarOption, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(66, 133, 244, 0.05)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(66, 133, 244, 0.1)'
              }]} 
              onPress={takePicture}
            >
              <View style={[styles.avatarOptionIcon, { backgroundColor: '#4285F4' }]}>
                <FontAwesomeIcon icon={faCamera as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.avatarOptionText, { color: themeAsAny.colors.onSurface }]}>{t('profile.takePhoto', 'Fotoğraf Çek')}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.avatarOption, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(76, 175, 80, 0.05)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(76, 175, 80, 0.1)'
              }]} 
              onPress={pickImage}
            >
              <View style={[styles.avatarOptionIcon, { backgroundColor: '#4CAF50' }]}>
                <FontAwesomeIcon icon={faImage as IconProp} size={24} color="#FFFFFF" />
              </View>
              <Text style={[styles.avatarOptionText, { color: themeAsAny.colors.onSurface }]}>{t('profile.chooseFromGallery', 'Galeriden Seç')}</Text>
            </TouchableOpacity>

            {user.profilePhoto && (
              <TouchableOpacity 
                style={[styles.avatarOption, { 
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(244, 67, 54, 0.05)',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(244, 67, 54, 0.1)'
                }]} 
                onPress={removeProfilePhoto}
              >
                <View style={[styles.avatarOptionIcon, { backgroundColor: '#F44336' }]}>
                  <FontAwesomeIcon icon={faTrashCan as IconProp} size={24} color="#FFFFFF" />
                </View>
                <Text style={[styles.avatarOptionText, { color: themeAsAny.colors.onSurface }]}>{t('profile.removePhoto', 'Fotoğrafı Kaldır')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.cancelButton, { 
                borderColor: themeAsAny.colors.outline,
                marginTop: 20
              }]}
              onPress={() => setAvatarModalVisible(false)}
            >
              <Text style={{ color: themeAsAny.colors.primary, textAlign: 'center', fontWeight: 'bold' }}>{t('cancel', 'İptal')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create<StylesType>({
  safeArea: {
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
  avatarHeaderContainer: {
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
    backgroundColor: '#4285F4',
  },
  avatarHeaderPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 32.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4285F4',
  },
  avatarHeaderLetter: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
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
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 30,
  },
  card: {
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
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
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileEmail: {
    fontSize: 16,
    marginTop: 4,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editProfileButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginRight: 16,
    position: 'relative',
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 30,
    fontWeight: 'bold' as const,
    color: 'white',
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: 'bold' as const,
    marginBottom: 10,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: 5,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
  },
  divider: {
    marginVertical: 10,
  },
  bmiContainer: {
    marginTop: 10,
  },
  bmiInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 14,
    color: '#666',
  },
  bmiValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  bmiCategory: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  bmiGaugeContainer: {
    marginTop: 10,
  },
  bmiGauge: {
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bmiGaugeSegment1: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  bmiGaugeSegment2: {
    height: '100%',
    backgroundColor: '#2196F3',
  },
  bmiGaugeSegment3: {
    height: '100%',
    backgroundColor: '#FF9800',
  },
  bmiGaugeSegment4: {
    height: '100%',
    backgroundColor: '#F44336',
  },
  bmiIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    position: 'absolute',
    top: 5,
  },
  bmiLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  bmiLegendText: {
    fontSize: 12,
    color: '#666',
  },
  calorieInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieTextContainer: {
    marginLeft: 12,
  },
  calorieLabel: {
    fontSize: 14,
    color: '#666',
  },
  calorieValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  calorieDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calorieDetailsButtonText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginRight: 5,
  },
  goalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  goalIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  goalInfo: {
    flex: 1,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: 'bold' as const,
  },
  goalValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  progressSection: {
    marginTop: 10,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
  },
  progressText: {
    marginLeft: 10,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  streakText: {
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#F44336',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  avatarModalContent: {
    padding: 24,
    width: '90%',
  },
  modalTitle: {
    textAlign: 'center',
    fontWeight: 'bold' as const,
    fontSize: 22,
    flex: 1,
  },
  inputContainer: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    marginBottom: 5,
    color: '#555',
  },
  input: {
    backgroundColor: '#f5f5f5',
    fontSize: 16,
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 10,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 8,
    borderRadius: 8,
  },
  avatarOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatarOptionText: {
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '600',
  },
  avatarOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
  },
  modalScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 20,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    padding: 5,
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 10,
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  settingsOptionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
  settingsOptionTextContainer: {
    flex: 1,
  },
  settingsOptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingsOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  settingsDivider: {
    height: 1,
  },
  sleepContainer: {
    marginVertical: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  sleepHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sleepIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3F51B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sleepHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sleepDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sleepDetail: {
    alignItems: 'center',
  },
  sleepDetailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  sleepDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sleepQualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sleepQualityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  viewSleepDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  viewSleepDetailsText: {
    color: '#4285F4',
    marginRight: 4,
    fontSize: 14,
  },
  adviceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#f8f8f8',
  },
  adviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4285F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  adviceContent: {
    flex: 1,
  },
  adviceText: {
    fontSize: 16,
    color: '#666',
  },
  healthDataContainer: {
    marginTop: 16,
  },
  healthDataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});

export default ProfileScreen;
