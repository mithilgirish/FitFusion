import { useState, useEffect } from 'react';
import {
  initialize,
  requestPermission,
  readRecords,
  insertRecords,
} from 'react-native-health-connect';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WaterReminderSettings {
  isEnabled: boolean;
  startTime: string;  // ISO string
  endTime: string;    // ISO string
  interval: number;   // in minutes
  dailyTarget: number; // in ml
}

export const useWaterTracking = () => {
  const [consumedWater, setConsumedWater] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isHealthConnectAvailable, setIsHealthConnectAvailable] = useState(false);
  const [settings, setSettings] = useState<WaterReminderSettings>({
    isEnabled: false,
    startTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(22, 0, 0, 0)).toISOString(),
    interval: 60, // 1 hour
    dailyTarget: 2500, // 2.5L
  });

  useEffect(() => {
    initializeHealthConnect();
    loadSettings();
  }, []);

  const initializeHealthConnect = async () => {
    try {
      console.log('Initializing Health Connect for water tracking...');
      const isInitialized = await initialize();
      console.log('Health Connect initialized:', isInitialized);
      
      if (!isInitialized) {
        console.log('Health Connect could not be initialized');
        setIsHealthConnectAvailable(false);
        return;
      }

      setIsHealthConnectAvailable(true);
      console.log('Health Connect is available, requesting permissions...');
      await requestPermissions();
      console.log('Permissions granted, fetching water data...');
      await getWaterData();
    } catch (error) {
      console.error('Error initializing Health Connect:', error);
      setIsHealthConnectAvailable(false);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermissions = async () => {
    try {
      const granted = await requestPermission([
        { accessType: 'read', recordType: 'Hydration' },
        { accessType: 'write', recordType: 'Hydration' },
      ]);
      console.log('Water tracking permission status:', granted);
    } catch (error) {
      console.error('Error requesting water tracking permissions:', error);
    }
  };

  const getWaterData = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      // Get hydration data
      const hydrationData = await readRecords('Hydration', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });
      
      if (hydrationData && hydrationData.records && hydrationData.records.length > 0) {
        const totalWater = hydrationData.records.reduce((sum, record) => sum + record.volume.inMilliliters, 0);
        setConsumedWater(totalWater);
      } else {
        setConsumedWater(0);
      }
    } catch (error) {
      console.error('Error getting water data:', error);
    }
  };

  const addWaterIntake = async (amount: number) => {
    if (!isHealthConnectAvailable) {
      // Fallback to local storage if Health Connect is not available
      const newTotal = consumedWater + amount;
      setConsumedWater(newTotal);
      await AsyncStorage.setItem(
        `waterConsumed-${new Date().toDateString()}`, 
        newTotal.toString()
      );
      return;
    }

    try {
      const now = new Date();
      
      await insertRecords([
        {
          recordType: 'Hydration',
          volume: {
            value: amount,
            unit: 'milliliters',
          },
          startTime: now.toISOString(),
          endTime: now.toISOString(),
        }
      ]);
      
      // Refresh data after adding
      await getWaterData();
    } catch (error) {
      console.error('Error adding water intake:', error);
      // Fallback to local storage
      const newTotal = consumedWater + amount;
      setConsumedWater(newTotal);
      await AsyncStorage.setItem(
        `waterConsumed-${new Date().toDateString()}`, 
        newTotal.toString()
      );
    }
  };

  const resetWaterIntake = async () => {
    if (!isHealthConnectAvailable) {
      setConsumedWater(0);
      await AsyncStorage.setItem(
        `waterConsumed-${new Date().toDateString()}`, 
        '0'
      );
      return;
    }

    try {
      // For Health Connect, we would need to delete all records for today
      // This is a simplified approach - in a real app you might want to 
      // implement a proper deletion of today's records
      
      // For now, we'll just update the UI and wait for the next sync
      setConsumedWater(0);
    } catch (error) {
      console.error('Error resetting water intake:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('waterReminderSettings');
      
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Convert Date objects stored as strings back to ISO strings
        if (parsedSettings.startTime instanceof Date) {
          parsedSettings.startTime = parsedSettings.startTime.toISOString();
        }
        if (parsedSettings.endTime instanceof Date) {
          parsedSettings.endTime = parsedSettings.endTime.toISOString();
        }
        
        setSettings(parsedSettings);
      }
    } catch (error) {
      console.error('Failed to load water reminder settings:', error);
    }
  };

  const saveSettings = async (newSettings: WaterReminderSettings) => {
    try {
      await AsyncStorage.setItem('waterReminderSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save water reminder settings:', error);
    }
  };

  return {
    consumedWater,
    isLoading,
    settings,
    isHealthConnectAvailable,
    addWaterIntake,
    resetWaterIntake,
    saveSettings,
    refreshWaterData: getWaterData
  };
}; 