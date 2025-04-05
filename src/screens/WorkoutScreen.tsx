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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHealthData, WorkoutData } from '../hooks/useHealthData';
import Background from '../components/Background';
import Header from '../components/Header';
import Card from '../components/Card';
import Button from '../components/Button';

interface WorkoutLogItemProps {
  workout: WorkoutData;
  onPress: () => void;
}

const WorkoutLogItem: React.FC<WorkoutLogItemProps> = ({ workout, onPress }) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.workoutAnimatedContainer}>
      <Card
        title={workout.name}
        subtitle={workout.date}
        gradient={colors.cardGradients.workout}
        onPress={onPress}
        animated={false}
      >
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
      </Card>
    </View>
  );
};

const WorkoutTypeButton: React.FC<{
  type: { id: string; name: string; icon: string };
  isSelected: boolean;
  onPress: () => void;
}> = ({ type, isSelected, onPress }) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View>
      <TouchableOpacity 
        key={type.id} 
        style={[
          styles.workoutTypeItem, 
          { 
            backgroundColor: isSelected 
              ? colors.primary 
              : isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
          }
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons 
          name={type.icon as keyof typeof MaterialCommunityIcons.glyphMap} 
          size={24} 
          color={isSelected ? '#fff' : colors.text} 
        />
        <Text style={[
          styles.workoutTypeText, 
          { color: isSelected ? '#fff' : colors.text }
        ]}>
          {type.name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default function WorkoutScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const { workouts, getWorkoutData } = useHealthData();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Workout types mapped from actual data
  const workoutTypes = [
    { id: '0', name: 'All', icon: 'view-dashboard' },
    { id: '1', name: 'Running', icon: 'run' },
    { id: '2', name: 'Cycling', icon: 'bike' },
    { id: '3', name: 'Swimming', icon: 'swim' },
    { id: '4', name: 'Weight Training', icon: 'weight-lifter' },
    { id: '5', name: 'Yoga', icon: 'meditation' },
    { id: '6', name: 'Walking', icon: 'walk' },
    { id: '7', name: 'Hiking', icon: 'hiking' },
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
    navigation.navigate('WorkoutTracker');
  };

  const viewWorkoutDetails = (workout: WorkoutData) => {
    // Navigate to workout details
    console.log('View workout details:', workout);
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
      <Background pattern animated={false}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading workout data...
            </Text>
          </View>
        </SafeAreaView>
      </Background>
    );
  }

  return (
    <Background pattern animated={false}>
      <SafeAreaView style={styles.safeArea}>
        <Header 
          title="Workout Tracking" 
          rightIcon="add-circle-outline"
          onRightPress={addWorkout}
          animated={false}
        />
        
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {/* Weekly Summary Card */}
          <View>
            <Card
              title="WEEKLY SUMMARY"
              gradient={colors.cardGradients.default}
              animated={false}
            >
              <View style={styles.weeklySummary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalWorkouts}</Text>
                  <Text style={styles.summaryLabel}>Workouts</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalDuration}</Text>
                  <Text style={styles.summaryLabel}>Minutes</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{totalCalories}</Text>
                  <Text style={styles.summaryLabel}>Calories</Text>
                </View>
              </View>
            </Card>
          </View>
          
          {/* Workout Type Filters */}
          <View style={styles.workoutTypesContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.workoutTypesScrollView}
            >
              {workoutTypes.map((type) => (
                <WorkoutTypeButton 
                  key={type.id}
                  type={type}
                  isSelected={selectedType === (type.id === '0' ? null : type.name)}
                  onPress={() => setSelectedType(type.id === '0' ? null : type.name)}
                />
              ))}
            </ScrollView>
          </View>
          
          {/* Workout List */}
          <View style={styles.workoutList}>
            {filteredWorkouts.length > 0 ? (
              filteredWorkouts.map((workout, index) => (
                <WorkoutLogItem 
                  key={`${workout.id}-${index}`}
                  workout={workout}
                  onPress={() => viewWorkoutDetails(workout)}
                />
              ))
            ) : (
              <Card
                title="No workouts found"
                subtitle="Try adding a new workout or changing your filter"
                gradient={colors.cardGradients.default}
                animated={false}
              />
            )}
          </View>
          
          <View style={styles.addWorkoutContainer}>
            <Button
              title="Add New Workout"
              onPress={addWorkout}
              variant="gradient"
              gradient={colors.cardGradients.workout}
              icon={<MaterialCommunityIcons name="plus" size={20} color="#fff" />}
              animated={false}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Background>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  workoutHeader: {
    flexDirection: 'row',
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutTypesContainer: {
    marginVertical: 16,
  },
  workoutTypesScrollView: {
    paddingHorizontal: 8,
  },
  workoutTypeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  workoutTypeText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  workoutList: {
    marginTop: 8,
  },
  workoutAnimatedContainer: {
    marginBottom: 8,
  },
  workoutDetails: {
    flexDirection: 'row',
    marginTop: 8,
  },
  workoutStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  workoutStatText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
  },
  weeklySummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  addWorkoutContainer: {
    marginVertical: 24,
  },
});