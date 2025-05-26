import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Image,
  Text as RNText
} from 'react-native';
import {
  Card,
  Button,
  Divider,
  ProgressBar,
  IconButton,
  FAB,
  Text,
  Title,
  Paragraph,
  Surface,
} from '../utils/paperComponents';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList } from '../navigation/types';
import useStepTracker from '../hooks/useStepTracker';
// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCog,
  faRulerHorizontal,
  faFire,
  faClock,
  faCircleExclamation,
  faPlus,
  faMinus,
  faCheck,
  faClose,
  faWalking,
  faPersonWalking,
  faCalendarCheck,
  faChartLine,
  faHeartbeat,
  faShoePrints,
  faRoad,
  faArrowTrendUp
} from '@fortawesome/free-solid-svg-icons';
import { useUser } from '../context/UserContext';
import { useTheme } from '../hooks/useTheme';
import store from '../store';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

// Create a simple tab param list for StepTracker
type StepTabParamList = {
  StepTracker: undefined;
};

type StepTrackerScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<StepTabParamList, 'StepTracker'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type StepTrackerScreenProps = {
  navigation: StepTrackerScreenNavigationProp;
};

const StepTrackerScreen: React.FC<StepTrackerScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode } = useTheme();
  const [goalModalVisible, setGoalModalVisible] = useState<boolean>(false);
  const [addStepsModalVisible, setAddStepsModalVisible] = useState<boolean>(false);
  const [newGoal, setNewGoal] = useState<number>(10000);
  const [stepsToAdd, setStepsToAdd] = useState<number>(500);
  const { t } = useTranslation();
  const { language } = useLanguage();

  // useStepTracker hook kullanımı
  const { dailySteps, stepGoal, isStepAvailable, updateGoal, addSteps, stepPercentage, error } =
    useStepTracker();

  const { user } = useUser();

  // Kritik hata durumunda uygun mesaj göster
  if (error) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
          <Text style={styles.headerTitle}>{t('steps.title')}</Text>
        </View>
        <View style={styles.errorContainer}>
          <FontAwesomeIcon icon={faCircleExclamation} size={48} color={theme.colors.error} />
          <Title style={{ color: theme.colors.error, marginTop: 16 }}>{t('steps.errorTitle', 'Adım Takibi Hatası')}</Title>
          <Paragraph style={{ textAlign: 'center', marginTop: 8 }}>
            {t('steps.errorDescription', 'Adım takibi modülünde kritik bir sorun oluştu. Lütfen uygulamayı yeniden başlatın.')}
          </Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  // Adım hedefini güncelle
  const handleUpdateGoal = () => {
    updateGoal(newGoal);
    setGoalModalVisible(false);
  };

  // Manuel adım ekleme
  const handleAddSteps = () => {
    addSteps(stepsToAdd);
    setAddStepsModalVisible(false);
  };

  // Kalan adımları hesapla
  const remainingSteps = Math.max(0, stepGoal - dailySteps);

  // Yakılan kalorileri yaklaşık olarak hesapla (70 kg'lık biri için ortalama)
  const calculateCalories = (steps: number) => {
    // Ortalama olarak, 1 adım yaklaşık 0.04 kalori yakımına karşılık gelir
    return Math.round(steps * 0.04);
  };

  // Kilometre cinsinden mesafeyi hesapla (ortalama adım uzunluğu 0.75 metre)
  const calculateDistance = (steps: number) => {
    const meters = steps * 0.75;
    return (meters / 1000).toFixed(2);
  };

  // Günün formatlanmış tarihini döndür
  const getFormattedDate = () => {
    return new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      {/* Header Section - Modern and vibrant design */}
      <View style={[styles.headerContainer, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {t('steps.dailyActivity', 'Günlük Aktivite')}
            </Text>
            <Text style={[styles.headerTitle, { color: '#fff' }]}>
              {t('steps.title')}
            </Text>
            <Text style={[styles.headerInfo, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {getFormattedDate()}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setGoalModalVisible(true)}>
            <View style={styles.stepsCircleContainer}>
              <View style={styles.stepsCircle}>
                <Text style={styles.stepsValue}>
                  {dailySteps.toLocaleString()}
                </Text>
                <Text style={styles.stepsUnit}>
                  {t('steps.steps')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, marginBottom: 4}}>
            <Text style={styles.progressPercentageText}>
              {stepPercentage}% {t('steps.completed', 'tamamlandı')}
            </Text>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.min(stepPercentage, 100)}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Daily Progress Card */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
          borderRadius: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
          margin: 16,
          marginTop: 16
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
                <FontAwesomeIcon icon={faWalking} size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('steps.dailyGoal', 'Günlük Hedef')}</Text>
            </View>

            <View style={styles.goalProgressContainer}>
              <View style={styles.goalHeader}>
                <Text style={[styles.goalHeading, { color: theme.colors.onSurface }]}>
                  {stepGoal.toLocaleString()} {t('steps.steps')}
                </Text>
                <Text style={[styles.goalProgress, { color: theme.colors.primary }]}>
                  {dailySteps.toLocaleString()} / {stepGoal.toLocaleString()}
                </Text>
              </View>
              
              <ProgressBar
                progress={stepPercentage / 100}
                color={theme.colors.primary}
                style={styles.goalProgressBar}
              />
              
              <Text style={[styles.remainingSteps, { color: theme.colors.onSurfaceVariant }]}>
                {remainingSteps > 0
                  ? t('steps.stepsLeft', '{{count}} adım kaldı', { count: remainingSteps })
                  : t('steps.goalCompleted', 'Hedef tamamlandı!')}
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Statistics Card */}
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
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('steps.todayStats', 'Bugünkü İstatistikler')}</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(30, 136, 229, 0.1)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 136, 229, 0.2)',
              }]}>
                <View style={styles.statIconContainer}>
                  <FontAwesomeIcon icon={faRoad} size={20} color="#1E88E5" />
                </View>
                <Text style={styles.statLabel}>{t('steps.distance', 'Mesafe')}</Text>
                <Text style={[styles.statValue, { color: "#1E88E5" }]}>{calculateDistance(dailySteps)} km</Text>
              </View>
              
              <View style={[styles.statCard, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(255, 87, 34, 0.1)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 87, 34, 0.2)',
              }]}>
                <View style={styles.statIconContainer}>
                  <FontAwesomeIcon icon={faFire} size={20} color="#FF5722" />
                </View>
                <Text style={styles.statLabel}>{t('calories.title', 'Kalori')}</Text>
                <Text style={[styles.statValue, { color: "#FF5722" }]}>{calculateCalories(dailySteps)}</Text>
              </View>
              
              <View style={[styles.statCard, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(76, 175, 80, 0.1)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(76, 175, 80, 0.2)',
              }]}>
                <View style={styles.statIconContainer}>
                  <FontAwesomeIcon icon={faClock} size={20} color="#4CAF50" />
                </View>
                <Text style={styles.statLabel}>{t('steps.activeTime', 'Aktif Süre')}</Text>
                <Text style={[styles.statValue, { color: "#4CAF50" }]}>{Math.round(dailySteps / 100)} {t('exercise.min')}</Text>
              </View>
              
              <View style={[styles.statCard, { 
                backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(156, 39, 176, 0.1)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(156, 39, 176, 0.2)',
              }]}>
                <View style={styles.statIconContainer}>
                  <FontAwesomeIcon icon={faHeartbeat} size={20} color="#9C27B0" />
                </View>
                <Text style={styles.statLabel}>{t('steps.healthScore', 'Sağlık Puanı')}</Text>
                <Text style={[styles.statValue, { color: "#9C27B0" }]}>{Math.min(100, Math.round(dailySteps / 100))}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Weekly Summary Card */}
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
                <FontAwesomeIcon icon={faCalendarCheck} size={24} color={theme.colors.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('steps.weeklySummary', 'Haftalık Özet')}</Text>
            </View>
            
            <View style={styles.weeklyActivityContainer}>
              <Text style={{ color: theme.colors.onSurfaceVariant }}>
                {t('steps.comingSoonFeature', 'Bu özellik yakında eklenecek. Haftalık adım verilerinizi burada görebileceksiniz.')}
              </Text>
              
              <View style={styles.weeklyPlaceholder}>
                <FontAwesomeIcon 
                  icon={faArrowTrendUp} 
                  size={50} 
                  color={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'} 
                />
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Warning Card - Only shown if step sensor is not available */}
        {!isStepAvailable && (
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
              <View style={[styles.warningContainer, { 
                backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : 'rgba(244, 67, 54, 0.05)',
                borderWidth: 1,
                borderColor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
                borderRadius: 16,
                padding: 16
              }]}>
                <View style={{
                  backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                  width: 50, 
                  height: 50, 
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16
                }}>
                  <FontAwesomeIcon icon={faCircleExclamation} size={24} color={theme.colors.error} />
                </View>
                <View style={styles.warningContent}>
                  <Text style={[styles.warningTitle, { color: theme.colors.error, fontSize: 18, fontWeight: 'bold', marginBottom: 8 }]}>
                    {t('steps.sensorUnavailable', 'Sensör Erişilemez')}
                  </Text>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {t('steps.sensorUnavailableDescription', 'Adım sayar sensörüne erişilemiyor. Bu cihazda adım sensörü bulunmayabilir veya izin gerekebilir.')}
                  </Text>
                  <Text style={{ fontStyle: 'italic', marginTop: 12, color: theme.colors.onSurfaceVariant }}>
                    {t('steps.simulationModeInfo', 'Uygulama şu an simülasyon modunda çalışıyor. Manuel olarak adım ekleyebilirsiniz.')}
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => setAddStepsModalVisible(true)}
                    style={{ marginTop: 16, backgroundColor: theme.colors.primary }}
                    icon={({ size, color }: { size: number; color: string }) => (
                      <FontAwesomeIcon icon={faPlus} size={size} color={color} />
                    )}
                  >
                    {t('steps.addManualSteps', 'Manuel Adım Ekle')}
                  </Button>
                </View>
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Adım hedefi modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={goalModalVisible}
        onRequestClose={() => setGoalModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 12,
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                {t('steps.setStepGoal', 'Adım Hedefini Ayarla')}
              </Text>
              <IconButton
                icon={() => <FontAwesomeIcon icon={faClose} size={24} color={theme.colors.onSurface} />}
                size={24}
                onPress={() => setGoalModalVisible(false)}
              />
            </View>
            
            <View style={styles.goalInputContainer}>
              <Button
                mode="contained"
                onPress={() => setNewGoal(Math.max(1000, newGoal - 1000))}
                style={[styles.goalControlButton, { 
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12 
                }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faMinus} size={size} color={color} />
                )}
              >
                -
              </Button>
              <Text style={[styles.goalText, { color: theme.colors.onSurface }]}>
                {newGoal.toLocaleString()}
              </Text>
              <Button
                mode="contained"
                onPress={() => setNewGoal(newGoal + 1000)}
                style={[styles.goalControlButton, { 
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12 
                }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faPlus} size={size} color={color} />
                )}
              >
                +
              </Button>
            </View>
            
            <View style={styles.goalPresets}>
              {[5000, 7500, 10000, 12500, 15000].map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    { 
                      borderColor: theme.colors.primary,
                      borderWidth: 1,
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      margin: 4
                    },
                    newGoal === preset ? { 
                      backgroundColor: isDarkMode ? 'rgba(66, 133, 244, 0.2)' : 'rgba(66, 133, 244, 0.1)'
                    } : null,
                  ]}
                  onPress={() => setNewGoal(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: theme.colors.primary },
                      newGoal === preset ? { fontWeight: 'bold' } : null,
                    ]}
                  >
                    {preset.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setGoalModalVisible(false)}
                style={[styles.modalButton, { borderColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faClose} size={size} color={color} />
                )}
              >
                {t('cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdateGoal}
                style={[styles.modalButton, { 
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5
                }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faCheck} size={size} color={color} />
                )}
              >
                {t('save')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manuel adım ekleme modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addStepsModalVisible}
        onRequestClose={() => setAddStepsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            borderRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 12,
          }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>
                {t('steps.addManualSteps', 'Manuel Adım Ekle')}
              </Text>
              <IconButton
                icon={() => <FontAwesomeIcon icon={faClose} size={24} color={theme.colors.onSurface} />}
                size={24}
                onPress={() => setAddStepsModalVisible(false)}
              />
            </View>
            
            <Text style={{ textAlign: 'center', marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
              {t('steps.manualStepsDescription', 'Yürüyüş, koşu veya diğer aktivitelerden elde ettiğiniz adımları manuel olarak ekleyin.')}
            </Text>
            
            <View style={styles.goalInputContainer}>
              <Button
                mode="contained"
                onPress={() => setStepsToAdd(Math.max(100, stepsToAdd - 100))}
                style={[styles.goalControlButton, { 
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12 
                }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faMinus} size={size} color={color} />
                )}
              >
                -
              </Button>
              <Text style={[styles.goalText, { color: theme.colors.onSurface }]}>
                {stepsToAdd.toLocaleString()}
              </Text>
              <Button
                mode="contained"
                onPress={() => setStepsToAdd(stepsToAdd + 100)}
                style={[styles.goalControlButton, { 
                  backgroundColor: theme.colors.primary,
                  borderRadius: 12 
                }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faPlus} size={size} color={color} />
                )}
              >
                +
              </Button>
            </View>
            
            <View style={styles.goalPresets}>
              {[500, 1000, 2000, 5000, 10000].map(preset => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    { 
                      borderColor: theme.colors.primary,
                      borderWidth: 1,
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      margin: 4
                    },
                    stepsToAdd === preset ? { 
                      backgroundColor: isDarkMode ? 'rgba(66, 133, 244, 0.2)' : 'rgba(66, 133, 244, 0.1)'
                    } : null,
                  ]}
                  onPress={() => setStepsToAdd(preset)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      { color: theme.colors.primary },
                      stepsToAdd === preset ? { fontWeight: 'bold' } : null,
                    ]}
                  >
                    {preset.toLocaleString()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <Button
                mode="outlined"
                onPress={() => setAddStepsModalVisible(false)}
                style={[styles.modalButton, { borderColor: theme.colors.primary }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faClose} size={size} color={color} />
                )}
              >
                {t('cancel')}
              </Button>
              <Button
                mode="contained"
                onPress={handleAddSteps}
                style={[styles.modalButton, { 
                  backgroundColor: theme.colors.primary,
                  shadowColor: theme.colors.primary,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 5
                }]}
                icon={({ size, color }: { size: number; color: string }) => (
                  <FontAwesomeIcon icon={faCheck} size={size} color={color} />
                )}
              >
                {t('steps.add', 'Ekle')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Manuel adım eklemek için FAB */}
      <FAB
        icon={() => <FontAwesomeIcon icon={faPersonWalking} color="white" size={22} />}
        style={[styles.floatingButton, { 
          backgroundColor: theme.colors.primary,
          position: 'absolute',
          bottom: 20,
          right: 20,
          borderRadius: 28,
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 6,
        }]}
        onPress={() => setAddStepsModalVisible(true)}
        color="white"
      />
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
  stepsCircleContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginLeft: 8,
  },
  stepsCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  stepsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  stepsUnit: {
    fontSize: 12,
    color: '#4285F4',
  },
  progressContainer: {
    marginTop: 12,
    paddingHorizontal: 12,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#ffffff',
  },
  progressPercentageText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'right',
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
  goalProgressContainer: {
    marginVertical: 8,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  goalProgress: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  goalProgressBar: {
    height: 10,
    borderRadius: 5,
  },
  remainingSteps: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: 16,
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
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  weeklyActivityContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  weeklyPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    height: 150,
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
    alignItems: 'center',
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
  goalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 24,
    width: '100%',
  },
  goalControlButton: {
    minWidth: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
  },
  goalText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 100,
    textAlign: 'center',
  },
  goalPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 16,
  },
  presetButton: {
    margin: 4,
  },
  presetText: {
    fontSize: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 24,
  },
  modalButton: {
    width: '48%',
    borderRadius: 12,
    paddingVertical: 8,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
});

export default StepTrackerScreen;