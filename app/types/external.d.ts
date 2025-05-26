declare module 'react-native-circular-progress' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface CircularProgressProps {
    size: number;
    width: number;
    fill: number;
    tintColor?: string;
    backgroundColor?: string;
    rotation?: number;
    lineCap?: 'butt' | 'round' | 'square';
    children?: (fill: number) => React.ReactNode;
    style?: ViewStyle;
  }

  export class CircularProgress extends Component<CircularProgressProps> {}
  export class AnimatedCircularProgress extends Component<
    CircularProgressProps & {
      prefill?: number;
      duration?: number;
      easing?: (value: number) => number;
    }
  > {}
}

declare module 'react-native-sensors' {
  export interface SensorData {
    x: number;
    y: number;
    z: number;
    timestamp: number;
  }

  export interface SensorConfig {
    updateInterval?: number;
  }

  export interface Subscription {
    unsubscribe: () => void;
  }

  export const accelerometer: {
    subscribe: (callback: (data: SensorData) => void) => Subscription;
  };

  export const gyroscope: {
    subscribe: (callback: (data: SensorData) => void) => Subscription;
  };

  export const magnetometer: {
    subscribe: (callback: (data: SensorData) => void) => Subscription;
  };

  export const barometer: {
    subscribe: (callback: (data: { pressure: number }) => void) => Subscription;
  };
}

declare module 'react-native-svg-charts' {
  import { Component } from 'react';
  import { ViewStyle } from 'react-native';

  interface ChartProps {
    style?: ViewStyle;
    data: number[] | { value: number }[];
    contentInset?: { top?: number; bottom?: number; left?: number; right?: number };
    svg?: object;
    animate?: boolean;
    animationDuration?: number;
  }

  export class LineChart extends Component<ChartProps> {}
  export class BarChart extends Component<ChartProps> {}
  export class PieChart extends Component<ChartProps> {}
  export class ProgressCircle extends Component<ChartProps> {}
  export class Grid extends Component<any> {}
}

declare module 'react-native-paper' {
  import { MD3Theme } from 'react-native-paper/lib/typescript/types';

  export interface ExtendedMD3Theme extends MD3Theme {
    dark: boolean;
    mode?: 'light' | 'dark';
    colors: {
      // MD3 renkleri
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
      
      // Özel uygulama renkleri
      primaryLight?: string;
      primaryDark?: string;
      secondaryLight?: string;
      secondaryDark?: string;
      card?: string;
      text?: string;
      textSecondary?: string;
      disabled?: string;
      placeholder?: string;
      notification?: string;
      success?: string;
      warning?: string;
      info?: string;
      border?: string;
      
      elevation: {
        level0: string;
        level1: string;
        level2: string;
        level3: string;
        level4: string;
        level5: string;
      };
    };
    fonts: any;
    roundness: number;
    animation: {
      scale: number;
    };
    spacing?: {
      xs: number;
      s: number;
      m: number;
      l: number;
      xl: number;
      xxl: number;
    };
    isV3?: boolean;
    version?: number;
  }

  export const useTheme: () => ExtendedMD3Theme;
  export const adaptNavigationTheme: (options: any) => { LightTheme: any; DarkTheme: any };
  export const MD3LightTheme: ExtendedMD3Theme;
  export const MD3DarkTheme: ExtendedMD3Theme;
}
