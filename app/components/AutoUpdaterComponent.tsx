import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  useColorScheme,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDownload, faXmark } from '@fortawesome/free-solid-svg-icons';
import useTheme from '../hooks/useTheme';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

// Bir güncelleme bilgisini tanımlayan arayüz
interface UpdateInfo {
  version: string;
  features: string[];
  isMandatory: boolean;
  downloadUrl: string;
}

// Güncelleme aralığı - 24 saat
const AUTO_UPDATE_CHECK_INTERVAL = 24 * 60 * 60 * 1000;

// Güncelleme kontrol bileşeni
const UpdateChecker: React.FC<{ setUpdateInfo: (info: UpdateInfo | null) => void }> = ({ 
  setUpdateInfo 
}) => {
  const [checking, setChecking] = useState(true);
  const { theme } = useTheme();
  const themeAsAny = theme as any;
  const { t } = useTranslation();

  const checkForUpdates = async (): Promise<void> => {
    setChecking(true);
    try {
      // Gerçek uygulamada API çağrısı yapılacak, şimdilik simüle ediyoruz
      await new Promise(resolve => setTimeout(resolve, 1500));
      const hasUpdate = Math.random() > 0.7;

      if (hasUpdate) {
        const updateInfo: UpdateInfo = {
          version: '1.1.0',
          features: [
            t('updater.features.sleepTracking', 'Enhanced sleep tracking'),
            t('updater.features.performance', 'Performance improvements'),
            t('updater.features.ui', 'User interface updates'),
          ],
          isMandatory: false,
          downloadUrl: 'https://example.com/update',
        };
        setUpdateInfo(updateInfo);
      } else {
        setUpdateInfo(null);
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      setUpdateInfo(null);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkForUpdates();
    const intervalId = setInterval(checkForUpdates, AUTO_UPDATE_CHECK_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);

  if (!checking) return null;

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color={themeAsAny.colors.primary || '#4285F4'} />
      <Text style={[styles.loadingText, { color: themeAsAny.colors.onSurface || '#333' }]}>
        {t('updater.checkingForUpdates', 'Checking for updates...')}
      </Text>
    </View>
  );
};

// Modal buton bileşeni
interface ModalButtonProps {
  text: string;
  icon?: typeof faDownload;
  onPress: () => void;
  isPrimary?: boolean;
}

const ModalButton: React.FC<ModalButtonProps> = ({ 
  text, 
  icon, 
  onPress, 
  isPrimary = false 
}) => {
  const { theme } = useTheme();
  const themeAsAny = theme as any;
  const primaryColor = themeAsAny.colors.primary || '#4285F4';
  
  return (
    <Pressable
      style={[
        styles.button,
        isPrimary 
          ? [styles.primaryButton, { backgroundColor: primaryColor }]
          : [styles.secondaryButton, { borderColor: themeAsAny.colors.outline || '#999' }]
      ]}
      onPress={onPress}
    >
      <View style={styles.buttonContent}>
        {icon && (
          <FontAwesomeIcon
            icon={icon}
            size={16}
            color={isPrimary ? '#fff' : themeAsAny.colors.onSurfaceVariant || '#666'}
            style={styles.buttonIcon}
          />
        )}
        <Text 
          style={[
            styles.buttonText, 
            { 
              color: isPrimary 
                ? '#fff' 
                : themeAsAny.colors.onSurfaceVariant || '#666' 
            }
          ]}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  );
};

// Ana bileşen
const AutoUpdaterComponent: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { theme, themeMode } = useTheme();
  const systemColorScheme = useColorScheme();
  const isDarkMode = themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark');
  const themeAsAny = theme as any;
  const { t } = useTranslation();
  const { language } = useLanguage();

  useEffect(() => {
    if (updateAvailable) {
      setShowModal(true);
    }
  }, [updateAvailable]);

  const handleUpdateNow = () => {
    console.log('Update process will be initiated');
    setShowModal(false);
    setUpdateAvailable(null);
  };

  const handleUpdateLater = () => {
    setShowModal(false);
  };

  return (
    <>
      <UpdateChecker setUpdateInfo={setUpdateAvailable} />

      {updateAvailable && (
        <Modal
          visible={showModal}
          transparent={true}
          animationType="fade"
          onRequestClose={updateAvailable.isMandatory ? undefined : handleUpdateLater}
          statusBarTranslucent
        >
          <View style={styles.modalContainer}>
            <View style={[
              styles.updateCard, 
              { 
                backgroundColor: themeAsAny.colors.surface || 'white',
                shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : '#000'
              }
            ]}>
              <View style={styles.updateHeader}>
                <Text style={[
                  styles.updateTitle, 
                  { color: themeAsAny.colors.onSurface }
                ]}>
                  {t('updater.newUpdateAvailable', 'New Update Available')}
                </Text>
                {!updateAvailable.isMandatory && (
                  <TouchableOpacity onPress={handleUpdateLater} style={styles.closeButton}>
                    <FontAwesomeIcon 
                      icon={faXmark} 
                      size={22} 
                      color={themeAsAny.colors.onSurfaceVariant} 
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={[
                styles.versionText, 
                { color: themeAsAny.colors.primary }
              ]}>
                {t('updater.version', 'Version')} {updateAvailable.version}
              </Text>

              <Text style={[
                styles.featuresTitle,
                { color: themeAsAny.colors.onSurface }
              ]}>
                {t('updater.whatsNew', 'What\'s New:')}
              </Text>
              
              {updateAvailable.features.map((feature, index) => (
                <Text key={index} style={[
                  styles.featureItem,
                  { color: themeAsAny.colors.onSurfaceVariant }
                ]}>
                  • {feature}
                </Text>
              ))}

              <View style={styles.buttonContainer}>
                <ModalButton 
                  text={t('updater.update', 'UPDATE')}
                  icon={faDownload}
                  onPress={handleUpdateNow}
                  isPrimary={true}
                />

                {!updateAvailable.isMandatory && (
                  <ModalButton 
                    text={t('updater.later', 'LATER')}
                    onPress={handleUpdateLater}
                    isPrimary={false}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  // Modal konteyner stilleri
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  updateCard: {
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    padding: 20,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  // Başlık ve header stilleri
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  updateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  versionText: {
    fontSize: 16,
    marginBottom: 15,
  },
  
  // Feature listesi stilleri
  featuresTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  featureItem: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 5,
  },
  
  // Buton stilleri
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  primaryButton: {
    backgroundColor: '#4285F4',
  },
  secondaryButton: {
    borderWidth: 1,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
  // Yükleme göstergesi stilleri
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
  },
});

export default AutoUpdaterComponent;
