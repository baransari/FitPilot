import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus, Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';
import { useAppDispatch, useAppSelector } from '../store';
import { SleepEntry, addSleepEntry } from '../store/sleepTrackerSlice';

const STORAGE_KEYS = {
  LAST_ACTIVE_TIME: '@HealthTrackAI:lastActiveTime',
  SLEEP_START_TIME: '@HealthTrackAI:sleepStartTime',
  SLEEP_END_TIME: '@HealthTrackAI:sleepEndTime',
  SLEEP_DETECTION_ENABLED: '@HealthTrackAI:sleepDetectionEnabled',
};

// Uyku algılama için minimum süre (saat cinsinden)
const MIN_SLEEP_DURATION = 3; 

// Uyku olarak kabul edilecek hareketsizlik süresi (milisaniye)
const INACTIVITY_THRESHOLD = 5 * 60 * 1000; // 5 dakika

export default function useSleepDetector() {
  const dispatch = useAppDispatch();
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  const [lastActiveTime, setLastActiveTime] = useState<Date | null>(null);
  const [potentialSleepStartTime, setPotentialSleepStartTime] = useState<Date | null>(null);
  
  // Uygulamanın durumunu izle (aktif, arka planda, vb.)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (!isEnabled) return;
      
      const now = new Date();
      
      // Uygulama aktif oldu
      if (nextAppState === 'active') {
        const lastActive = lastActiveTime || now;
        const timeSinceLastActive = now.getTime() - lastActive.getTime();
        
        // Kullanıcı uzun süre uygulamayı kullanmadıysa, bu bir uyku olabilir
        if (timeSinceLastActive > INACTIVITY_THRESHOLD) {
          const potentialSleepStart = potentialSleepStartTime || lastActive;
          const sleepDuration = (now.getTime() - potentialSleepStart.getTime()) / (1000 * 60 * 60);
          
          // Minimum uyku süresinden daha uzun bir süre geçtiyse
          if (sleepDuration >= MIN_SLEEP_DURATION) {
            await detectSleep(potentialSleepStart, now);
          }
        }
        
        // Yeni aktif zamanı ayarla
        setLastActiveTime(now);
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TIME, now.toISOString());
        
        // Uyku bitişini kaydet (eğer uyku tespiti yapılıyorsa)
        if (isDetecting) {
          await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_END_TIME, now.toISOString());
          setIsDetecting(false);
        }
      } 
      // Uygulama arka plana geçti
      else if (nextAppState === 'background') {
        setLastActiveTime(now);
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVE_TIME, now.toISOString());
        
        // Potansiyel uyku başlangıcını kaydet
        if (!potentialSleepStartTime) {
          setPotentialSleepStartTime(now);
          await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_START_TIME, now.toISOString());
          setIsDetecting(true);
        }
      }
    };

    // Uygulama durumu değişikliğini dinle
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Başlangıç durumunu kontrol et
    const checkInitialState = async () => {
      try {
        // Özelliğin etkin olup olmadığını kontrol et
        const isEnabledStr = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_DETECTION_ENABLED);
        if (isEnabledStr) {
          setIsEnabled(isEnabledStr === 'true');
        }

        // Son aktif zamanı yükle
        const lastActiveStr = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVE_TIME);
        if (lastActiveStr) {
          setLastActiveTime(new Date(lastActiveStr));
        }

        // Potansiyel uyku başlangıcını yükle
        const sleepStartStr = await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_START_TIME);
        if (sleepStartStr) {
          setPotentialSleepStartTime(new Date(sleepStartStr));
        }

        // Devam eden bir uyku tespiti olup olmadığını kontrol et
        const hasSleepStart = Boolean(sleepStartStr);
        const hasSleepEnd = Boolean(await AsyncStorage.getItem(STORAGE_KEYS.SLEEP_END_TIME));
        
        setIsDetecting(hasSleepStart && !hasSleepEnd);
      } catch (error) {
        console.error('Uyku detektörü başlatılırken hata:', error);
      }
    };

    checkInitialState();

    return () => {
      subscription.remove();
    };
  }, [isEnabled, lastActiveTime, potentialSleepStartTime, isDetecting]);

  // Uyku tespiti yap ve kaydet
  const detectSleep = async (startTime: Date, endTime: Date): Promise<void> => {
    try {
      // Başlangıç ve bitiş saatlerini HH:MM formatına dönüştür
      const startHour = startTime.getHours().toString().padStart(2, '0');
      const startMinute = startTime.getMinutes().toString().padStart(2, '0');
      const endHour = endTime.getHours().toString().padStart(2, '0');
      const endMinute = endTime.getMinutes().toString().padStart(2, '0');
      
      const startTimeStr = `${startHour}:${startMinute}`;
      const endTimeStr = `${endHour}:${endMinute}`;
      
      // Uyku süresini hesapla
      let duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      duration = parseFloat(duration.toFixed(1));
      
      // Bugünün tarihini YYYY-MM-DD formatında al
      const today = new Date().toISOString().split('T')[0];
      
      // Yeni uyku kaydı oluştur
      const sleepEntry: Omit<SleepEntry, 'id'> = {
        date: today,
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: duration,
        quality: 'good', // Varsayılan kalite
        notes: 'Otomatik olarak tespit edildi',
      };
      
      // Redux store'a kaydet
      dispatch(addSleepEntry({
        ...sleepEntry,
        id: uuidv4(),
      }));
      
      // Temizlik - potansiyel uyku zamanlarını sıfırla
      setPotentialSleepStartTime(null);
      await AsyncStorage.removeItem(STORAGE_KEYS.SLEEP_START_TIME);
      await AsyncStorage.removeItem(STORAGE_KEYS.SLEEP_END_TIME);
      
      console.log('Uyku tespit edildi ve kaydedildi:', sleepEntry);
    } catch (error) {
      console.error('Uyku tespiti sırasında hata:', error);
    }
  };

  // Uyku tespitini etkinleştirme/devre dışı bırakma işlevi
  const toggleSleepDetection = async (enabled: boolean): Promise<void> => {
    try {
      setIsEnabled(enabled);
      await AsyncStorage.setItem(STORAGE_KEYS.SLEEP_DETECTION_ENABLED, enabled.toString());
      
      // Eğer devre dışı bırakılıyorsa, devam eden uyku tespitini de iptal et
      if (!enabled && isDetecting) {
        setPotentialSleepStartTime(null);
        setIsDetecting(false);
        await AsyncStorage.removeItem(STORAGE_KEYS.SLEEP_START_TIME);
        await AsyncStorage.removeItem(STORAGE_KEYS.SLEEP_END_TIME);
      }
    } catch (error) {
      console.error('Uyku tespiti etkinleştirme/devre dışı bırakma sırasında hata:', error);
    }
  };

  // Manuel uyku tespiti - belirli bir zaman aralığı için uyku tespiti yapar
  const detectSleepManually = async (startTime: Date, endTime: Date): Promise<void> => {
    try {
      await detectSleep(startTime, endTime);
    } catch (error) {
      console.error('Manuel uyku tespiti sırasında hata:', error);
    }
  };
  
  return {
    isEnabled,
    isDetecting,
    toggleSleepDetection,
    detectSleepManually,
  };
} 