import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import {
  Text,
  Switch,
  Divider,
  Card,
  Title,
  Button,
} from '../utils/paperComponents';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { User } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';

// Extend the User type locally for this component
interface ExtendedUser extends User {
  exerciseReminders?: boolean;
  waterReminders?: boolean;
}

interface SettingsScreenProps {
  navigation: any;
}

// Add these types to match the ThemeContext
type ThemePreference = 'light' | 'dark' | 'system';

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { theme, toggleTheme, isDarkMode, themeMode, setTheme } = useTheme();
  const { user, updateUser } = useUser();
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const themeAsAny = theme as any;
  
  // Safety check for theme
  if (!theme || !theme.colors) {
    console.warn('Theme or theme.colors is undefined in SettingsScreen');
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Tema yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  const [themePreference, setThemePreference] = useState<ThemePreference>(themeMode || 'system');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  
  const extendedUser = user as ExtendedUser;
  
  // Sync with the actual theme mode whenever it changes
  useEffect(() => {
    setThemePreference(themeMode);
  }, [themeMode]);

  // Update theme preference when radio button is changed
  const handleThemeChange = (value: ThemePreference) => {
    setThemePreference(value);
    setTheme(value);
    
    // Update dark mode in user preferences based on the selected theme
    if (user) {
      const isDark = value === 'dark' || (value === 'system' && isDarkMode);
      updateUser({ darkModeEnabled: isDark });
    }
  };

  const handleLanguageChange = async (lang: string) => {
    setSelectedLanguage(lang);
    await changeLanguage(lang);
    
    // Kullanıcıya dil değişikliğinin başarılı olduğunu bildiren küçük bir uyarı göster
    Alert.alert(t('settings.success'), t('settings.languageChanged'));
  };

  const handleSaveSettings = () => {
    // Bildirimler veya diğer ayarlar üzerinde ek işlemler yapmak isteyebiliriz
    Alert.alert(t('settings.info'), t('settings.settingsSaved'));
    navigation.goBack();
  };

  // Dark mode toggle, using toggleTheme to match the context API
  const toggleDarkMode = (value: boolean) => {
    // If turning on dark mode
    if (value) {
      setTheme('dark');
    } else {
      setTheme('light');
    }
    
    // Update the user context directly to ensure consistency
    if (user) {
      updateUser({ darkModeEnabled: value });
    }
  };

  const getCardStyle = () => {
    return {
      backgroundColor: isDarkMode ? '#1E1E2E' : (themeAsAny.colors?.surface || '#FFFFFF'),
      borderRadius: 16,
      marginBottom: 16,
      elevation: isDarkMode ? 8 : 4,
      shadowColor: isDarkMode ? (themeAsAny.colors?.primary || '#007AFF') : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 8,
      borderWidth: 0
    };
  };

  // Function to update extended user properties
  const updateExtendedUser = (updates: Partial<ExtendedUser>) => {
    updateUser(updates as Partial<User>);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeAsAny.colors?.background || '#FFFFFF' }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={themeAsAny.colors?.background || '#FFFFFF'}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }]} 
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.backButtonText, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
            ←
          </Text>
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.iconText, { color: themeAsAny.colors?.primary || '#007AFF', marginRight: 10, fontSize: 24 }]}>
            ⚙️
          </Text>
          <Text style={[styles.headerTitle, { color: themeAsAny.colors?.onBackground || '#000000' }]}>
            {t('settings.title')}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Theme Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors?.primary || '#007AFF'}20` }]}>
                <Text style={[styles.iconText, { color: themeAsAny.colors?.primary || '#007AFF' }]}>
                  🌞
                </Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                {t('settings.theme')}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                {isDarkMode ? t('settings.dark') : t('settings.light')} {t('settings.theme')}
              </Text>
              <Switch
                value={isDarkMode}
                onValueChange={(value: boolean) => toggleDarkMode(value)}
                color={themeAsAny.colors?.primary || '#007AFF'}
              />
            </View>

            <Divider style={styles.divider} />

            <Text style={[styles.settingGroupLabel, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>
              {t('settings.themeOptions')}
            </Text>

            <View style={styles.radioContainer}>
              <View>
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleThemeChange('light')}
                >
                  <View style={styles.radioIconContainer}>
                    <View style={[
                      styles.radioIconCircle, 
                      { 
                        backgroundColor: themePreference === 'light' 
                          ? `${themeAsAny.colors?.primary || '#007AFF'}20` 
                          : isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                      }
                    ]}>
                      <Text style={[styles.iconText, { 
                        color: themePreference === 'light' ? (themeAsAny.colors?.primary || '#007AFF') : isDarkMode ? '#DDDDDD' : '#777777',
                        fontSize: 18 
                      }]}>
                        ☀️
                      </Text>
                    </View>
                    <Text style={[
                      styles.radioLabel, 
                      { 
                        color: themePreference === 'light' 
                          ? (themeAsAny.colors?.primary || '#007AFF') 
                          : (themeAsAny.colors?.onSurface || '#000000') 
                      }
                    ]}>
                      {t('settings.light')}
                    </Text>
                  </View>
                  <View style={[
                    styles.customRadio,
                    { 
                      borderColor: themePreference === 'light' 
                        ? (themeAsAny.colors?.primary || '#007AFF') 
                        : isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                    }
                  ]}>
                    {themePreference === 'light' && (
                      <View style={[
                        styles.customRadioInner,
                        { backgroundColor: themeAsAny.colors?.primary || '#007AFF' }
                      ]} />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleThemeChange('dark')}
                >
                  <View style={styles.radioIconContainer}>
                    <View style={[
                      styles.radioIconCircle, 
                      { 
                        backgroundColor: themePreference === 'dark' 
                          ? `${themeAsAny.colors?.primary || '#007AFF'}20` 
                          : isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                      }
                    ]}>
                      <Text style={[styles.iconText, { 
                        color: themePreference === 'dark' ? (themeAsAny.colors?.primary || '#007AFF') : isDarkMode ? '#DDDDDD' : '#777777',
                        fontSize: 18 
                      }]}>
                        🌙
                      </Text>
                    </View>
                    <Text style={[
                      styles.radioLabel, 
                      { 
                        color: themePreference === 'dark' 
                          ? (themeAsAny.colors?.primary || '#007AFF') 
                          : (themeAsAny.colors?.onSurface || '#000000') 
                      }
                    ]}>
                      {t('settings.dark')}
                    </Text>
                  </View>
                  <View style={[
                    styles.customRadio,
                    { 
                      borderColor: themePreference === 'dark' 
                        ? (themeAsAny.colors?.primary || '#007AFF') 
                        : isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                    }
                  ]}>
                    {themePreference === 'dark' && (
                      <View style={[
                        styles.customRadioInner,
                        { backgroundColor: themeAsAny.colors?.primary || '#007AFF' }
                      ]} />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleThemeChange('system')}
                >
                  <View style={styles.radioIconContainer}>
                    <View style={[
                      styles.radioIconCircle, 
                      { 
                        backgroundColor: themePreference === 'system' 
                          ? `${themeAsAny.colors?.primary || '#007AFF'}20` 
                          : isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                      }
                    ]}>
                      <Text style={[styles.iconText, { 
                        color: themePreference === 'system' ? (themeAsAny.colors?.primary || '#007AFF') : isDarkMode ? '#DDDDDD' : '#777777',
                        fontSize: 18 
                      }]}>
                        📱
                      </Text>
                    </View>
                    <Text style={[
                      styles.radioLabel, 
                      { 
                        color: themePreference === 'system' 
                          ? (themeAsAny.colors?.primary || '#007AFF') 
                          : (themeAsAny.colors?.onSurface || '#000000') 
                      }
                    ]}>
                      {t('settings.system')}
                    </Text>
                  </View>
                  <View style={[
                    styles.customRadio,
                    { 
                      borderColor: themePreference === 'system' 
                        ? (themeAsAny.colors?.primary || '#007AFF') 
                        : isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                    }
                  ]}>
                    {themePreference === 'system' && (
                      <View style={[
                        styles.customRadioInner,
                        { backgroundColor: themeAsAny.colors?.primary || '#007AFF' }
                      ]} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Language Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors?.secondary || '#4CAF50'}20` }]}>
                <Text style={[styles.iconText, { color: themeAsAny.colors?.secondary || '#4CAF50' }]}>
                  ��
                </Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                {t('settings.language')}
              </Text>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.radioContainer}>
              <View>
                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleLanguageChange('tr')}
                >
                  <View style={styles.radioIconContainer}>
                    <View style={[
                      styles.radioIconCircle, 
                      { 
                        backgroundColor: selectedLanguage === 'tr' 
                          ? `${themeAsAny.colors?.secondary || '#4CAF50'}20` 
                          : isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                      }
                    ]}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: selectedLanguage === 'tr' 
                          ? (themeAsAny.colors?.secondary || '#4CAF50') 
                          : isDarkMode ? '#DDDDDD' : '#777777'
                      }}>
                        TR
                      </Text>
                    </View>
                    <Text style={[
                      styles.radioLabel, 
                      { 
                        color: selectedLanguage === 'tr' 
                          ? (themeAsAny.colors?.secondary || '#4CAF50') 
                          : (themeAsAny.colors?.onSurface || '#000000') 
                      }
                    ]}>
                      {t('settings.turkish')}
                    </Text>
                  </View>
                  <View style={[
                    styles.customRadio,
                    { 
                      borderColor: selectedLanguage === 'tr' 
                        ? (themeAsAny.colors?.secondary || '#4CAF50') 
                        : isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                    }
                  ]}>
                    {selectedLanguage === 'tr' && (
                      <View style={[
                        styles.customRadioInner,
                        { backgroundColor: themeAsAny.colors?.secondary || '#4CAF50' }
                      ]} />
                    )}
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.radioOption}
                  onPress={() => handleLanguageChange('en')}
                >
                  <View style={styles.radioIconContainer}>
                    <View style={[
                      styles.radioIconCircle, 
                      { 
                        backgroundColor: selectedLanguage === 'en' 
                          ? `${themeAsAny.colors?.secondary || '#4CAF50'}20` 
                          : isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' 
                      }
                    ]}>
                      <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: selectedLanguage === 'en' 
                          ? (themeAsAny.colors?.secondary || '#4CAF50') 
                          : isDarkMode ? '#DDDDDD' : '#777777'
                      }}>
                        EN
                      </Text>
                    </View>
                    <Text style={[
                      styles.radioLabel, 
                      { 
                        color: selectedLanguage === 'en' 
                          ? (themeAsAny.colors?.secondary || '#4CAF50') 
                          : (themeAsAny.colors?.onSurface || '#000000') 
                      }
                    ]}>
                      {t('settings.english')}
                    </Text>
                  </View>
                  <View style={[
                    styles.customRadio,
                    { 
                      borderColor: selectedLanguage === 'en' 
                        ? (themeAsAny.colors?.secondary || '#4CAF50') 
                        : isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)'
                    }
                  ]}>
                    {selectedLanguage === 'en' && (
                      <View style={[
                        styles.customRadioInner,
                        { backgroundColor: themeAsAny.colors?.secondary || '#4CAF50' }
                      ]} />
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Notifications Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors?.secondary || '#4CAF50'}20` }]}>
                <Text style={[styles.iconText, { color: themeAsAny.colors?.secondary || '#4CAF50' }]}>
                  📢
                </Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                {t('settings.notifications')}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <Text style={[styles.settingLabel, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                {t('settings.enableNotifications')}
              </Text>
              <Switch
                value={user?.notificationsEnabled || false}
                onValueChange={(value: boolean) => updateUser({ notificationsEnabled: value })}
                color={themeAsAny.colors?.secondary || '#4CAF50'}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={[
              styles.settingItem, 
              !user?.notificationsEnabled && { opacity: 0.5 }
            ]}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                  {t('settings.exerciseReminders')}
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>
                  {t('settings.exerciseRemindersDescription')}
                </Text>
              </View>
              <Switch
                value={extendedUser?.exerciseReminders || false}
                onValueChange={(value: boolean) => updateExtendedUser({ exerciseReminders: value })}
                disabled={!user?.notificationsEnabled}
                color={themeAsAny.colors?.secondary || '#4CAF50'}
              />
            </View>

            <View style={[
              styles.settingItem, 
              !user?.notificationsEnabled && { opacity: 0.5 }
            ]}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                  {t('settings.waterReminders')}
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>
                  {t('settings.waterRemindersDescription')}
                </Text>
              </View>
              <Switch
                value={extendedUser?.waterReminders || false}
                onValueChange={(value: boolean) => updateExtendedUser({ waterReminders: value })}
                disabled={!user?.notificationsEnabled}
                color={themeAsAny.colors?.secondary || '#4CAF50'}
              />
            </View>
          </Card.Content>
        </Card>

        {/* App Settings Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors?.tertiary || '#FF8A65'}20` }]}>
                <Text style={[styles.iconText, { color: themeAsAny.colors?.tertiary || '#FF8A65' }]}>
                  ⚙
                </Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                {t('settings.appSettings')}
              </Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                  {t('settings.metricUnits')}
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>
                  {t('settings.metricUnitsDescription')}
                </Text>
              </View>
              <Switch
                value={user?.metricUnits || false}
                onValueChange={(value: boolean) => updateUser({ metricUnits: value })}
                color={themeAsAny.colors?.tertiary || '#FF8A65'}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingItem}>
              <View style={styles.settingLabelWithDescription}>
                <Text style={[styles.settingLabel, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                  {t('settings.dataSync')}
                </Text>
                <Text style={[styles.settingDescription, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>
                  {t('settings.dataSyncDescription')}
                </Text>
              </View>
              <Switch
                value={user?.dataSync || false}
                onValueChange={(value: boolean) => updateUser({ dataSync: value })}
                color={themeAsAny.colors?.tertiary || '#FF8A65'}
              />
            </View>
          </Card.Content>
        </Card>

        {/* Privacy Card */}
        <Card style={getCardStyle()}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.sectionTitleContainer}>
              <View style={[styles.iconCircle, { backgroundColor: `${themeAsAny.colors?.error || '#F44336'}20` }]}>
                <Text style={[styles.iconText, { color: themeAsAny.colors?.error || '#F44336' }]}>
                  🔒
                </Text>
              </View>
              <Text style={[styles.sectionTitle, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                {t('settings.dataAndPrivacy')}
              </Text>
            </View>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert(t('settings.info'), t('settings.featureNotReady'))}
            >
              <View style={styles.actionButtonContent}>
                <View style={[
                  styles.actionIconCircle, 
                  { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                ]}>
                  <Text style={[styles.iconText, { color: themeAsAny.colors?.primary || '#007AFF', fontSize: 16 }]}>
                    💾
                  </Text>
                </View>
                <Text style={[styles.actionButtonText, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                  {t('settings.backupMyData')}
                </Text>
              </View>
              <Text style={[styles.iconText, { color: themeAsAny.colors?.onSurfaceVariant || '#666666', fontSize: 16 }]}>
                →
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => Alert.alert(t('settings.info'), t('settings.featureNotReady'))}
            >
              <View style={styles.actionButtonContent}>
                <View style={[
                  styles.actionIconCircle, 
                  { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                ]}>
                  <Text style={[styles.iconText, { color: themeAsAny.colors?.primary || '#007AFF', fontSize: 16 }]}>
                    📋
                  </Text>
                </View>
                <Text style={[styles.actionButtonText, { color: themeAsAny.colors?.onSurface || '#000000' }]}>
                  {t('settings.privacyPolicy')}
                </Text>
              </View>
              <Text style={[styles.iconText, { color: themeAsAny.colors?.onSurfaceVariant || '#666666', fontSize: 16 }]}>
                →
              </Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>

        <TouchableOpacity
          style={[
            styles.saveButton, 
            { 
              backgroundColor: themeAsAny.colors?.primary || '#007AFF',
              shadowColor: themeAsAny.colors?.primary || '#007AFF',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 5
            }
          ]}
          onPress={handleSaveSettings}
        >
          <Text style={styles.saveButtonText}>
            {t('settings.saveSettings')}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: themeAsAny.colors?.onSurfaceVariant || '#666666' }]}>
            {t('settings.version')} 1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StatusBar.currentHeight || 16,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 40, // To balance with back button
  },
  headerIcon: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  cardContent: {
    paddingVertical: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingLabelWithDescription: {
    flex: 1,
    marginRight: 16,
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  settingGroupLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  radioContainer: {
    marginLeft: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  radioIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  radioLabel: {
    fontSize: 16,
  },
  languageSelector: {
    flexDirection: 'row',
  },
  languageOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    height: 56,
    borderRadius: 28,
    marginTop: 24,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 10,
  },
  version: {
    fontSize: 12,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  customRadio: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customRadioInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000',
  },
});

export default SettingsScreen;
