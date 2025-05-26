import * as React from 'react';
import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../theme';
// Removing the direct import of MD3Theme, using ExtendedMD3Theme from our types file
import type { ThemeContextType, ThemeMode, ExtendedMD3Theme } from '../types';

// Theme event emitter
export const themeEvents = {
  darkModeListeners: [] as ((isDark: boolean) => void)[],
  registerDarkModeListener(callback: (isDark: boolean) => void) {
    this.darkModeListeners.push(callback);
  },
  emitDarkModeChange(isDark: boolean) {
    this.darkModeListeners.forEach(listener => listener(isDark));
  },
};

// Create initial context with proper theme types
export const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleTheme: () => {},
  theme: lightTheme as unknown as ExtendedMD3Theme,
  themeMode: 'system',
  setTheme: async () => {},
});

export { ThemeMode };

export const ThemeProvider: React.FunctionComponent<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(systemColorScheme === 'dark');
  const initialLoadDone = useRef(false);

  // Loading and storing theme preferences
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('@theme_mode');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setThemeMode(savedTheme as ThemeMode);
          
          // Update dark mode state
          if (savedTheme === 'system') {
            setIsDarkMode(systemColorScheme === 'dark');
          } else {
            setIsDarkMode(savedTheme === 'dark');
          }
        }
        initialLoadDone.current = true;
      } catch (error) {
        console.error('Error loading theme:', error);
        initialLoadDone.current = true;
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  // Update theme when system theme changes and mode is "system"
  useEffect(() => {
    if (themeMode === 'system' && initialLoadDone.current) {
      setIsDarkMode(systemColorScheme === 'dark');
      themeEvents.emitDarkModeChange(systemColorScheme === 'dark');
    }
  }, [systemColorScheme, themeMode]);

  const toggleTheme = async () => {
    try {
      // Circular theme change: light -> dark -> system -> light
      let newMode: ThemeMode;
      if (themeMode === 'light') {
        newMode = 'dark';
        setIsDarkMode(true);
      } else if (themeMode === 'dark') {
        newMode = 'system';
        setIsDarkMode(systemColorScheme === 'dark');
      } else {
        newMode = 'light';
        setIsDarkMode(false);
      }

      setThemeMode(newMode);
      await AsyncStorage.setItem('@theme_mode', newMode);
      themeEvents.emitDarkModeChange(
        newMode === 'dark' || (newMode === 'system' && systemColorScheme === 'dark')
      );
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Additional function to switch to a specific theme
  const setTheme = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      
      // Update dark mode state
      if (mode === 'system') {
        setIsDarkMode(systemColorScheme === 'dark');
      } else {
        setIsDarkMode(mode === 'dark');
      }
      
      await AsyncStorage.setItem('@theme_mode', mode);
      themeEvents.emitDarkModeChange(
        mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark')
      );
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Using "as unknown as ExtendedMD3Theme" to provide the correct theme type
  const theme = isDarkMode ? darkTheme : lightTheme;
  const contextValue = { 
    isDarkMode, 
    toggleTheme, 
    theme: theme as unknown as ExtendedMD3Theme,
    themeMode,
    setTheme
  };

  // Notify React Native about theme changes
  useEffect(() => {
    if (isDarkMode) {
      themeEvents.emitDarkModeChange(true);
    } else {
      themeEvents.emitDarkModeChange(false);
    }
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
