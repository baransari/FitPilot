import type { MD3Theme } from 'react-native-paper/lib/typescript/types';
import {
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
  Theme as NavigationTheme,
} from '@react-navigation/native';

// Tema modu tipi
export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeType = 'light' | 'dark';

/**
 * Uygulamanın özelleştirilmiş tema tipi
 * React Navigation ve React Native Paper ile uyumlu
 */
export interface CustomTheme {
  dark: boolean;
  mode: ThemeType;
  colors: {
    // MD3 renkleri (React Native Paper)
    primary: string;
    primaryContainer: string;
    secondary: string;
    secondaryContainer: string;
    tertiary: string;
    tertiaryContainer: string;
    surface: string;
    surfaceVariant: string;
    surfaceDisabled: string;
    background: string;
    error: string;
    errorContainer: string;
    onPrimary: string;
    onPrimaryContainer: string;
    onSecondary: string;
    onSecondaryContainer: string;
    onTertiary: string;
    onTertiaryContainer: string;
    onSurface: string;
    onSurfaceVariant: string;
    onSurfaceDisabled: string;
    onError: string;
    onErrorContainer: string;
    onBackground: string;
    outline: string;
    outlineVariant: string;
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
    shadow: string;
    scrim: string;
    backdrop: string;
    elevation: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    };

    // Özel uygulama renkleri
    primaryLight: string;
    primaryDark: string;
    secondaryLight: string;
    secondaryDark: string;
    card: string;
    text: string;
    textSecondary: string;
    disabled: string;
    placeholder: string;
    notification: string;
    success: string;
    warning: string;
    info: string;
    border: string;
  };
  roundness: number;
  animation: {
    scale: number;
  };
  spacing: {
    xs: number;
    s: number;
    m: number;
    l: number;
    xl: number;
    xxl: number;
  };
  fonts: any; // Using any to avoid type conflicts
}

/**
 * Birleştirilmiş tema tipi - Navigation ve Paper temalarını içerir
 */
export interface CombinedTheme {
  dark: boolean;
  colors: CustomTheme['colors'] & NavigationTheme['colors'];
  spacing: CustomTheme['spacing'];
  roundness: number;
  fonts: any;
}

// Tema renkleri
const primaryColor = '#007AFF';
const primaryLightColor = '#4DA3FF';
const primaryDarkColor = '#0055CC';
const secondaryColor = '#FF9500';
const secondaryLightColor = '#FFBB55';
const secondaryDarkColor = '#CC7600';

// Paper tema tabanı - varsayılan değerlerle başlangıç teması
const defaultPaperTheme = {
  dark: false,
  colors: {
    primary: '#6200ee',
    primaryContainer: '#f5e6ff',
    secondary: '#03dac6',
    secondaryContainer: '#e5faf6',
    tertiary: '#F5E6FF',
    tertiaryContainer: '#F5E6FF',
    surface: '#ffffff',
    surfaceVariant: '#f2f2f2',
    surfaceDisabled: '#f2f2f2',
    background: '#f6f6f6',
    error: '#B00020',
    errorContainer: '#ffebee',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#6200ee',
    onSecondary: '#000000',
    onSecondaryContainer: '#03dac6',
    onTertiary: '#000000',
    onTertiaryContainer: '#000000',
    onSurface: '#000000',
    onSurfaceVariant: '#000000',
    onSurfaceDisabled: '#00000080',
    onError: '#ffffff',
    onErrorContainer: '#B00020',
    onBackground: '#000000',
    outline: '#000000',
    outlineVariant: '#00000080',
    inverseSurface: '#000000',
    inverseOnSurface: '#ffffff',
    inversePrimary: '#ffffff',
    shadow: '#000000',
    scrim: '#000000',
    elevation: {
      level0: 'transparent',
      level1: '#f5f5f5',
      level2: '#eeeeee',
      level3: '#e0e0e0',
      level4: '#d6d6d6',
      level5: '#c2c2c2',
    },
  },
  fonts: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
  },
  roundness: 4,
  animation: {
    scale: 1.0,
  },
};

// Paper tema tabanı
const PaperLightTheme = {
  ...defaultPaperTheme,
  dark: false,
};

const PaperDarkTheme = {
  ...defaultPaperTheme,
  dark: true,
  colors: {
    ...defaultPaperTheme.colors,
    primary: '#bb86fc',
    primaryContainer: '#3f3d4a',
    secondary: '#03dac6',
    secondaryContainer: '#2d3e3d',
    background: '#121212',
    surface: '#121212',
    surfaceVariant: '#2c2c2c',
    error: '#cf6679',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onBackground: '#ffffff',
    onSurface: '#ffffff',
    onSurfaceVariant: '#dddddd',
    onError: '#ffffff',
    elevation: {
      level0: 'transparent',
      level1: '#1e1e1e',
      level2: '#222222',
      level3: '#272727',
      level4: '#2c2c2c',
      level5: '#323232',
    },
  },
};

// Light tema
export const lightTheme: CustomTheme = {
  dark: false,
  mode: 'light',
  roundness: 12,
  colors: {
    // Paper MD3 renkleri
    ...PaperLightTheme.colors,

    // Özel uygulama renkleri
    primary: primaryColor,
    primaryLight: primaryLightColor,
    primaryDark: primaryDarkColor,
    secondary: secondaryColor,
    secondaryLight: secondaryLightColor,
    secondaryDark: secondaryDarkColor,
    background: '#F2F4F7',
    card: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F9F9F9',
    text: '#000000',
    textSecondary: '#666666',
    disabled: '#CCCCCC',
    placeholder: '#AAAAAA',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF3B30',
    error: '#FF3B30',
    success: '#34C759',
    warning: '#FF9500',
    info: '#007AFF',
    border: '#E0E0E0',
    elevation: {
      level0: 'transparent',
      level1: '#F5F5F5',
      level2: '#F0F0F0',
      level3: '#E8E8E8',
      level4: '#E0E0E0',
      level5: '#D8D8D8',
    },
  },
  animation: {
    scale: 1.0,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  fonts: PaperLightTheme.fonts,
};

// Dark tema
export const darkTheme: CustomTheme = {
  dark: true,
  mode: 'dark',
  roundness: 12,
  colors: {
    // Paper MD3 renkleri
    ...PaperDarkTheme.colors,

    // Özel uygulama renkleri
    primary: primaryColor,
    primaryLight: primaryLightColor,
    primaryDark: primaryDarkColor,
    secondary: secondaryColor,
    secondaryLight: secondaryLightColor,
    secondaryDark: secondaryDarkColor,
    background: '#1A1A1A',
    card: '#2C2C2C',
    surface: '#2C2C2C',
    surfaceVariant: '#3A3A3A',
    text: '#FFFFFF',
    textSecondary: '#CCCCCC',
    disabled: '#777777',
    placeholder: '#888888',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    notification: '#FF453A',
    error: '#FF453A',
    success: '#30D158',
    warning: '#FFD60A',
    info: '#0A84FF',
    border: '#3A3A3A',
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
    onSurfaceVariant: '#CCCCCC',
    onPrimaryContainer: '#FFFFFF',
    onSecondaryContainer: '#FFFFFF',
    onTertiaryContainer: '#FFFFFF',
    elevation: {
      level0: 'transparent',
      level1: '#383838',
      level2: '#404040',
      level3: '#484848',
      level4: '#505050',
      level5: '#606060',
    },
  },
  animation: {
    scale: 1.0,
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  fonts: PaperDarkTheme.fonts,
};

/**
 * React Navigation için birleştirilmiş temalar
 */
export const CombinedDefaultTheme: CombinedTheme = {
  ...NavigationDefaultTheme,
  dark: false,
  colors: {
    ...NavigationDefaultTheme.colors,
    ...lightTheme.colors,
  },
  spacing: lightTheme.spacing,
  roundness: lightTheme.roundness,
  fonts: lightTheme.fonts,
};

export const CombinedDarkTheme: CombinedTheme = {
  ...NavigationDarkTheme,
  dark: true,
  colors: {
    ...NavigationDarkTheme.colors,
    ...darkTheme.colors,
  },
  spacing: darkTheme.spacing,
  roundness: darkTheme.roundness,
  fonts: darkTheme.fonts,
};

/**
 * İstenilen temayı döndürür
 * @param mode Tema modu ('light' veya 'dark')
 * @returns İlgili tema nesnesi
 */
export const getThemeByMode = (mode: ThemeType): CustomTheme => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

/**
 * Tema nesnesini MD3 tipine dönüştürür
 * @param theme Özel tema nesnesi
 * @returns MD3Theme uyumlu tema nesnesi
 */
export const convertToMD3Theme = (theme: CustomTheme): MD3Theme => {
  // ThemeContext.tsx'teki yaklaşımı kullanıyoruz
  return theme as unknown as MD3Theme;
};

export default {
  light: lightTheme,
  dark: darkTheme,
  CombinedDefaultTheme,
  CombinedDarkTheme,
  getThemeByMode,
  convertToMD3Theme,
};
