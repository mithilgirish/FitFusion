import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  SafeAreaView, 
  TouchableOpacity,
  useColorScheme
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface WorkoutLogItemProps {
  workout: {
    id: string;
    name: string;
    type: string;
    date: string;
    duration: number;
    calories: number;
    distance?: number;
  };
  onPress: () => void;
  colors: any;
}

const WorkoutLogItem: React.FC<WorkoutLogItemProps> = ({ workout, onPress, colors }) => {
  return (
    <TouchableOpacity 
      style={[styles.workoutItem, { backgroundColor: colors.card }]} 
      onPress={onPress}
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
  
  const [workouts, setWorkouts] = useState([
    { 
      id: '1', 
      name: 'Morning Run', 
      type: 'Running',
      date: 'Today, 7:15 AM', 
      duration: 35, 
      calories: 320, 
      distance: 4.2 
    },
    { 
      id: '2', 
      name: 'Upper Body Strength', 
      type: 'Weight Training',
      date: 'Yesterday, 6:30 PM', 
      duration: 45, 
      calories: 280 
    },
    { 
      id: '3', 
      name: 'Evening Yoga', 
      type: 'Yoga',
      date: 'Mar 31, 7:00 PM', 
      duration: 30, 
      calories: 150 
    },
    { 
      id: '4', 
      name: 'HIIT Session', 
      type: 'HIIT',
      date: 'Mar 29, 5:45 PM', 
      duration: 25, 
      calories: 310 
    }
  ]);

  const workoutTypes = [
    { id: '1', name: 'Running', icon: 'run' },
    { id: '2', name: 'Cycling', icon: 'bike' },
    { id: '3', name: 'Swimming', icon: 'swim' },
    { id: '4', name: 'Weight Training', icon: 'weight-lifter' },
    { id: '5', name: 'Yoga', icon: 'meditation' },
    { id: '6', name: 'HIIT', icon: 'lightning-bolt' },
    { id: '7', name: 'Walking', icon: 'walk' },
    { id: '8', name: 'Other', icon: 'dots-horizontal' },
  ];

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const addWorkout = () => {
    navigation.navigate('AddWorkout');
  };

  const viewWorkoutDetails = (workout: any) => {
    navigation.navigate('WorkoutDetails', { workout });
  };

  const filteredWorkouts = selectedType 
    ? workouts.filter(workout => workout.type === selectedType)
    : workouts;

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
        <TouchableOpacity onPress={() => navigation.navigate('WorkoutHistory')}>
          <Text style={[styles.viewAllText, { color: colors.primary }]}>
            View All
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollViewContent}
      >
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <WorkoutLogItem 
              key={workout.id} 
              workout={workout} 
              onPress={() => viewWorkoutDetails(workout)}
              colors={colors}
            />
          ))
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
            >
              <Text style={styles.addFirstWorkoutButtonText}>Add Workout</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {filteredWorkouts.length > 0 && (
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
                <Text style={[styles.workoutSummaryLabel, { color: colors.textSecondary }]}>Total Workouts</Text>
                <Text style={[styles.workoutSummaryValue, { color: colors.text }]}>4</Text>
              </View>
              <View style={styles.workoutSummaryStat}>
                <Text style={[styles.workoutSummaryLabel, { color: colors.textSecondary }]}>Active Minutes</Text>
                <Text style={[styles.workoutSummaryValue, { color: colors.text }]}>135</Text>
              </View>
              <View style={styles.workoutSummaryStat}>
                <Text style={[styles.workoutSummaryLabel, { color: colors.textSecondary }]}>Calories Burned</Text>
                <Text style={[styles.workoutSummaryValue, { color: colors.text }]}>1,060</Text>
              </View>
            </View>
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
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  addWorkoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutTypesContainer: {
    marginBottom: 16,
  },
  workoutTypesScrollView: {
    paddingHorizontal: 16,
  },
  workoutTypeItem: {
    marginRight: 12,
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
  },
  workoutSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
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
    marginBottom: 4,
  },
  workoutSummaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});