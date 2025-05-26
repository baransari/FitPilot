import { useState, useEffect, useCallback } from 'react';
import { Platform, NativeModules } from 'react-native';
// Redux imports - doğrudan store ve dispatch kullanımına geçiyoruz
import store from '../store';
import { AnyAction } from 'redux';
import { setDailySteps, updateStepGoal, setIsStepAvailable } from '../store/stepTrackerSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sensör paketleri için koşullu importlar - simülatörde hata vermemesi için
let RNPedometer: any = null;
let accelerometer: any = null;
let setUpdateIntervalForType: any = null;
let SensorTypes: any = null;

// Simülatörde olup olmadığımızı tespit etmek için 
// iOS için simülatör tespiti
const isIosSimulator = Platform.OS === 'ios' && NativeModules.RNDeviceInfo?.isEmulator;
// Android için emülatör tespiti
const isAndroidEmulator = Platform.OS === 'android' && NativeModules.RNDeviceInfo?.isEmulator;
// isEmulator değişkeni oluştur
const isEmulator = isIosSimulator || isAndroidEmulator;

// Sadece gerçek cihazda modülleri yükle
if (!isEmulator && Platform.OS === 'ios') {
  try {
    RNPedometer = require('react-native-pedometer');
  } catch (e) {
    console.log('Pedometer modülü yüklenemedi', e);
  }
}

if (!isEmulator) {
  try {
    const RNSensors = require('react-native-sensors');
    accelerometer = RNSensors.accelerometer;
    setUpdateIntervalForType = RNSensors.setUpdateIntervalForType;
    SensorTypes = RNSensors.SensorTypes;
  } catch (e) {
    console.log('Sensors modülü yüklenemedi', e);
  }
}

// Storage keys
const STORAGE_KEYS = {
  STEP_GOAL: '@HealthTrackAI:stepGoal',
};

// Default daily step goal
const DEFAULT_STEP_GOAL = 10000;

// Safer Redux helpers that don't depend on hooks
const safeStore = {
  getState: () => {
    try {
      return store.getState();
    } catch (error) {
      console.error('Error accessing Redux store state:', error);
      return null;
    }
  },
  
  dispatch: (action: AnyAction) => {
    try {
      return store.dispatch(action);
    } catch (error) {
      console.error('Error dispatching Redux action:', error);
      return null;
    }
  },
  
  getStepTrackerState: () => {
    try {
      const state = store.getState();
      return state?.stepTracker || null;
    } catch (error) {
      console.error('Error accessing step tracker state:', error);
      return null;
    }
  },
  
  subscribe: (listener: () => void) => {
    try {
      return store.subscribe(listener);
    } catch (error) {
      console.error('Error subscribing to Redux store:', error);
      // Return a no-op unsubscribe function to prevent errors
      return () => {};
    }
  }
};

// Pedometer type definitions
interface PedometerResult {
  steps: number;
}

interface Subscription {
  remove: () => void;
}

interface Pedometer {
  isAvailableAsync: () => Promise<boolean>;
  getStepCountAsync: (start: Date, end: Date) => Promise<PedometerResult>;
  watchStepCount: (callback: (result: PedometerResult) => void) => Subscription;
}

// Pedometer için platform özel implementasyon
const createPedometerImplementation = (): Pedometer | null => {
  // Simülatörde çalışıyorsak, doğrudan null döndür
  if (isEmulator) {
    console.log('Simülatörde çalışılıyor, adım sensörü simülasyonu kullanılacak');
    return null;
  }

  // iOS için
  if (Platform.OS === 'ios' && RNPedometer) {
    return {
      isAvailableAsync: async (): Promise<boolean> => {
        try {
          return await RNPedometer.isStepCountingAvailable();
        } catch (error) {
          console.error('Error checking pedometer availability:', error);
          return false;
        }
      },
      getStepCountAsync: async (start: Date, end: Date): Promise<PedometerResult> => {
        try {
          const result = await RNPedometer.startPedometerUpdatesFromDate(start);
          return { steps: result?.numberOfSteps || 0 };
        } catch (error) {
          console.error('Error getting step count:', error);
          return { steps: 0 };
        }
      },
      watchStepCount: (callback: (result: PedometerResult) => void): Subscription => {
        try {
          RNPedometer.startPedometerUpdatesFromDate(new Date());
          // Define an interface for pedometer data
          interface PedometerData {
            numberOfSteps: number;
            [key: string]: any;
          }
          const subscription = RNPedometer.addListener('pedometerDataDidUpdate', (data: PedometerData) => {
            callback({ steps: data.numberOfSteps });
          });
          
          return {
            remove: () => {
              subscription.remove();
              RNPedometer.stopPedometerUpdates();
            }
          };
        } catch (error) {
          console.error('Error watching step count:', error);
          return { remove: () => {} };
        }
      }
    };
  }
  
  // Android için (Android'de accelerometer sensörünü kullanarak adım sayısını tahmin ediyoruz)
  if (Platform.OS === 'android' && accelerometer) {
    // Android'de sensor datası için yüksek güncelleme hızı ayarlıyoruz
    setUpdateIntervalForType(SensorTypes.accelerometer, 100);
    
    // Adım algılama için basit bir algoritma
    let stepCount = 0;
    let lastMagnitude = 0;
    let lastUpdate = 0;
    const threshold = 10; // Adım olarak sayılacak ivme değişimi eşiği
    
    return {
      isAvailableAsync: async (): Promise<boolean> => {
        try {
          // Accelerometer varsa, true döndür
          return true;
        } catch (error) {
          console.error('Error checking accelerometer availability:', error);
          return false;
        }
      },
      getStepCountAsync: async (): Promise<PedometerResult> => {
        // Güncel adım sayısını döndür
        return { steps: stepCount };
      },
      watchStepCount: (callback: (result: PedometerResult) => void): Subscription => {
        // Accelerometer aboneliği
        interface SensorData {
          x: number;
          y: number;
          z: number;
          timestamp: number;
        }
        const subscription = accelerometer.subscribe(({ x, y, z, timestamp }: SensorData) => {
          // İvme vektörünün büyüklüğünü hesapla
          const magnitude = Math.sqrt(x * x + y * y + z * z);
          const now = Date.now();
          
          // Son güncellemenin üzerinden belli bir süre geçmişse
          if (now - lastUpdate > 100) {
            // Büyüklük farkını hesapla
            const delta = Math.abs(magnitude - lastMagnitude);
            
            // Eşiği geçerse adım sayısını artır
            if (delta > threshold) {
              stepCount++;
              callback({ steps: stepCount });
            }
            
            lastMagnitude = magnitude;
            lastUpdate = now;
          }
        });
        
        return {
          remove: () => {
            subscription.unsubscribe();
          }
        };
      }
    };
  }
  
  // Eğer desteklenen bir platform değilse veya sensörler mevcut değilse simülatörü kullan
  console.log('No pedometer implementation available, using simulation mode');
  return null;
};

// Step simulator for devices without pedometer
class StepSimulator {
  private steps: number = 0;
  private callbacks: ((steps: number) => void)[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  start() {
    // Generate random steps (every 5-10 seconds)
    this.timer = setInterval(() => {
      // Add 10-30 random steps
      const newSteps = Math.floor(Math.random() * 20) + 10;
      this.steps += newSteps;

      // Call all callbacks
      this.callbacks.forEach(callback => callback(this.steps));
    }, Math.random() * 5000 + 5000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  registerCallback(callback: (steps: number) => void): Subscription {
    this.callbacks.push(callback);
    return {
      remove: () => {
        this.callbacks = this.callbacks.filter(cb => cb !== callback);
      },
    };
  }

  getTotalSteps(): number {
    return this.steps;
  }

  reset(): void {
    this.steps = 0;
  }
}

// Create step simulator instance
const stepSimulator = new StepSimulator();

// Calculate start and end time (beginning and end of today)
const getStartAndEndTime = () => {
  const end = new Date();
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  return { start, end };
};

export default function useStepTracker() {
  // Track initialization state to ensure we only do setup work once
  const [isInitialized, setIsInitialized] = useState(false);
  // Use error state to track any critical errors
  const [criticalError, setCriticalError] = useState<string | null>(null);
  
  // Get initial data from Redux store
  const [dailySteps, setLocalDailySteps] = useState<number>(0);
  const [stepGoal, setLocalStepGoal] = useState<number>(DEFAULT_STEP_GOAL);
  const [isStepAvailable, setLocalStepAvailable] = useState<boolean>(false);

  // Local Redux dispatch helper function
  const safeDispatch = useCallback((action: AnyAction) => {
    try {
      safeStore.dispatch(action);
      return true;
    } catch (error) {
      console.error('Error dispatching action:', error);
      return false;
    }
  }, []);

  // Initialize pedometer module more safely
  useEffect(() => {
    // Skip if already initialized
    if (isInitialized) return;

    const initialize = async () => {
      try {
        console.log("Initializing step tracker...");
         
        // Reset step goal to default 10000
        await AsyncStorage.setItem(STORAGE_KEYS.STEP_GOAL, DEFAULT_STEP_GOAL.toString());
        safeDispatch(updateStepGoal(DEFAULT_STEP_GOAL));
        setLocalStepGoal(DEFAULT_STEP_GOAL);
          
        // Step 1: Get initial data from Redux (once, at startup)
        try {
          const stepState = safeStore.getStepTrackerState();
          if (stepState) {
            setLocalDailySteps(stepState.dailySteps || 0);
            setLocalStepGoal(stepState.stepGoal || DEFAULT_STEP_GOAL);
            setLocalStepAvailable(stepState.isStepAvailable || false);
          }
        } catch (stateError) {
          console.error("Error getting initial Redux state:", stateError);
        }

        // Step 2: Try to load pedometer implementation
        const pedometer = createPedometerImplementation();
        
        // Step 3: Try to load data from AsyncStorage
        try {
          const savedGoal = await AsyncStorage.getItem(STORAGE_KEYS.STEP_GOAL);
          if (savedGoal) {
            const parsedGoal = parseInt(savedGoal, 10);
            if (!isNaN(parsedGoal) && parsedGoal > 0) {
              safeDispatch(updateStepGoal(parsedGoal));
              setLocalStepGoal(parsedGoal);
            }
          }
        } catch (error) {
          console.error('Error loading step goal from AsyncStorage:', error);
        }

        // Step 4: Check if pedometer is available on this device
        let stepAvailable = false;
        
        try {
          if (pedometer) {
            stepAvailable = await pedometer.isAvailableAsync();
            console.log('Pedometer availability:', stepAvailable);
            
            if (stepAvailable) {
              // Start tracking steps with real pedometer
              const startOfDay = getStartAndEndTime().start;
              
              // Get initial steps from start of day
              try {
                const initialSteps = await pedometer.getStepCountAsync(startOfDay, new Date());
                safeDispatch(setDailySteps(initialSteps.steps));
                setLocalDailySteps(initialSteps.steps);
              } catch (stepsError) {
                console.error('Error getting initial steps:', stepsError);
              }
              
              // Subscribe to live updates
              const subscription = pedometer.watchStepCount((result) => {
                safeDispatch(setDailySteps(result.steps));
                setLocalDailySteps(result.steps);
              });
              
              // Cleanup when component unmounts
              return () => {
                subscription.remove();
              };
            }
          }
        } catch (error) {
          console.error('Error checking pedometer:', error);
        }
        
        // Update state with availability result
        safeDispatch(setIsStepAvailable(stepAvailable));
        setLocalStepAvailable(stepAvailable);
        
        // If no real pedometer, use simulation
        if (!stepAvailable) {
          console.log("Starting step simulator...");
          stepSimulator.start();
          const randomSteps = Math.floor(Math.random() * 2000) + 3000;
          safeDispatch(setDailySteps(randomSteps));
          setLocalDailySteps(randomSteps);
        }

        // Initialization complete
        setIsInitialized(true);
        console.log("Step tracker initialization complete");
      } catch (error) {
        console.error('Critical error during initialization:', error);
        setCriticalError('Initialization failed');
        // Ensure we still mark as initialized to prevent infinite retries
        setIsInitialized(true);
      }
    };

    initialize();

    // Cleanup function
    return () => {
      try {
        stepSimulator.stop();
      } catch (error) {
        console.error('Error stopping step simulator:', error);
      }
    };
  }, [safeDispatch, isInitialized]);

  // Subscribe to Redux store changes
  useEffect(() => {
    if (!isInitialized) return;
    
    const unsubscribe = safeStore.subscribe(() => {
      try {
        const state = safeStore.getState();
        if (state && state.stepTracker) {
          setLocalDailySteps(state.stepTracker.dailySteps);
          setLocalStepGoal(state.stepTracker.stepGoal);
          setLocalStepAvailable(state.stepTracker.isStepAvailable);
        }
      } catch (error) {
        console.error('Error in Redux subscription:', error);
      }
    });
    
    return () => {
      try {
        unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing from Redux store:', error);
      }
    };
  }, [isInitialized]);

  // Update step count from simulation (if sensor is not available)
  useEffect(() => {
    // Don't track simulated steps until initialized or if critical error or if real pedometer available
    if (!isInitialized || criticalError || isStepAvailable) return;
    
    // Listen for step updates from simulator
    let subscription: Subscription | null = null;
    
    try {
      subscription = stepSimulator.registerCallback(steps => {
        try {
          safeDispatch(setDailySteps(steps));
          setLocalDailySteps(steps);
        } catch (error) {
          console.error('Error updating steps from simulator:', error);
          setLocalDailySteps(steps);
        }
      });
    } catch (error) {
      console.error('Error registering step simulator callback:', error);
    }

    return () => {
      if (subscription) {
        try {
          subscription.remove();
        } catch (error) {
          console.error('Error removing simulator subscription:', error);
        }
      }
    };
  }, [isInitialized, criticalError, isStepAvailable, safeDispatch]);

  // Update step goal - optimized with callback
  const updateGoal = useCallback(async (newGoal: number) => {
    if (criticalError) {
      console.error('Cannot update goal due to critical error');
      return;
    }
    
    if (!newGoal || isNaN(newGoal) || newGoal <= 0) {
      console.error('Invalid goal value:', newGoal);
      return;
    }
    
    try {
      safeDispatch(updateStepGoal(newGoal));
      setLocalStepGoal(newGoal);
      
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.STEP_GOAL, newGoal.toString());
      } catch (storageError) {
        console.error('Error saving step goal to AsyncStorage:', storageError);
      }
    } catch (error) {
      console.error('Error updating step goal:', error);
    }
  }, [safeDispatch, criticalError]);

  // Manually add steps (for simulation mode)
  const addSteps = useCallback((steps: number) => {
    if (criticalError) {
      console.error('Cannot add steps due to critical error');
      return;
    }
    
    if (!steps || isNaN(steps) || steps <= 0) {
      console.error('Invalid steps value:', steps);
      return;
    }
    
    try {
      const newSteps = dailySteps + steps;
      safeDispatch(setDailySteps(newSteps));
      setLocalDailySteps(newSteps);
    } catch (error) {
      console.error('Error adding steps manually:', error);
      // Update local state even if Redux fails
      setLocalDailySteps(dailySteps + steps);
    }
  }, [dailySteps, safeDispatch, criticalError]);

  // Calculate step percentage - safely
  const calculateStepPercentage = useCallback((): number => {
    try {
      if (!stepGoal) return 0;
      return Math.min(Math.round((dailySteps / stepGoal) * 100), 100);
    } catch (error) {
      console.error('Error calculating step percentage:', error);
      return 0;
    }
  }, [dailySteps, stepGoal]);

  return {
    dailySteps,
    stepGoal: stepGoal || DEFAULT_STEP_GOAL,
    isStepAvailable,
    updateGoal,
    addSteps,
    stepPercentage: calculateStepPercentage(),
    // Return error state to inform UI about critical errors
    error: criticalError
  };
}