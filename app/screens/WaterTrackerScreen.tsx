import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  SafeAreaView,
} from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, MainTabParamList } from '../navigation/types';
import useWaterTracker from '../hooks/useWaterTracker';
import { WaterEntry } from '../store/waterTrackerSlice';
import { useUser } from '../context/UserContext';
import useTheme from '../hooks/useTheme';
import type { ExtendedMD3Theme } from '../types';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

// Import components from paperComponents utility
import { Card, Divider, IconButton, Title, ProgressBar, FAB } from '../utils/paperComponents';

// Font Awesome icons
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faWater,
  faAdjust,
  faPlus,
  faMinus,
  faXmark,
  faCheck,
  faTrash,
  faHistory,
  faWineBottle,
  faGlassWater,
  faDroplet,
  faTint,
  faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';

type WaterTrackerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'WaterTracker'>;

type WaterTrackerScreenProps = {
  navigation: WaterTrackerScreenNavigationProp;
};

const WaterTrackerScreen: React.FC<WaterTrackerScreenProps> = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const themeAsAny = theme as any;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedAmount, setSelectedAmount] = useState<number>(250);
  const { t } = useTranslation();
  const { language } = useLanguage();

  // useWaterTracker hook kullanımı
  const {
    waterGoal,
    waterEntries,
    updateWaterGoal,
    addWater,
    removeEntry,
    totalIntake,
    percentage,
  } = useWaterTracker();

  const { user } = useUser();

  // Renk teması
  const primaryColor = themeAsAny.colors.primary || '#4285F4';
  const secondaryColor = isDarkMode ? '#1E1E2E' : '#fff';
  const headerColor = isDarkMode ? '#1E1E2E' : 'rgba(3, 169, 244, 0.95)';

  console.log('WaterTracker - Current totalIntake:', totalIntake, 'ml (', totalIntake / 1000, 'L)');
  // Only log user waterIntake if user exists
  if (user) {
    console.log('WaterTracker - HomeScreen waterIntake:', user.waterIntake, 'L');
  }

  // Su eklemek için fonksiyon
  const handleAddWaterEntry = () => {
    addWater(selectedAmount);
    setModalVisible(false);
    console.log(
      'Su eklendi:',
      selectedAmount,
      'ml - Yeni toplam:',
      totalIntake + selectedAmount,
      'ml',
    );
  };

  // Su kaydını silmek için fonksiyon
  const handleRemoveWaterEntry = (id: string) => {
    const entry = waterEntries.find(e => e.id === id);
    removeEntry(id);
    if (entry) {
      console.log(
        'Su silindi:',
        entry.amount,
        'ml - Yeni toplam:',
        totalIntake - entry.amount,
        'ml',
      );
    }
  };

  // Su hedefini güncellemek için (ileride bir ayarlar modalı eklenebilir)
  const handleGoalUpdate = (goal: number) => {
    updateWaterGoal(goal);
  };

  // Bugünün tarihini format olarak döndür
  const getFormattedDate = () => {
    return new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Kayıt zamanını biçimlendir
  const getFormattedTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.headerSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {getFormattedDate()}
            </Text>
            <Text style={styles.headerTitle}>{t('water.title')}</Text>
            <Text style={[styles.headerInfo, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {t('water.goal')}: {(waterGoal / 1000).toFixed(1)}L
            </Text>
          </View>
          
          <View style={styles.waterCircleContainer}>
            <View style={[styles.waterCircle, { 
              backgroundColor: secondaryColor,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 10,
            }]}>
              <Text style={[styles.waterValue, { color: isDarkMode ? '#fff' : '#03A9F4' }]}>
                {(totalIntake / 1000).toFixed(1)}
              </Text>
              <Text style={[styles.waterUnit, { color: isDarkMode ? 'rgba(255, 255, 255, 0.7)' : '#03A9F4' }]}>
                {t('water.liter')}
              </Text>
              <View style={[styles.waterPercentage, { backgroundColor: isDarkMode ? '#03A9F4' : 'rgba(3, 169, 244, 0.1)' }]}>
                <Text style={[styles.waterPercentageText, { color: isDarkMode ? '#fff' : '#03A9F4' }]}>
                  {percentage}%
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                {
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: '#fff',
                },
              ]}
            />
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Add Card */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
          borderWidth: 0,
        }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${primaryColor}20`,
                width: 50, 
                height: 50, 
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faGlassWater} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('water.quickAdd', 'Hızlı Ekle')}</Text>
            </View>
            
            <View style={styles.quickAddContainer}>
              {[150, 250, 330, 500].map(amount => (
                <TouchableOpacity
                  key={`quick-add-${amount}`}
                  style={[
                    styles.amountButton,
                    { 
                      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.07)' : 'rgba(3, 169, 244, 0.08)',
                      borderWidth: 1,
                      borderColor: selectedAmount === amount 
                        ? primaryColor 
                        : isDarkMode 
                          ? 'rgba(255, 255, 255, 0.1)' 
                          : 'rgba(3, 169, 244, 0.1)',
                    },
                    selectedAmount === amount ? { 
                      backgroundColor: isDarkMode ? 'rgba(3, 169, 244, 0.2)' : 'rgba(3, 169, 244, 0.15)',
                    } : null,
                  ]}
                  onPress={() => setSelectedAmount(amount)}
                >
                  <FontAwesomeIcon 
                    icon={faDroplet} 
                    size={18} 
                    color={selectedAmount === amount ? primaryColor : isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'} 
                    style={styles.amountButtonIcon} 
                  />
                  <Text
                    style={[
                      styles.amountButtonText,
                      { color: theme.colors.onSurface },
                      selectedAmount === amount ? { color: primaryColor, fontWeight: 'bold' } : null,
                    ]}
                  >
                    {amount} {t('water.ml')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              style={[styles.customAmountButton, { 
                backgroundColor: primaryColor,
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
              }]}
            >
              <Text style={styles.customAmountButtonText}>{t('water.addWater')} ({selectedAmount} {t('water.ml')})</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        {/* Today's Records Card */}
        <Card style={[styles.card, { 
          backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
          borderWidth: 0,
        }]}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={{
                backgroundColor: `${primaryColor}20`,
                width: 50, 
                height: 50, 
                borderRadius: 25,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: primaryColor,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 3
              }}>
                <FontAwesomeIcon icon={faCalendarDay} size={24} color={primaryColor} />
              </View>
              <Text style={[styles.cardTitle, { color: theme.colors.onSurface }]}>{t('water.todayRecords', 'Bugünkü Kayıtlar')}</Text>
            </View>

            <Divider style={styles.divider} />

            {waterEntries
              .slice()
              .sort(
                (a: WaterEntry, b: WaterEntry) =>
                  new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
              )
              .map((entry: WaterEntry, index: number) => (
                <View
                  key={`water-entry-${entry.id}-${index}`}
                  style={[styles.entryItem, { 
                    borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(3, 169, 244, 0.05)', 
                  }]}
                >
                  <View style={styles.entryInfo}>
                    <View style={styles.entryAmount}>
                      <FontAwesomeIcon 
                        icon={faWater} 
                        size={16} 
                        color={primaryColor} 
                        style={{ marginRight: 8 }} 
                      />
                      <Text style={[styles.entryAmountText, { color: theme.colors.onSurface }]}>
                        {entry.amount} {t('water.ml')}
                      </Text>
                    </View>
                    <View style={styles.entryTime}>
                      <FontAwesomeIcon 
                        icon={faHistory} 
                        size={12} 
                        color={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)'} 
                        style={{ marginRight: 4 }} 
                      />
                      <Text style={[styles.entryTimeText, { color: theme.colors.onSurfaceVariant }]}>
                        {getFormattedTime(entry.timestamp)}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoveWaterEntry(entry.id)}
                  >
                    <FontAwesomeIcon icon={faTrash} color={theme.colors.error} size={18} />
                  </TouchableOpacity>
                </View>
              ))}

            {waterEntries.length === 0 && (
              <View style={styles.emptyContainer}>
                <FontAwesomeIcon 
                  icon={faWater} 
                  size={40} 
                  color={isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(3, 169, 244, 0.2)'} 
                  style={{ marginBottom: 16 }} 
                />
                <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('water.noRecordsYet', 'Bugün henüz su kaydı eklenmemiş.')}
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>

      {/* Custom Amount Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { 
            backgroundColor: isDarkMode ? '#1E1E2E' : theme.colors.surface,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 15,
          }]}>
            <Title style={{ color: theme.colors.onSurface, marginBottom: 20 }}>{t('water.addCustomAmount', 'Özel Miktar Ekle')}</Title>
            
            <View style={styles.customAmountInputContainer}>
              <Text style={[styles.customAmountLabel, { color: theme.colors.onSurfaceVariant }]}>
                {t('water.chooseAmount', 'Miktar seçin:')}
              </Text>
              <View style={styles.customAmountInput}>
                <TouchableOpacity
                  onPress={() => setSelectedAmount(Math.max(50, selectedAmount - 50))}
                  style={[styles.amountControlButton, { 
                    backgroundColor: primaryColor,
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 2
                  }]}
                >
                  <FontAwesomeIcon icon={faMinus} size={18} color="white" />
                </TouchableOpacity>
                <Text style={[styles.customAmountText, { color: theme.colors.onSurface }]}>
                  {selectedAmount} {t('water.ml')}
                </Text>
                <TouchableOpacity
                  onPress={() => setSelectedAmount(selectedAmount + 50)}
                  style={[styles.amountControlButton, { 
                    backgroundColor: primaryColor,
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    elevation: 2
                  }]}
                >
                  <FontAwesomeIcon icon={faPlus} size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.quickAmountOptions}>
              {[100, 200, 300, 400, 500, 600].map(amount => (
                <TouchableOpacity
                  key={`modal-amount-${amount}`}
                  style={[
                    styles.quickAmountButton,
                    { 
                      backgroundColor: selectedAmount === amount 
                        ? `${primaryColor}20` 
                        : isDarkMode 
                          ? 'rgba(255, 255, 255, 0.05)' 
                          : 'rgba(0, 0, 0, 0.05)',
                      borderWidth: 1,
                      borderColor: selectedAmount === amount 
                        ? primaryColor 
                        : 'transparent',
                    },
                  ]}
                  onPress={() => setSelectedAmount(amount)}
                >
                  <Text
                    style={[
                      styles.quickAmountButtonText,
                      { 
                        color: selectedAmount === amount 
                          ? primaryColor 
                          : theme.colors.onSurfaceVariant 
                      },
                    ]}
                  >
                    {amount}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
                ]}
              >
                <FontAwesomeIcon icon={faXmark} size={18} color={theme.colors.onSurfaceVariant} />
                <Text style={[styles.modalButtonText, { color: theme.colors.onSurfaceVariant }]}>{t('cancel')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={handleAddWaterEntry}
                style={[
                  styles.modalButton,
                  styles.confirmButton,
                  { 
                    backgroundColor: primaryColor,
                    shadowColor: primaryColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5
                  },
                ]}
              >
                <FontAwesomeIcon icon={faCheck} size={18} color="white" />
                <Text style={[styles.modalButtonText, { color: 'white' }]}>{t('water.add', 'Ekle')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FAB Button */}
      <FAB
        icon={() => <FontAwesomeIcon icon={faPlus} color="white" size={24} />}
        style={[styles.fab, { 
          backgroundColor: primaryColor,
          shadowColor: primaryColor,
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 8
        }]}
        onPress={() => setModalVisible(true)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
  headerTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  headerInfo: {
    fontSize: 14,
    marginTop: 4,
  },
  waterCircleContainer: {
    alignItems: 'center',
  },
  waterCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 10,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  waterValue: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  waterUnit: {
    fontSize: 14,
    marginTop: 2,
  },
  waterPercentage: {
    position: 'absolute',
    bottom: -5,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  waterPercentageText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 5,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    padding: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  quickAddContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountButton: {
    width: '48%',
    padding: 15,
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  amountButtonIcon: {
    marginRight: 8,
  },
  amountButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  customAmountButton: {
    width: '100%',
    paddingVertical: 15,
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 8,
  },
  customAmountButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    marginBottom: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderBottomWidth: 1,
  },
  entryInfo: {
    flex: 1,
  },
  entryAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  entryAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  entryTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  entryTimeText: {
    fontSize: 14,
  },
  deleteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  customAmountInputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  customAmountLabel: {
    fontSize: 16,
    marginBottom: 10,
  },
  customAmountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  amountControlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customAmountText: {
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  quickAmountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  quickAmountButton: {
    width: '30%',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 10,
  },
  quickAmountButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    width: '48%',
  },
  cancelButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  confirmButton: {},
  modalButtonText: {
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WaterTrackerScreen;