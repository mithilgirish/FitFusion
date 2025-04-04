import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // or any other icon library
import { ThemeProvider } from './context/ThemeContext';
import ChatBotScreen from './screens/ChatBotScreen';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import WorkoutScreen from './screens/WorkoutScreen';
import WaterReminderScreen from './screens/WaterReminderScreen';
import { useTheme } from './context/ThemeContext'; // Assuming you have this hook

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { colors } = useTheme(); // Get theme colors

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          else if (route.name === 'Workout') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Water') {
            iconName = focused ? 'water' : 'water-outline';
          } else {
            iconName = 'help-circle';
          }
          


          return <Ionicons name={iconName!} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Health Dashboard' }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen} 
        options={{ title: 'Workout Log' }}
      />
      <Tab.Screen 
        name="Water" 
        component={WaterReminderScreen} 
        options={{ title: 'Water Reminder' }}
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatBotScreen} 
        options={{ title: 'Health Assistant' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'My Profile' }}
      />
      
      {/* Add more screens as needed */}
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </ThemeProvider>
  );
}