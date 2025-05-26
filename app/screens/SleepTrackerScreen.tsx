import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  SafeAreaView,
  Image,
  Switch,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph, 
  Button,
  Divider,
  Surface,
  Chip,
  ProgressBar,
} from '../utils/paperComponents';
import { useAppSelector, useAppDispatch } from '../store';
import { RootState } from '../store';
import {
  addSleepEntry,
  loadSleepData,
  setSleepGoal,
  setSleepEntries,
  SleepEntry,
} from '../store/sleepTrackerSlice';
import DateTimePicker from '@react-native-community/datetimepicker';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
  faBed, 
  faPlus, 
  faMoon, 
  faSun, 
  faClock,
  faCalendarCheck,
  faChartLine,
  faLightbulb,
  faBrain,
  faHistory,
  faHeartbeat,
  faChartBar,
  faCheck,
  faClose,
  faHandSparkles,
  faHourglass,
  faCalendarAlt,
  faCog,
  faMagic,
  faRobot,
} from '@fortawesome/free-solid-svg-icons';
import StorageService from '../services/StorageService';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../hooks/useTheme';
import useSleepDetector from '../hooks/useSleepDetector';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

interface SleepTrackerScreenProps {
  navigation: any;
}

const SleepTrackerScreen: React.FC<SleepTrackerScreenProps> = ({ navigation }) => {
  const dispatch = useAppDispatch();
  const { entries, lastSleep, averageDuration, sleepGoal, loading } = useAppSelector(
    (state: RootState) => state.sleepTracker,
  );
  
  const { theme, isDarkMode } = useTheme();
  const themeAsAny = theme as any;
  
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [newSleepEntry, setNewSleepEntry] = useState<Partial<SleepEntry>>({
    date: new Date().toISOString().split('T')[0],
    startTime: '23:00',
    endTime: '07:00',
    duration: 8,
    quality: 'good',
  });

  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  
  // Uyku algılama hook'unu kullan
  const { isEnabled, isDetecting, toggleSleepDetection, detectSleepManually } = useSleepDetector();

  // Ekran her odaklandığında verileri yenile
  useFocusEffect(
    React.useCallback(() => {
      console.log('SleepTrackerScreen is now focused, loading data...');
      dispatch(loadSleepData());
      return () => {
        // Ekrandan ayrılınca yapılacak temizleme işlemi
        console.log('SleepTrackerScreen is unfocused');
      };
    }, [dispatch]),
  );

  // Komponent mount olduğunda verileri yükle
  useEffect(() => {
    // Load sleep data when component mounts
    dispatch(loadSleepData());
  }, [dispatch]);

  const calculateAverageSleepDuration = () => {
    return averageDuration.toFixed(1);
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'poor':
        return '#FF6B6B';
      case 'fair':
        return '#FFD166';
      case 'good':
        return '#06D6A0';
      case 'excellent':
        return '#118AB2';
      default:
        return '#ccc';
    }
  };

  const getQualityEmoji = (quality: string) => {
    switch (quality) {
      case 'poor':
        return '😴';
      case 'fair':
        return '😐';
      case 'good':
        return '😊';
      case 'excellent':
        return '😃';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { day: 'numeric', month: 'long', weekday: 'long' });
  };

  // Get the formatted date for header
  const getFormattedDate = () => {
    return new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  // AI Öneri oluşturma
  const getSleepRecommendation = () => {
    const avgDuration = parseFloat(calculateAverageSleepDuration());

    if (avgDuration < 7) {
      return t('sleep.recommendations.tooLittle', 'Uyku süreniz önerilen 7-9 saat aralığının altında. Uyku kalitenizi artırmak için daha erken yatmayı deneyebilirsiniz.');
    } else if (avgDuration > 9) {
      return t('sleep.recommendations.tooMuch', 'Uyku süreniz önerilen 7-9 saat aralığının üzerinde. Aşırı uyku da yorgunluğa neden olabilir.');
    } else {
      return t('sleep.recommendations.ideal', 'Uyku süreniz ideal aralıkta. Düzenli uyku saatlerinizi korumaya devam edin.');
    }
  };

  const handleAddSleepEntry = () => {
    try {
      // Validate input
      if (!newSleepEntry.startTime || !newSleepEntry.endTime) {
        Alert.alert('Hata', 'Yatış ve kalkış saatlerini girmelisiniz.');
        return;
      }

      // Calculate duration based on bed time and wake time
      const bedHour = parseInt(newSleepEntry.startTime?.split(':')[0] || '0');
      const bedMinute = parseInt(newSleepEntry.startTime?.split(':')[1] || '0');
      const wakeHour = parseInt(newSleepEntry.endTime?.split(':')[0] || '0');
      const wakeMinute = parseInt(newSleepEntry.endTime?.split(':')[1] || '0');

      let duration = wakeHour - bedHour + (wakeMinute - bedMinute) / 60;
      // If wake time is earlier than bed time, add 24 hours
      if (duration < 0) {
        duration += 24;
      } else if (duration > 24) {
        Alert.alert('Hata', 'Uyku süresi 24 saatten fazla olamaz.');
        return;
      }
      duration = parseFloat(duration.toFixed(2));

      // Bugünün tarihini YYYY-MM-DD formatında al
      const today = new Date().toISOString().split('T')[0];

      // Validate quality
      if (!newSleepEntry.quality) {
        Alert.alert('Hata', 'Uyku kalitesini seçmelisiniz.');
        return;
      }

      const entry: SleepEntry = {
        id: uuidv4(), // Benzersiz ID
        date: today, // Bugünün tarihi
        startTime: newSleepEntry.startTime || '23:00',
        endTime: newSleepEntry.endTime || '07:00',
        duration: duration,
        quality: (newSleepEntry.quality as 'poor' | 'fair' | 'good' | 'excellent') || 'good',
      };

      // Yeni kaydı Redux store'a ekle
      dispatch(addSleepEntry(entry));

      // Verileri yeniden yükle - reduxtan sonra async storage'da saklamak için
      setTimeout(() => {
        dispatch(loadSleepData());
      }, 300);

      setModalVisible(false);

      // Kullanıcıya detaylı geri bildirim göster
      Alert.alert(
        'Uyku Kaydı Eklendi',
        `${entry.startTime} - ${entry.endTime} arasında ${entry.duration.toFixed(
          1,
        )} saat uyku kaydedildi.`,
        [
          {
            text: 'Tamam',
            onPress: () => console.log('Sleep entry added confirmation'),
          },
        ],
      );

      // Reset form - bir sonraki giriş için hazırla
      setNewSleepEntry({
        date: today,
        startTime: '23:00',
        endTime: '07:00',
        duration: 8,
        quality: 'good',
      });
    } catch (error) {
      console.error('Uyku verisi eklenirken hata oluştu:', error);
      Alert.alert('Hata', 'Uyku verisi eklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowStartTimePicker(Platform.OS === 'ios');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    setNewSleepEntry({ ...newSleepEntry, startTime: `${hours}:${minutes}` });
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    setShowEndTimePicker(Platform.OS === 'ios');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    setNewSleepEntry({ ...newSleepEntry, endTime: `${hours}:${minutes}` });
  };

  // Render date picker based on platform
  const renderDateTimePicker = (
    visible: boolean,
    value: string,
    onChange: (event: any, date?: Date) => void,
  ) => {
    if (Platform.OS === 'ios') {
      // iOS her zaman gösterilir, modal içinde
      return visible ? (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = (value || '').split(':');
            const date = new Date();
            date.setHours(parseInt(hours || '0'));
            date.setMinutes(parseInt(minutes || '0'));
            return date;
          })()}
          mode="time"
          is24Hour={true}
          display="spinner"
          onChange={onChange}
        />
      ) : null;
    } else {
      // Android için popup tarzında
      return visible ? (
        <DateTimePicker
          value={(() => {
            const [hours, minutes] = (value || '').split(':');
            const date = new Date();
            date.setHours(parseInt(hours || '0'));
            date.setMinutes(parseInt(minutes || '0'));
            return date;
          })()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onChange}
        />
      ) : null;
    }
  };

  // Uyku sensörü durumunu açıklayan metin
  const getSleepDetectionStatusText = () => {
    if (isEnabled) {
      return isDetecting 
        ? "Uyku algılama aktif: Uyku takip ediliyor" 
        : "Uyku algılama aktif: Uyku bekleniyor";
    }
    return "Uyku algılama devre dışı";
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header Section - Modern and vibrant design */}
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {t('sleep.healthyLife', 'Sağlıklı Yaşam')}
            </Text>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>
              {t('sleep.title')}
            </Text>
            <Text style={[styles.headerInfo, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {getFormattedDate()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setSettingsModalVisible(true)}>
            <View style={styles.avatarContainer}>
              <FontAwesomeIcon icon={faCog} size={24} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Sleep Goal Chip and Detection Status */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <Chip
            icon={({ size, color }: { size: number; color: string }) => (
              <FontAwesomeIcon icon={faMoon} size={size} color="#8A2BE2" />
            )}
            style={[styles.goalChip, { 
              backgroundColor: 'rgba(255, 255, 255, 0.25)',
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.5)'
            }]}
            textStyle={[styles.goalChipText, { color: '#fff' }]}
          >
            {t('sleep.goal')}: {sleepGoal || 8} {t('sleep.hours')}
          </Chip>
          
          {isEnabled && (
            <Chip
              icon={({ size, color }: { size: number; color: string }) => (
                <FontAwesomeIcon icon={faRobot} size={size} color={isDetecting ? "#4CAF50" : "#FF9800"} />
              )}
              style={[styles.goalChip, { 
                backgroundColor: 'rgba(255, 255, 255, 0.25)',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.5)'
              }]}
              textStyle={[styles.goalChipText, { color: '#fff' }]}
            >
              {isDetecting ? t('sleep.tracking', 'Takip ediliyor') : t('sleep.active', 'Aktif')}
            </Chip>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {loading ? (
          <Card style={[styles.card, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            margin: 16
          }]}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.loadingContainer}>
                <Text style={{ color: theme.colors.onSurface }}>{t('sleep.loading', 'Uyku verileri yükleniyor...')}</Text>
              </View>
            </Card.Content>
          </Card>
        ) : lastSleep ? (
          <Card style={[styles.card, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            margin: 16
          }]}>
            <Card.Content style={styles.cardContent}>
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
                  <FontAwesomeIcon icon={faBed} size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('sleep.lastSleepSummary', 'Son Uyku Özeti')}</Text>
              </View>
              
              <View style={styles.sleepSummary}>
                <View style={styles.sleepTime}>
                  <View style={[styles.timeIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                    <FontAwesomeIcon icon={faMoon} size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.timeLabel, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.bedTime')}</Text>
                  <Text style={[styles.timeValue, { color: theme.colors.onSurface }]}>{lastSleep.startTime}</Text>
                </View>
                
                <View style={styles.sleepDuration}>
                  <Text style={[styles.durationValue, { color: theme.colors.primary }]}>{lastSleep.duration}{t('sleep.hourShort', 's')}</Text>
                  <View style={[styles.durationIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                    <FontAwesomeIcon icon={faHourglass} size={20} color={theme.colors.primary} />
                  </View>
                </View>
                
                <View style={styles.sleepTime}>
                  <View style={[styles.timeIconContainer, { backgroundColor: `${theme.colors.primary}15` }]}>
                    <FontAwesomeIcon icon={faSun} size={20} color={theme.colors.primary} />
                  </View>
                  <Text style={[styles.timeLabel, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.wakeTime')}</Text>
                  <Text style={[styles.timeValue, { color: theme.colors.onSurface }]}>{lastSleep.endTime}</Text>
                </View>
              </View>
              
              <View style={[styles.qualityContainer, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)' }]}>
                <View style={[styles.qualityIconContainer, { backgroundColor: getQualityColor(lastSleep.quality) }]}>
                  <Text style={styles.qualityEmoji}>{getQualityEmoji(lastSleep.quality)}</Text>
                </View>
                <View style={styles.qualityTextContainer}>
                  <Text style={[styles.qualityLabel, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.sleepQuality')}</Text>
                  <Text style={[styles.qualityValue, { color: getQualityColor(lastSleep.quality) }]}>
                    {lastSleep.quality === 'poor'
                      ? t('sleep.quality.poor', 'Kötü')
                      : lastSleep.quality === 'fair'
                      ? t('sleep.quality.fair', 'Orta')
                      : lastSleep.quality === 'good'
                      ? t('sleep.quality.good', 'İyi')
                      : t('sleep.quality.excellent', 'Mükemmel')}
                  </Text>
                </View>
              </View>
              
              {/* Progress towards sleep goal */}
              <View style={styles.sleepGoalContainer}>
                <View style={styles.sleepGoalHeader}>
                  <Text style={[styles.sleepGoalText, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.dailyGoal')}: {sleepGoal} {t('sleep.hours')}</Text>
                  <Text style={[styles.sleepGoalPercentage, { color: theme.colors.primary }]}>
                    {Math.min(Math.round((lastSleep.duration / sleepGoal) * 100), 100)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={Math.min(lastSleep.duration / sleepGoal, 1)}
                  color={theme.colors.primary}
                  style={styles.sleepGoalProgressBar}
                />
              </View>
            </Card.Content>
          </Card>
        ) : (
          <Card style={[styles.card, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 8,
            margin: 16
          }]}>
            <Card.Content style={styles.cardContent}>
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
                  <FontAwesomeIcon icon={faBed} size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('sleep.noRecordFound', 'Uyku Kaydı Bulunamadı')}</Text>
              </View>
              <Text style={[styles.emptyStateText, { color: theme.colors.onSurfaceVariant }]}>
                {t('sleep.noRecordMessage', 'Henüz bir uyku kaydınız bulunmuyor. İlk uyku kaydınızı eklemek için aşağıdaki butonu kullanabilirsiniz.')}
              </Text>
            </Card.Content>
          </Card>
        )}

        {/* Sleep Statistics Card */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          margin: 16,
          marginTop: 8
        }]}>
          <Card.Content style={styles.cardContent}>
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
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('sleep.statistics', 'Uyku İstatistikleri')}</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(30, 136, 229, 0.1)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 136, 229, 0.2)',
              }]}>
                <View style={styles.statIconContainer}>
                  <FontAwesomeIcon icon={faClock} size={20} color="#1E88E5" />
                </View>
                <Text style={styles.statLabel}>{t('sleep.averageDuration', 'Ortalama Süre')}</Text>
                <Text style={[styles.statValue, { color: "#1E88E5" }]}>{calculateAverageSleepDuration()}{t('sleep.hourShort', 's')}</Text>
              </View>
              
              <View style={[styles.statCard, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 87, 34, 0.1)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 87, 34, 0.2)',
              }]}>
                <View style={styles.statIconContainer}>
                  <FontAwesomeIcon icon={faCalendarCheck} size={20} color="#FF5722" />
                </View>
                <Text style={styles.statLabel}>{t('sleep.recordCount', 'Kayıt Sayısı')}</Text>
                <Text style={[styles.statValue, { color: "#FF5722" }]}>{entries.length}</Text>
              </View>
              
              <View style={[styles.statCard, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(76, 175, 80, 0.1)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(76, 175, 80, 0.2)',
              }]}>
                <View style={styles.statIconContainer}>
                  <FontAwesomeIcon icon={faHeartbeat} size={20} color="#4CAF50" />
                </View>
                <Text style={styles.statLabel}>{t('sleep.sleepQuality')}</Text>
                <Text style={[styles.statValue, { color: "#4CAF50" }]}>
                  {entries.length > 0 ? 
                    (entries[0].quality === 'poor' ? t('sleep.quality.poor', 'Kötü') :
                    entries[0].quality === 'fair' ? t('sleep.quality.fair', 'Orta') :
                    entries[0].quality === 'good' ? t('sleep.quality.good', 'İyi') : 
                    t('sleep.quality.excellent', 'Mükemmel'))
                    : '---'}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* AI Recommendations Card */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          margin: 16,
          marginTop: 8
        }]}>
          <Card.Content style={styles.cardContent}>
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
                <FontAwesomeIcon icon={faBrain} size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('sleep.aiRecommendations', 'AI Uyku Tavsiyeleri')}</Text>
            </View>
            
            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(255, 193, 7, 0.1)' : 'rgba(255, 193, 7, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
              borderRadius: 16,
              padding:
              16,
              marginBottom: 16
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faLightbulb} size={22} color="#FFC107" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: theme.colors.onSurface }]}>
                  {getSleepRecommendation()}
                </Text>
              </View>
            </View>

            <View style={[styles.adviceContainer, { 
              backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
              borderWidth: 1,
              borderColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
              borderRadius: 16,
              padding: 16
            }]}>
              <View style={[styles.adviceIcon, { backgroundColor: isDarkMode ? '#1E1E2E' : '#fff' }]}>
                <FontAwesomeIcon icon={faMoon} size={22} color="#4CAF50" />
              </View>
              <View style={styles.adviceContent}>
                <Text style={[styles.adviceText, { color: theme.colors.onSurface }]}>
                  {t('sleep.generalAdvice', 'Daha iyi bir uyku için yatmadan 1 saat önce ekranlardan uzak durun ve kafein tüketimini öğleden sonra sınırlayın. Ayrıca yatak odasının karanlık ve serin (18-20°C) olması önemlidir.')}
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Sleep History Section */}
        <View style={styles.historyHeaderContainer}>
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
              <FontAwesomeIcon icon={faHistory} size={24} color={theme.colors.primary} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('sleep.history', 'Uyku Geçmişi')}</Text>
          </View>
        </View>

        {entries.length > 0 ? (
          entries.map(entry => (
            <Card key={entry.id} style={[styles.card, { 
              backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
              borderRadius: 24,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 12,
              elevation: 8,
              margin: 16,
              marginTop: 8,
              marginBottom: 12
            }]}>
              <Card.Content style={styles.cardContent}>
                <View style={styles.historyHeader}>
                  <View style={styles.historyDateContainer}>
                    <FontAwesomeIcon icon={faCalendarAlt} size={16} color={theme.colors.primary} style={{ marginRight: 8 }} />
                    <Text style={[styles.historyDate, { color: theme.colors.onSurface }]}>{formatDate(entry.date)}</Text>
                  </View>
                  <View
                    style={[
                      styles.historyQuality,
                      { backgroundColor: getQualityColor(entry.quality) },
                    ]}
                  >
                    <Text style={styles.historyQualityText}>
                      {entry.quality === 'poor'
                        ? t('sleep.quality.poor', 'Kötü')
                        : entry.quality === 'fair'
                        ? t('sleep.quality.fair', 'Orta')
                        : entry.quality === 'good'
                        ? t('sleep.quality.good', 'İyi')
                        : t('sleep.quality.excellent', 'Mükemmel')}
                    </Text>
                  </View>
                </View>
                <Divider style={[styles.divider, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)' }]} />
                <View style={styles.historyDetails}>
                  <View style={styles.historyTime}>
                    <FontAwesomeIcon icon={faMoon} size={16} color={theme.colors.primary} />
                    <Text style={[styles.historyTimeText, { color: theme.colors.onSurface }]}>{entry.startTime}</Text>
                  </View>
                  <View style={[styles.historyDuration, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : theme.colors.surfaceVariant }]}>
                    <Text style={[styles.historyDurationText, { color: theme.colors.onSurfaceVariant }]}>{entry.duration} {t('sleep.hours')}</Text>
                  </View>
                  <View style={styles.historyTime}>
                    <FontAwesomeIcon icon={faSun} size={16} color={theme.colors.primary} />
                    <Text style={[styles.historyTimeText, { color: theme.colors.onSurface }]}>{entry.endTime}</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))
        ) : (
          <View style={styles.emptyHistoryContainer}>
            <Text style={[styles.noDataText, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.noRecordsYet', 'Henüz kayıt bulunmuyor')}</Text>
          </View>
        )}

        {/* Uyku Algılama Kartı - yeni eklenen */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          margin: 16,
          marginTop: 8
        }]}>
          <Card.Content style={styles.cardContent}>
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
                <FontAwesomeIcon icon={faMagic} size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('sleep.automaticDetection', 'Otomatik Uyku Tespiti')}</Text>
            </View>
            
            <View style={[styles.sleepDetectorContainer, { 
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              borderRadius: 16,
              padding: 16,
              marginTop: 8
            }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sleepDetectorTitle, { color: theme.colors.onSurface, fontWeight: 'bold', marginBottom: 6 }]}>
                    {isEnabled ? t('sleep.detection.active', 'Otomatik Tespit Aktif') : t('sleep.detection.disabled', 'Otomatik Tespit Kapalı')}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
                    {isEnabled 
                      ? t('sleep.detection.activeDescription', 'Telefonunuzu kullanmadığınız zamanlar otomatik olarak uyku olarak kaydedilecek.')
                      : t('sleep.detection.disabledDescription', 'Uyku verilerinizi manuel olarak eklemeniz gerekiyor.')}
                  </Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={(value) => {
                    toggleSleepDetection(value);
                  }}
                  trackColor={{ false: '#767577', true: `${theme.colors.primary}80` }}
                  thumbColor={isEnabled ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
              
              {isEnabled && (
                <View style={{ marginTop: 12, padding: 8, backgroundColor: isDetecting ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)', borderRadius: 8 }}>
                  <Text style={{ color: isDetecting ? '#4CAF50' : '#FF9800', textAlign: 'center' }}>
                    {isDetecting 
                      ? t('sleep.detection.trackingNow', 'Şu anda uyku tespiti yapılıyor. Telefonu kullanmaya başladığınızda uyku süreniz kaydedilecek.')
                      : t('sleep.detection.standby', 'Sistem aktif. Telefonu uzun süre kullanmadığınızda uyku tespiti başlayacak.')}
                  </Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          icon={({ size, color }: { size: number; color: string }) => (
            <FontAwesomeIcon icon={faPlus} size={size} color={color} />
          )}
          style={[styles.addButton, { 
            backgroundColor: theme.colors.primary,
            borderRadius: 12,
            margin: 16,
            marginTop: 8,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 5
          }]}
          onPress={() => setModalVisible(true)}
        >
          {t('sleep.addNewRecord', 'Yeni Uyku Kaydı Ekle')}
        </Button>
      </ScrollView>

      {/* Yeni Uyku Kaydı Ekleme Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 12
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>{t('sleep.addNewRecord', 'Yeni Uyku Kaydı Ekle')}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <FontAwesomeIcon icon={faClose} size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>{t('sleep.sleepQuality')}</Text>
              <View style={styles.qualityOptions}>
                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : theme.colors.surfaceVariant },
                    newSleepEntry.quality === 'poor' && [styles.selectedQuality, { borderColor: getQualityColor('poor') }],
                  ]}
                  onPress={() => setNewSleepEntry({ ...newSleepEntry, quality: 'poor' })}
                >
                  <Text style={styles.qualityEmoji}>{getQualityEmoji('poor')}</Text>
                  <Text style={[styles.qualityOptionLabel, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.quality.poor', 'Kötü')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : theme.colors.surfaceVariant },
                    newSleepEntry.quality === 'fair' && [styles.selectedQuality, { borderColor: getQualityColor('fair') }],
                  ]}
                  onPress={() => setNewSleepEntry({ ...newSleepEntry, quality: 'fair' })}
                >
                  <Text style={styles.qualityEmoji}>{getQualityEmoji('fair')}</Text>
                  <Text style={[styles.qualityOptionLabel, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.quality.fair', 'Orta')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : theme.colors.surfaceVariant },
                    newSleepEntry.quality === 'good' && [styles.selectedQuality, { borderColor: getQualityColor('good') }],
                  ]}
                  onPress={() => setNewSleepEntry({ ...newSleepEntry, quality: 'good' })}
                >
                  <Text style={styles.qualityEmoji}>{getQualityEmoji('good')}</Text>
                  <Text style={[styles.qualityOptionLabel, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.quality.good', 'İyi')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : theme.colors.surfaceVariant },
                    newSleepEntry.quality === 'excellent' && [styles.selectedQuality, { borderColor: getQualityColor('excellent') }],
                  ]}
                  onPress={() => setNewSleepEntry({ ...newSleepEntry, quality: 'excellent' })}
                >
                  <Text style={styles.qualityEmoji}>{getQualityEmoji('excellent')}</Text>
                  <Text style={[styles.qualityOptionLabel, { color: theme.colors.onSurfaceVariant }]}>{t('sleep.quality.excellent', 'Mükemmel')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>{t('sleep.bedTime')}</Text>
              <TouchableOpacity
                style={[styles.timeInput, { 
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : theme.colors.outline,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }]}
                onPress={() => setShowStartTimePicker(true)}
              >
                <View style={styles.timeInputContent}>
                  <FontAwesomeIcon icon={faMoon} size={18} color={theme.colors.primary} style={{ marginRight: 10 }} />
                  <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>{newSleepEntry.startTime}</Text>
                </View>
              </TouchableOpacity>
              {renderDateTimePicker(
                showStartTimePicker,
                newSleepEntry.startTime || '',
                onStartTimeChange,
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>{t('sleep.wakeTime')}</Text>
              <TouchableOpacity 
                style={[styles.timeInput, { 
                  borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.15)' : theme.colors.outline,
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)'
                }]}
                onPress={() => setShowEndTimePicker(true)}
              >
                <View style={styles.timeInputContent}>
                  <FontAwesomeIcon icon={faSun} size={18} color="#FF9800" style={{ marginRight: 10 }} />
                  <Text style={{ color: theme.colors.onSurface, fontSize: 16 }}>{newSleepEntry.endTime}</Text>
                </View>
              </TouchableOpacity>
              {renderDateTimePicker(
                showEndTimePicker,
                newSleepEntry.endTime || '',
                onEndTimeChange,
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)} 
                style={[styles.cancelButton, { 
                  borderColor: theme.colors.primary,
                  borderWidth: 1,
                }]}
              >
                <Text style={{ color: theme.colors.primary, fontWeight: 'bold', textAlign: 'center' }}>{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAddSleepEntry}
                style={[styles.saveButton, { 
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 5,
                  opacity: (!newSleepEntry.startTime || !newSleepEntry.endTime) ? 0.5 : 1
                }]}
                disabled={!newSleepEntry.startTime || !newSleepEntry.endTime}
              >
                <Text style={{ color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{t('save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ayarlar Modalı */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 12
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>{t('sleep.settings', 'Uyku Takibi Ayarları')}</Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <FontAwesomeIcon icon={faClose} size={24} color={theme.colors.onSurface} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>{t('sleep.dailyGoal')}</Text>
              <View style={styles.settingsRow}>
                <TouchableOpacity
                  style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    const newGoal = Math.max(4, sleepGoal - 0.5);
                    dispatch(setSleepGoal(newGoal));
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.settingsValue, { color: theme.colors.onSurface }]}>
                  {sleepGoal} {t('sleep.hours')}
                </Text>
                <TouchableOpacity
                  style={[styles.settingsButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => {
                    const newGoal = Math.min(12, sleepGoal + 0.5);
                    dispatch(setSleepGoal(newGoal));
                  }}
                >
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={[styles.label, { color: theme.colors.onSurface }]}>{t('sleep.automaticDetection')}</Text>
              <View style={[styles.settingsSwitchRow, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)', padding: 16, borderRadius: 12 }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.colors.onSurface, fontWeight: 'bold', marginBottom: 4 }}>
                    {isEnabled ? t('sleep.enabled', 'Etkin') : t('sleep.disabled', 'Devre Dışı')}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant, fontSize: 14 }}>
                    {t('sleep.detection.description', 'Telefonunuzun kullanılmadığı zamanları uyku olarak tespit eder')}
                  </Text>
                </View>
                <Switch
                  value={isEnabled}
                  onValueChange={(value) => {
                    toggleSleepDetection(value);
                  }}
                  trackColor={{ false: '#767577', true: `${theme.colors.primary}80` }}
                  thumbColor={isEnabled ? theme.colors.primary : '#f4f3f4'}
                />
              </View>
            </View>

            <Button
              mode="contained"
              style={{ backgroundColor: theme.colors.primary, marginTop: 16, borderRadius: 12 }}
              onPress={() => setSettingsModalVisible(false)}
            >
              {t('done')}
            </Button>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  goalChip: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  goalChipText: {
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
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
    padding: 20,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
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
  sleepSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  sleepTime: {
    alignItems: 'center',
  },
  timeIconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  timeLabel: {
    marginTop: 8,
    color: '#666',
  },
  timeValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sleepDuration: {
    alignItems: 'center',
  },
  durationIconContainer: {
    padding: 8,
    borderRadius: 20,
  },
  durationValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  qualityContainer: {
    flexDirection: 'row',
    padding: 8,
    borderRadius: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  qualityIconContainer: {
    padding: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  qualityEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  qualityTextContainer: {
    flex: 1,
  },
  qualityLabel: {
    color: '#666',
    fontSize: 12,
  },
  qualityValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  sleepGoalContainer: {
    marginTop: 16,
  },
  sleepGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sleepGoalText: {
    fontSize: 14,
  },
  sleepGoalPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  sleepGoalProgressBar: {
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '31%',
    padding: 10,
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
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  adviceContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  adviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  adviceContent: {
    flex: 1,
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  historyHeaderContainer: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  historyDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyQuality: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyQualityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 8,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  historyTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyTimeText: {
    marginLeft: 4,
    fontSize: 14,
  },
  historyDuration: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  historyDurationText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyHistoryContainer: {
    alignItems: 'center',
    padding: 20,
  },
  addButton: {
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  timeInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  timeInputContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  qualityOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  qualityOptionLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  selectedQuality: {
    borderWidth: 2,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 12,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
  },
  noDataText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  emptyStateText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  settingsSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    borderRadius: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sleepDetectorContainer: {
    marginVertical: 8,
  },
  sleepDetectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
});

export default SleepTrackerScreen;
