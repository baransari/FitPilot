import React from 'react';
import { View, StyleSheet, ActivityIndicator, ViewStyle, useColorScheme } from 'react-native';
import { useTheme } from '../context/ThemeContext';

// Stillerin tip tanımı
interface LoadingComponentStyles {
  container: ViewStyle;
}

// Yükleme bileşeni
const LoadingComponent: React.FC = () => {
  const { theme, isDarkMode } = useTheme();
  const systemColorScheme = useColorScheme();
  const actualDarkMode = isDarkMode ?? systemColorScheme === 'dark';

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
        }
      ]}
    >
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
};

// Stiller
const styles = StyleSheet.create<LoadingComponentStyles>({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoadingComponent;
