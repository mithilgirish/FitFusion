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

export interface WorkoutData {
  id: string;
  name: string;
  type: string;
  date: string;
  duration: number;
  calories: number;
  distance?: number;
}

export const useHealthData = () => {
  const [steps, setSteps] = useState(0);
  const [distance, setDistance] = useState(0);
  const [floors, setFloors] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [height, setHeight] = useState(0);
  const [weight, setWeight] = useState(0);
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
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
        { accessType: 'read', recordType: 'Height' },
        { accessType: 'read', recordType: 'Weight' },
        { accessType: 'read', recordType: 'ExerciseSession' },
        { accessType: 'read', recordType: 'ActiveCaloriesBurned' },
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
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

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

      // Get height data (most recent from the last 30 days)
      const heightData = await readRecords('Height', {
        timeRangeFilter: {
          operator: 'between',
          startTime: thirtyDaysAgo.toISOString(),
          endTime: now.toISOString(),
        },
      });
      
      console.log('Height data retrieved:', JSON.stringify(heightData));
      
      if (heightData && heightData.records && heightData.records.length > 0) {
        // Sort by time to get the most recent
        const sortedRecords = [...heightData.records].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        console.log('Most recent height record:', JSON.stringify(sortedRecords[0]));
        setHeight(sortedRecords[0].height.inMeters);
      } else {
        console.log('No height records found');
      }

      // Get weight data (most recent from the last 30 days)
      const weightData = await readRecords('Weight', {
        timeRangeFilter: {
          operator: 'between',
          startTime: thirtyDaysAgo.toISOString(),
          endTime: now.toISOString(),
        },
      });
      
      console.log('Weight data retrieved:', JSON.stringify(weightData));
      
      if (weightData && weightData.records && weightData.records.length > 0) {
        // Sort by time to get the most recent
        const sortedRecords = [...weightData.records].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );
        console.log('Most recent weight record:', JSON.stringify(sortedRecords[0]));
        setWeight(sortedRecords[0].weight.inKilograms);
      } else {
        console.log('No weight records found');
      }
      
      // Get workout data from the last 30 days
      await getWorkoutData();
      
    } catch (error) {
      console.error('Error getting health data:', error);
    }
  };
  
  const getWorkoutData = async () => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      // Get exercise sessions
      const exerciseData = await readRecords('ExerciseSession', {
        timeRangeFilter: {
          operator: 'between',
          startTime: thirtyDaysAgo.toISOString(),
          endTime: now.toISOString(),
        },
      });
      
      console.log('Exercise data retrieved:', JSON.stringify(exerciseData));
      
      if (exerciseData && exerciseData.records && exerciseData.records.length > 0) {
        // Get calories for each exercise session
        const workoutList: WorkoutData[] = await Promise.all(
          exerciseData.records.map(async (exercise) => {
            // Try to get calories burned during this exercise
            const caloriesData = await readRecords('ActiveCaloriesBurned', {
              timeRangeFilter: {
                operator: 'between',
                startTime: exercise.startTime,
                endTime: exercise.endTime,
              },
            });
            
            // Calculate total calories
            let totalCalories = 0;
            if (caloriesData && caloriesData.records && caloriesData.records.length > 0) {
              totalCalories = caloriesData.records.reduce(
                (sum, record) => sum + record.energy.inKilocalories, 
                0
              );
            }
            
            // Get distance if available
            const distanceData = await readRecords('Distance', {
              timeRangeFilter: {
                operator: 'between',
                startTime: exercise.startTime,
                endTime: exercise.endTime,
              },
            });
            
            let distanceKm;
            if (distanceData && distanceData.records && distanceData.records.length > 0) {
              const totalMeters = distanceData.records.reduce(
                (sum, record) => sum + record.distance.inMeters, 
                0
              );
              distanceKm = totalMeters / 1000;
            }
            
            // Calculate duration in minutes
            const durationMs = new Date(exercise.endTime).getTime() - new Date(exercise.startTime).getTime();
            const durationMinutes = Math.round(durationMs / (1000 * 60));
            
            // Format date for display
            const exerciseDate = new Date(exercise.startTime);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            
            let dateDisplay;
            if (exerciseDate.toDateString() === today.toDateString()) {
              dateDisplay = `Today, ${exerciseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else if (exerciseDate.toDateString() === yesterday.toDateString()) {
              dateDisplay = `Yesterday, ${exerciseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            } else {
              dateDisplay = `${exerciseDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${exerciseDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
            }
            
            // Map exercise title to more readable names
            let workoutName = exercise.title || 'Workout';
            let workoutType = exercise.exerciseType || 'Other';
            
            // Make the type more user-friendly
            if (typeof workoutType === 'string') {
              workoutType = workoutType.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim();
              workoutType = workoutType.charAt(0).toUpperCase() + workoutType.slice(1);
            } else {
              workoutType = 'Other';
            }
            
            return {
              id: exercise.metadata?.id || Math.random().toString(),
              name: workoutName,
              type: String(workoutType),
              date: dateDisplay,
              duration: durationMinutes,
              calories: Math.round(totalCalories),
              distance: distanceKm ? parseFloat(distanceKm.toFixed(2)) : undefined
            };
          })
        );
        
        // Sort workouts by date (newest first)
        workoutList.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        console.log('Processed workout data:', workoutList);
        setWorkouts(workoutList);
      } else {
        console.log('No workout records found');
      }
    } catch (error) {
      console.error('Error fetching workout data:', error);
    }
  };

  return {
    steps,
    distance,
    floors,
    sleepHours,
    sleepStages,
    height,
    weight,
    workouts,
    getHealthData,
    getWorkoutData,
    setHeight,
    setWeight,
  };
}; 