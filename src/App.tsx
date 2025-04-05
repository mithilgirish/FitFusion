import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider } from './context/ThemeContext';
import ChatBotScreen from './screens/ChatBotScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import WaterReminderScreen from './screens/WaterReminderScreen';
import WorkoutTrackerScreen from './screens/WorkoutTrackerScreen';
import { useTheme } from './context/ThemeContext';
import AnimatedIcon from './components/AnimatedIcon';
import { Platform, Animated } from 'react-native';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Create a stack navigator for screens that we don't want in the tab bar
const MainStack = () => {
  const { colors } = useTheme();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen 
        name="TabNavigator" 
        component={TabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="WorkoutTracker" 
        component={WorkoutTrackerScreen}
        options={{ 
          headerShown: false,
          presentation: 'fullScreenModal'
        }}
      />
    </Stack.Navigator>
  );
};

// Custom tab bar icon with animations
const TabBarIcon = ({ name, focused, color }: { name: string; focused: boolean; color: string }) => {
  const iconName = focused ? name : `${name}-outline`;
  
  return (
    <Ionicons name={iconName as keyof typeof Ionicons.glyphMap} size={24} color={color} />
  );
};

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Chat') {
            iconName = 'chatbubbles';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }
          else if (route.name === 'Workout') {
            iconName = 'fitness';
          } else if (route.name === 'Water') {
            iconName = 'water';
          } else if (route.name === 'Tracker') {
            iconName = 'barbell';
          } 
          else {
            iconName = 'help-circle';
          }
          
          return <TabBarIcon name={iconName} focused={focused} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: -2 },
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarItemStyle: {
          padding: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen} 
        options={{ title: 'Workouts' }}
      />
      <Tab.Screen 
        name="Water" 
        component={WaterReminderScreen} 
        options={{ title: 'Water' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatBotScreen} 
        options={{ title: 'Assistant' }}
      />
      <Tab.Screen 
        name="Tracker"
        component={WorkoutTrackerScreen} 
        options={{ title: 'Tracker' }}
      />
         
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </ThemeProvider>
  );
}