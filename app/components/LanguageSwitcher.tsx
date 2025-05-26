import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import useTheme from '../hooks/useTheme';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';

interface LanguageSwitcherProps {
  compact?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ compact = false }) => {
  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();
  const { theme, isDarkMode } = useTheme();
  const themeAsAny = theme as any;

  const toggleLanguage = () => {
    const newLanguage = language === 'tr' ? 'en' : 'tr';
    changeLanguage(newLanguage);
  };

  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.compactContainer,
          {
            backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          },
        ]}
        onPress={toggleLanguage}
      >
        <FontAwesomeIcon
          icon={faLanguage}
          size={20}
          color={themeAsAny.colors.primary}
          style={{ marginRight: 5 }}
        />
        <Text style={[styles.compactText, { color: themeAsAny.colors.primary }]}>
          {language.toUpperCase()}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: themeAsAny.colors.onSurface }]}>
        {t('settings.language')}:
      </Text>
      <View style={styles.languageSelector}>
        <TouchableOpacity
          style={[
            styles.languageOption,
            language === 'tr' && {
              backgroundColor: `${themeAsAny.colors.primary}20`,
              borderColor: themeAsAny.colors.primary,
            },
            { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
          ]}
          onPress={() => changeLanguage('tr')}
        >
          <Text
            style={[
              styles.languageText,
              {
                color: language === 'tr' 
                  ? themeAsAny.colors.primary
                  : themeAsAny.colors.onSurface,
              },
            ]}
          >
            {t('settings.turkish')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.languageOption,
            language === 'en' && {
              backgroundColor: `${themeAsAny.colors.primary}20`,
              borderColor: themeAsAny.colors.primary,
            },
            { borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)' },
          ]}
          onPress={() => changeLanguage('en')}
        >
          <Text
            style={[
              styles.languageText,
              {
                color: language === 'en' 
                  ? themeAsAny.colors.primary
                  : themeAsAny.colors.onSurface,
              },
            ]}
          >
            {t('settings.english')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  languageOption: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 14,
    fontWeight: '500',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  compactText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default LanguageSwitcher; 