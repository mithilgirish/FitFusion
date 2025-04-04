import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  SafeAreaView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHealthData, WorkoutData } from '../hooks/useHealthData';

interface WorkoutLogItemProps {
  workout: WorkoutData;
  onPress: () => void;
  colors: any;
}

const WorkoutLogItem: React.FC<WorkoutLogItemProps> = ({ workout, onPress, colors }) => {
  return (
    <TouchableOpacity 
      style={[styles.workoutItem, { backgroundColor: colors.card }]} 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[colors.primary, colors.secondary]}
        style={styles.workoutGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.workoutTitle}>{workout.name}</Text>
        <Text style={styles.workoutDate}>{workout.date}</Text>
        <View style={styles.workoutDetails}>
          <View style={styles.workoutStat}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#fff" />
            <Text style={styles.workoutStatText}>{workout.duration} min</Text>
          </View>
          <View style={styles.workoutStat}>
            <MaterialCommunityIcons name="fire" size={16} color="#fff" />
            <Text style={styles.workoutStatText}>{workout.calories} cal</Text>
          </View>
          {workout.distance && (
            <View style={styles.workoutStat}>
              <MaterialCommunityIcons name="map-marker-distance" size={16} color="#fff" />
              <Text style={styles.workoutStatText}>{workout.distance} km</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default function WorkoutTrackingScreen({ navigation }: any) {
  const { theme, toggleTheme, colors, isDark } = useTheme();
  const { workouts, getWorkoutData } = useHealthData();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Workout types mapped from actual data
  const workoutTypes = [
    { id: '1', name: 'Running', icon: 'run' },
    { id: '2', name: 'Cycling', icon: 'bike' },
    { id: '3', name: 'Swimming', icon: 'swim' },
    { id: '4', name: 'Weight Training', icon: 'weight-lifter' },
    { id: '5', name: 'Yoga', icon: 'meditation' },
    { id: '6', name: 'Walking', icon: 'walk' },
    { id: '7', name: 'Hiking', icon: 'hiking' },
    { id: '8', name: 'Other', icon: 'dots-horizontal' },
  ];

  useEffect(() => {
    // Initial loading of workout data
    loadWorkoutData();
  }, []);

  const loadWorkoutData = async () => {
    setIsLoading(true);
    try {
      await getWorkoutData();
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading workout data:", error);
      setIsLoading(false);
      Alert.alert("Error", "Failed to load workout data. Please try again.");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await getWorkoutData();
      setRefreshing(false);
    } catch (error) {
      console.error("Error refreshing workout data:", error);
      setRefreshing(false);
      Alert.alert("Error", "Failed to refresh workout data. Please try again.");
    }
  };

  const addWorkout = () => {
    navigation.navigate('AddWorkout');
  };

  const viewWorkoutDetails = (workout: WorkoutData) => {
    navigation.navigate('WorkoutDetails', { workout });
  };

  // Sort workouts by date (most recent first)
  const sortedWorkouts = [...workouts].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const filteredWorkouts = selectedType 
    ? sortedWorkouts.filter(workout => workout.type === selectedType)
    : sortedWorkouts;

  // Get a list of unique workout types from actual data
  const availableTypes = Array.from(new Set(workouts.map(workout => workout.type)));

  // Calculate weekly summary stats
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
  startOfWeek.setHours(0, 0, 0, 0);
  
  const weeklyWorkouts = sortedWorkouts.filter(workout => {
    const workoutDate = new Date(workout.date);
    return workoutDate >= startOfWeek;
  });
  
  const totalWorkouts = weeklyWorkouts.length;
  const totalDuration = weeklyWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
  const totalCalories = weeklyWorkouts.reduce((sum, workout) => sum + workout.calories, 0);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.statusBar} />
        <LinearGradient
          colors={colors.backgroundGradient}
          style={styles.background}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading workout data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.background}
      />
      
      <View style={styles.headerContainer}>
        <View style={styles.workoutHeader}>
          <Text style={[styles.workoutScreenTitle, { color: colors.text }]}>
            Workout Tracking
          </Text>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.addWorkoutButton, { backgroundColor: colors.primary }]}
              onPress={addWorkout}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <View style={styles.workoutTypesContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.workoutTypesScrollView}
        >
          <TouchableOpacity 
            key="all" 
            style={[
              styles.workoutTypeItem, 
              { 
                backgroundColor: selectedType === null 
                  ? colors.primary 
                  : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
              }
            ]}
            onPress={() => setSelectedType(null)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.workoutTypeIconContainer,
              { 
                backgroundColor: selectedType === null
                  ? '#fff'
                  : colors.primary
              }
            ]}>
              <MaterialCommunityIcons 
                name="format-list-bulleted" 
                size={24} 
                color={selectedType === null ? colors.primary : '#fff'} 
              />
            </View>
            <Text style={[
              styles.workoutTypeName, 
              { 
                color: selectedType === null 
                  ? '#fff' 
                  : colors.text
              }
            ]}>
              All
            </Text>
          </TouchableOpacity>
          {workoutTypes.map((type) => (
            <TouchableOpacity 
              key={type.id} 
              style={[
                styles.workoutTypeItem, 
                { 
                  backgroundColor: selectedType === type.name 
                    ? colors.primary 
                    : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
                }
              ]}
              onPress={() => setSelectedType(selectedType === type.name ? null : type.name)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.workoutTypeIconContainer,
                { 
                  backgroundColor: selectedType === type.name
                    ? '#fff'
                    : colors.primary
                }
              ]}>
                <MaterialCommunityIcons 
                  name={type.icon as any} 
                  size={24} 
                  color={selectedType === type.name ? colors.primary : '#fff'} 
                />
              </View>
              <Text style={[
                styles.workoutTypeName, 
                { 
                  color: selectedType === type.name 
                    ? '#fff' 
                    : colors.text
                }
              ]}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.workoutListHeader}>
        <Text style={[styles.workoutListTitle, { color: colors.text }]}>
          {selectedType ? `${selectedType} Workouts` : 'Recent Workouts'}
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory')} activeOpacity={0.7}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {filteredWorkouts.length > 0 ? (
          <>
            {filteredWorkouts.map((workout) => (
              <WorkoutLogItem 
                key={workout.id} 
                workout={workout} 
                onPress={() => viewWorkoutDetails(workout)}
                colors={colors}
              />
            ))}
            
            <View style={[
              styles.workoutSummaryContainer, 
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border
              }
            ]}>
              <Text style={[styles.workoutSummaryTitle, { color: colors.text }]}>
                Weekly Summary
              </Text>
              <View style={styles.workoutSummaryStats}>
                <View style={styles.workoutSummaryStat}>
                  <MaterialCommunityIcons name="calendar-check" size={24} color={colors.primary} />
                  <Text style={[styles.workoutSummaryValue, { color: colors.text }]}>{totalWorkouts}</Text>
                  <Text style={[styles.workoutSummaryLabel, { color: colors.textSecondary }]}>Workouts</Text>
                </View>
                <View style={styles.workoutSummaryStat}>
                  <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
                  <Text style={[styles.workoutSummaryValue, { color: colors.text }]}>{totalDuration}</Text>
                  <Text style={[styles.workoutSummaryLabel, { color: colors.textSecondary }]}>Minutes</Text>
                </View>
                <View style={styles.workoutSummaryStat}>
                  <MaterialCommunityIcons name="fire" size={24} color={colors.primary} />
                  <Text style={[styles.workoutSummaryValue, { color: colors.text }]}>{totalCalories}</Text>
                  <Text style={[styles.workoutSummaryLabel, { color: colors.textSecondary }]}>Calories</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons 
              name="weight-lifter" 
              size={48} 
              color={colors.textSecondary} 
            />
            <Text style={[styles.emptyStateText, { color: colors.text }]}>
              No workouts found
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: colors.textSecondary }]}>
              {selectedType ? `You haven't logged any ${selectedType} workouts yet` : 'Add your first workout to get started'}
            </Text>
            <TouchableOpacity 
              style={[styles.addFirstWorkoutButton, { backgroundColor: colors.primary }]}
              onPress={addWorkout}
              activeOpacity={0.8}
            >
              <Text style={styles.addFirstWorkoutButtonText}>Add Workout</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutScreenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addWorkoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  workoutTypesContainer: {
    marginBottom: 16,
  },
  workoutTypesScrollView: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  workoutTypeItem: {
    marginRight: 12,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.00,
    elevation: 1,
  },
  workoutTypeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  workoutTypeName: {
    fontWeight: '600',
  },
  workoutListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  workoutListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontWeight: '600',
  },
  scrollViewContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  workoutItem: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  workoutGradient: {
    padding: 16,
    borderRadius: 16,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  workoutDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  workoutStatText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptyStateSubtext: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  addFirstWorkoutButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addFirstWorkoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  workoutSummaryContainer: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  workoutSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  workoutSummaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  workoutSummaryStat: {
    alignItems: 'center',
  },
  workoutSummaryLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  workoutSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
});