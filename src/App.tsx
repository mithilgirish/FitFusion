// App.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  SafeAreaView, 
  Dimensions, 
  TouchableOpacity 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useHealthData } from './hooks/useHealthData';
import ChatBotScreen from './screens/ChatBotScreen';

interface CardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: readonly [string, string];
  icon?: string;
  children?: React.ReactNode;
  onPress?: () => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

const Card = ({ title, value, subtitle, color, icon, children, onPress }: CardProps) => (
  <TouchableOpacity style={styles.cardWrapper} onPress={onPress} disabled={!onPress}>
    <LinearGradient
      colors={color}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {icon && <Text style={styles.cardIcon}>{icon}</Text>}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        {children}
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

const SleepStageBar = ({ stage, duration, totalDuration, color }: { stage: string; duration: number; totalDuration: number; color: string }) => (
  <View style={styles.sleepStageContainer}>
    <View style={styles.sleepStageLabel}>
      <Text style={styles.sleepStageText}>{stage}</Text>
      <Text style={styles.sleepStageDuration}>{duration.toFixed(1)}h</Text>
    </View>
    <View style={styles.sleepStageBarContainer}>
      <View 
        style={[
          styles.sleepStageBar, 
          { width: `${(duration / totalDuration) * 100}%`, backgroundColor: color }
        ]} 
      />
    </View>
  </View>
);

function DashboardScreen({ navigation }: any) {
  const [date] = useState(new Date());
  const { steps, distance, floors, sleepHours, sleepStages, isLoading, refreshData } = useHealthData();
  
  const totalSleepStages = sleepStages ? 
    sleepStages.awake + sleepStages.light + sleepStages.deep + sleepStages.REM : 0;

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    });
  };

  const goToAIConsultation = (topic: string) => {
    navigation.navigate('AI Consultation', { initialTopic: topic });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#000428', '#004e92']}
        style={styles.background}
      />
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>FitFusion</Text>
          <Text style={styles.dateText}>{formatDate(date)}</Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading health data...</Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            <Card 
              title="STEPS" 
              value={steps.toLocaleString()}
              subtitle="GOAL: 10,000"
              color={['#FF5F6D', '#FFC371']}
              icon="👣"
              onPress={() => goToAIConsultation("steps")}
            />
            <Card 
              title="DISTANCE" 
              value={`${(distance / 1000).toFixed(2)} km`}
              subtitle="KEEP MOVING"
              color={['#4776E6', '#8E54E9']}
              icon="🌐"
              onPress={() => goToAIConsultation("walking distance")}
            />
            <Card 
              title="FLOORS" 
              value={floors.toString()}
              subtitle="ELEVATION GAINED"
              color={['#00F260', '#0575E6']}
              icon="🏢"
              onPress={() => goToAIConsultation("stair climbing")}
            />
            <Card 
              title="SLEEP" 
              value={`${sleepHours.toFixed(1)} hrs`}
              subtitle="SLEEP ANALYSIS"
              color={['#834d9b', '#d04ed6']}
              icon="💤"
              onPress={() => goToAIConsultation("sleep")}
            >
              {sleepStages && (
                <View style={styles.sleepStagesContainer}>
                  <SleepStageBar stage="REM" duration={sleepStages.REM} totalDuration={totalSleepStages} color="#FF5E62" />
                  <SleepStageBar stage="DEEP" duration={sleepStages.deep} totalDuration={totalSleepStages} color="#2196F3" />
                  <SleepStageBar stage="LIGHT" duration={sleepStages.light} totalDuration={totalSleepStages} color="#00BCD4" />
                  <SleepStageBar stage="AWAKE" duration={sleepStages.awake} totalDuration={totalSleepStages} color="#A4B0BD" />
                </View>
              )}
            </Card>
          </View>
        )}

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshData}
          >
            <MaterialCommunityIcons name="refresh" size={18} color="#fff" />
            <Text style={styles.refreshButtonText}>Refresh Data</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.insightsContainer}>
          <Text style={styles.insightsTitle}>Health Insights</Text>
          <Text style={styles.insightsText}>
            {steps > 8000 
              ? "Great job on your steps today! You're close to your goal." 
              : "Try to increase your daily steps to reach your 10,000 step goal."}
          </Text>
          <Text style={styles.insightsText}>
            {sleepHours >= 7 
              ? "Your sleep duration is healthy. Good quality sleep improves overall health." 
              : "You might need more sleep. Aim for 7-9 hours for optimal health."}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.consultAiButton}
          onPress={() => navigation.navigate('AI Consultation')}
        >
          <MaterialCommunityIcons name="robot" size={20} color="#fff" />
          <Text style={styles.consultAiText}>Consult AI Health Assistant</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// Enhanced version of ChatBotScreen that integrates with Health Connect data
function EnhancedChatBotScreen({ route, navigation }: any) {
  const { steps, distance, floors, sleepHours, sleepStages } = useHealthData();
  
  // Prepare health data context for the AI assistant
  const healthContext = {
    steps,
    distance: (distance / 1000).toFixed(2),
    floors,
    sleepHours: sleepHours.toFixed(1),
    sleepStages
  };

  return (
    <ChatBotScreen 
      initialTopic={route.params?.initialTopic}
      healthData={healthContext}
    />
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: string;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'AI Consultation') {
              iconName = focused ? 'robot' : 'robot-outline';
            } else {
              iconName = 'help-circle';
            }

            return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: {
            backgroundColor: '#f8f9fa',
            borderTopColor: '#e0e0e0',
          },
          headerShown: false,
        })}
      >
        <Tab.Screen name="Home" component={DashboardScreen} />
        <Tab.Screen name="AI Consultation" component={EnhancedChatBotScreen} />
      </Tab.Navigator>
    </NavigationContainer>
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
    marginTop: 40,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  cardsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: cardWidth,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: 20,
  },
  card: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    letterSpacing: 0.5,
  },
  sleepStagesContainer: {
    marginTop: 12,
  },
  sleepStageContainer: {
    marginBottom: 8,
  },
  sleepStageLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sleepStageText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  sleepStageDuration: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  sleepStageBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  sleepStageBar: {
    height: '100%',
    borderRadius: 3,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 6,
  },
  insightsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  insightsTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  insightsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  consultAiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#6200ee',
    paddingVertical: 12,
    borderRadius: 30,
  },
  consultAiText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});