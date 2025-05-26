declare module 'react-native-vector-icons/MaterialCommunityIcons';
declare module 'react-native-vector-icons/MaterialIcons';
declare module 'react-native-vector-icons/Ionicons';
declare module 'react-native-vector-icons/FontAwesome';
declare module 'react-native-vector-icons/FontAwesome5';
declare module 'react-native-vector-icons/FontAwesome6';
declare module 'react-native-vector-icons/AntDesign';
declare module 'react-native-vector-icons/Entypo';
declare module 'react-native-vector-icons/EvilIcons';
declare module 'react-native-vector-icons/Feather';
declare module 'react-native-vector-icons/Foundation';
declare module 'react-native-vector-icons/Octicons';
declare module 'react-native-vector-icons/SimpleLineIcons';
declare module 'react-native-vector-icons/Zocial';

// React Native Sensors modül tanımlaması
declare module 'react-native-sensors' {
  export interface SensorData {
    x: number;
    y: number;
    z: number;
    timestamp: number;
  }
  
  export const accelerometer: any;
  export const gyroscope: any;
  export const magnetometer: any;
  export const barometer: any;
  export const orientation: any;
}

// React Native Pedometer modül tanımlaması
declare module 'react-native-pedometer' {
  export interface PedometerData {
    numberOfSteps: number;
    distance: number;
    floorsAscended: number;
    floorsDescended: number;
    currentPace: number;
    currentCadence: number;
    startDate: string;
    endDate: string;
  }
  
  export default class Pedometer {
    static isStepCountingAvailable(): Promise<boolean>;
    static startPedometerUpdatesFromDate(date: Date, handler: (data: PedometerData) => void): void;
    static stopPedometerUpdates(): void;
    static queryPedometerDataBetweenDates(startDate: Date, endDate: Date): Promise<PedometerData>;
  }
}

// React Native Paper iç modülü için tip tanımlaması
declare module 'src/types' {
  import type { TextStyle } from 'react-native';
  
  export interface ThemeProp {
    theme: ReactNativePaper.Theme;
  }
  
  export interface EllipsizeProp {
    ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  }
  
  export interface InternalTheme extends ReactNativePaper.Theme {
    isV3: boolean;
    version: 2 | 3;
  }
  
  export type Font = {
    fontFamily: string;
    fontWeight?:
      | 'normal'
      | 'bold'
      | '100'
      | '200'
      | '300'
      | '400'
      | '500'
      | '600'
      | '700'
      | '800'
      | '900';
  };
  
  export type Fonts = {
    regular: Font;
    medium: Font;
    light: Font;
    thin: Font;
  };
}

// React Native Vector Icons iç modül tanımlaması
declare module '@react-native-vector-icons/material-design-icons' {
  import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  export default MaterialIcons;
}

// UUID modül tanımlaması
declare module 'uuid' {
  export function v4(): string;
  export function v1(): string;
  export function v3(name: string, namespace: string): string;
  export function v5(name: string, namespace: string): string;
}
