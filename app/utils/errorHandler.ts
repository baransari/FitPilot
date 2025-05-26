/**
 * Error Handler Utility
 * Patches common React Native issues including PlatformConstants error
 */

import { LogBox, NativeModules, Platform } from 'react-native';

// Type definitions for better TypeScript support
interface PlatformConstantsType {
  isTesting: boolean;
  reactNativeVersion: {
    major: number;
    minor: number;
    patch: number;
  };
  Version: number;
  osVersion: string;
  interfaceIdiom: string;
  systemName: string;
  Dimensions: {
    windowPhysicalPixels: {
      width: number;
      height: number;
      scale: number;
      fontScale: number;
    };
    screenPhysicalPixels: {
      width: number;
      height: number;
      scale: number;
      fontScale: number;
    };
  };
}

// Ignore specific warnings that we can't fix
const ignoredWarnings: string[] = [
  'Non-serializable values were found in the navigation state',
  'ViewPropTypes will be removed from React Native',
  'ColorPropType will be removed from React Native',
  'Sending `onAnimatedValueUpdate` with no listeners registered',
  'AsyncStorage has been extracted from react-native',
  'VirtualizedLists should never be nested',
  'Animated: `useNativeDriver` was not specified',
  "TurboModuleRegistry.getEnforcing(...): 'PlatformConstants'",
  'PlatformConstants is not available',
  'RCTBridge required dispatch_sync to load RCTDevLoadingView',
  'new NativeEventEmitter()',
  'Accessing the `state` in the `componentWillMount`',
  'componentWillReceiveProps has been renamed',
  'componentWillMount has been renamed',
  'NativeBase:',
  'Each child in a list should have a unique',
  'source.uri should not be an empty string',
  'fontFamily "Ionicons" is not a system font',
];

LogBox.ignoreLogs(ignoredWarnings);

// Patch PlatformConstants if needed
export const patchPlatformConstants = (): void => {
  try {
    // Only apply patch if needed
    if (Platform.OS === 'ios' && !NativeModules.PlatformConstants) {
      console.log('Patching missing PlatformConstants');
      
      // Create mock PlatformConstants
      const mockPlatformConstants: PlatformConstantsType = {
        isTesting: false,
        reactNativeVersion: {
          major: 0,
          minor: 79,
          patch: 2,
        },
        Version: 1,
        osVersion: Platform.constants?.osVersion || '16.0',
        interfaceIdiom: 'phone',
        systemName: 'iOS',
        Dimensions: {
          windowPhysicalPixels: {
            width: 750,
            height: 1334,
            scale: 2,
            fontScale: 1,
          },
          screenPhysicalPixels: {
            width: 750,
            height: 1334,
            scale: 2,
            fontScale: 1,
          },
        },
      };
      
      NativeModules.PlatformConstants = mockPlatformConstants;
    }
  } catch (error) {
    console.warn('Failed to patch PlatformConstants:', error);
  }
};

// Disable development tools in production to prevent memory leaks
export const disableDevelopmentTools = (): void => {
  try {
    // Disable React DevTools
    const globalObj = global as any;
    if (globalObj.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      globalObj.__REACT_DEVTOOLS_GLOBAL_HOOK__.inject = function () {};
    }

    // Disable Redux DevTools
    if (globalObj.__REMOTEDEV__) {
      globalObj.__REMOTEDEV__ = false;
    }

    // Only in production, disable console methods
    if (typeof __DEV__ !== 'undefined' && !__DEV__) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }
  } catch (error) {
    // Silently fail
  }
};

// Initialize all patches
export const initializeErrorHandling = (): void => {
  patchPlatformConstants();
  disableDevelopmentTools();
};

export default {
  initializeErrorHandling,
  patchPlatformConstants,
  disableDevelopmentTools,
};
