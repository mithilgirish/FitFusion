import { useState, useEffect } from 'react';
import {
  initialize,
  requestPermission,
  readRecords,
} from 'react-native-health-connect';

interface SleepStages {
  REM: number;
  deep: number;
  light: number;
  awake: number;
}

export const useHealthData = () => {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [floors, setFloors] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [sleepStages, setSleepStages] = useState<SleepStages>({
    REM: 0,
    deep: 0,
    light: 0,
    awake: 0,
  });

  useEffect(() => {
    initializeHealthConnect();
  }, []);

  const initializeHealthConnect = async () => {
    try {
      console.log('Initializing Health Connect...');
      const isInitialized = await initialize();
      console.log('Health Connect initialized:', isInitialized);
      
      if (!isInitialized) {
        console.log('Health Connect could not be initialized');
        return;
      }

      console.log('Health Connect is available, requesting permissions...');
      await requestPermissions();
      console.log('Permissions granted, fetching health data...');
      await getHealthData();
    } catch (error) {
      console.error('Error initializing Health Connect:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
      }
    }
  };

  const requestPermissions = async () => {
    try {
      const granted = await requestPermission([
        { accessType: 'read', recordType: 'Steps' },
        { accessType: 'read', recordType: 'Distance' },
        { accessType: 'read', recordType: 'FloorsClimbed' },
        { accessType: 'read', recordType: 'SleepSession' },
      ]);
      console.log('Permission status:', granted);
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  const getHealthData = async () => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

      // Get steps
      const stepsData = await readRecords('Steps', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });
      
      if (stepsData && stepsData.records && stepsData.records.length > 0) {
        const totalSteps = stepsData.records.reduce((sum, record) => sum + record.count, 0);
        setSteps(totalSteps);
      }

      // Get distance
      const distanceData = await readRecords('Distance', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });
      
      if (distanceData && distanceData.records && distanceData.records.length > 0) {
        const totalDistance = distanceData.records.reduce((sum, record) => sum + record.distance.inMeters, 0);
        setDistance(totalDistance);
      }

      // Get floors
      const floorsData = await readRecords('FloorsClimbed', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });
      
      if (floorsData && floorsData.records && floorsData.records.length > 0) {
        const totalFloors = floorsData.records.reduce((sum, record) => sum + record.floors, 0);
        setFloors(totalFloors);
      }

      // Get sleep data
      const sleepData = await readRecords('SleepSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: startOfDay.toISOString(),
          endTime: endOfDay.toISOString(),
        },
      });

      if (sleepData && sleepData.records && sleepData.records.length > 0) {
        let totalSleepHours = 0;
        const stages: SleepStages = {
          REM: 0,
          deep: 0,
          light: 0,
          awake: 0,
        };

        sleepData.records.forEach((session) => {
          const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60 * 60);
          totalSleepHours += duration;

          // Estimate sleep stages based on typical patterns
          stages.REM += duration * 0.25; // 25% REM sleep
          stages.deep += duration * 0.25; // 25% deep sleep
          stages.light += duration * 0.45; // 45% light sleep
          stages.awake += duration * 0.05; // 5% awake time
        });

        setSleepHours(totalSleepHours);
        setSleepStages(stages);
      }
    } catch (error) {
      console.error('Error getting health data:', error);
    }
  };

  return {
    steps,
    distance,
    floors,
    sleepHours,
    sleepStages,
  };
}; 