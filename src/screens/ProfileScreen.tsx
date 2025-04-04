import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  StatusBar, 
  SafeAreaView, 
  Dimensions, 
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useHealthData } from '../hooks/useHealthData';
import { useWaterTracking } from '../hooks/useWaterTracking';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Add a type for the root stack param list
type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  WaterReminder: undefined;
  Camera: undefined;
  // Add other screens as needed
};

// Define the type for the navigation prop
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: [string, string, ...string[]];
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
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
          {icon && (
            <MaterialCommunityIcons name={icon} size={24} color="#fff" style={styles.cardIcon} />
          )}
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
        {children}
      </View>
    </LinearGradient>
  </TouchableOpacity>
);

function ProfileSettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [healthSync, setHealthSync] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingHealthData, setIsEditingHealthData] = useState(false);
  const [newName, setNewName] = useState('');
  const [newHeight, setNewHeight] = useState('');
  const [newWeight, setNewWeight] = useState('');
  const { theme, toggleTheme, colors, isDark } = useTheme();
  const { height, weight, getHealthData, setHeight, setWeight } = useHealthData();
  const { settings: waterSettings, saveSettings: saveWaterSettings, consumedWater, refreshWaterData } = useWaterTracking();
  const navigation = useNavigation<NavigationProp>();
  
  // User data state
  const [user, setUser] = useState({
    name: 'Mithi Girish',
    profileImage: 'https://via.placeholder.com/100',
  });

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch health data when component mounts
  useEffect(() => {
    if (!isLoading) {
      getHealthData();
    }
  }, [isLoading]);

  // Refresh water data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (!isLoading) {
        // Refresh water data and health data
        refreshWaterData();
        getHealthData();
      }
    });

    return unsubscribe;
  }, [navigation, isLoading, refreshWaterData, getHealthData]);

  const toggleSwitch = (setting: string, value: boolean) => {
    switch(setting) {
      case 'notifications':
        setNotifications(value);
        break;
      case 'darkMode':
        toggleTheme();
        break;
      case 'healthSync':
        setHealthSync(value);
        if (value) {
          // Trigger health data refresh when toggling on
          syncHealthData();
        }
        break;
      case 'waterReminders':
        const updatedWaterSettings = {
          ...waterSettings,
          isEnabled: value,
        };
        saveWaterSettings(updatedWaterSettings);
        break;
    }
  };

  const syncHealthData = async () => {
    try {
      setIsLoading(true);
      await getHealthData();
      setIsLoading(false);
      Alert.alert('Success', 'Health data synchronized successfully!');
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'Failed to synchronize health data. Please try again.');
      console.error('Error syncing health data:', error);
    }
  };

  const handleEditProfile = () => {
    setNewName(user.name); // Initialize with current name
    setIsEditing(true);
  };

  const handleSaveName = () => {
    if (newName.trim() === '') {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    setUser({...user, name: newName});
    setIsEditing(false);
    Alert.alert('Success', 'Name updated successfully');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleEditHealthData = () => {
    setNewHeight(height ? (height * 100).toFixed(1) : '');
    setNewWeight(weight ? weight.toFixed(1) : '');
    setIsEditingHealthData(true);
  };

  const handleSaveHealthData = () => {
    const parsedHeight = parseFloat(newHeight);
    const parsedWeight = parseFloat(newWeight);
    
    if (isNaN(parsedHeight) || isNaN(parsedWeight)) {
      Alert.alert('Error', 'Please enter valid numbers for height and weight');
      return;
    }
    
    // Convert cm to meters
    const heightInMeters = parsedHeight / 100;
    
    // Directly update our state
    setHeight(heightInMeters);
    setWeight(parsedWeight);
    
    Alert.alert('Success', 'Health data updated successfully. Note that this data is only saved locally.');
    setIsEditingHealthData(false);
  };

  const handleCancelHealthDataEdit = () => {
    setIsEditingHealthData(false);
  };

  // Add a function to navigate to water reminders screen
  const navigateToWaterReminders = () => {
    navigation.navigate('WaterReminder');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={colors.backgroundGradient}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading your health profile...</Text>
      </SafeAreaView>
    );
  }

  // Format height and weight values for display
  const formattedHeight = height ? `${(height * 100).toFixed(1)} cm` : 'Not available';
  const formattedWeight = weight ? `${weight.toFixed(1)} kg` : 'Not available';
  
  // Debug info
  const debugHeight = `Raw value: ${height}`;
  const debugWeight = `Raw value: ${weight}`;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.background}
      />
      
      {/* Edit Name Modal */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Your Name</Text>
            <TextInput
              style={[styles.nameInput, { 
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background
              }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.textSecondary }]}
                onPress={handleCancelEdit}
              >
                <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveName}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit Health Data Modal */}
      <Modal
        visible={isEditingHealthData}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancelHealthDataEdit}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Health Data</Text>
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Height (cm)</Text>
            <TextInput
              style={[styles.nameInput, { 
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background
              }]}
              value={newHeight}
              onChangeText={setNewHeight}
              placeholder="Enter your height in cm"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
              autoFocus
            />
            
            <Text style={[styles.inputLabel, { color: colors.text }]}>Weight (kg)</Text>
            <TextInput
              style={[styles.nameInput, { 
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background
              }]}
              value={newWeight}
              onChangeText={setNewWeight}
              placeholder="Enter your weight in kg"
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: colors.textSecondary }]}
                onPress={handleCancelHealthDataEdit}
              >
                <Text style={[styles.buttonText, { color: colors.buttonSecondaryText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveHealthData}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.profileImagePlaceholder}
            >
              <Text style={styles.profileImageInitials}>
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </LinearGradient>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
        </View>
        
        {/* Health Metrics Section */}
        <View style={[styles.settingsSection, { 
          backgroundColor: colors.background,
          borderColor: colors.border 
        }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Health Metrics</Text>
            <TouchableOpacity onPress={handleEditHealthData}>
              <MaterialCommunityIcons name="pencil" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.healthMetricsContainer}>
            <View style={[styles.healthMetricItem, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="human-male-height" size={24} color={colors.text} />
              <View style={styles.healthMetricContent}>
                <Text style={[styles.healthMetricLabel, { color: colors.text }]}>Height</Text>
                <Text style={[styles.healthMetricValue, { color: colors.text }]}>{formattedHeight}</Text>
                <Text style={[styles.healthMetricDebug, { color: colors.textSecondary }]}>{debugHeight}</Text>
              </View>
            </View>
            
            <View style={[styles.healthMetricItem, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="weight" size={24} color={colors.text} />
              <View style={styles.healthMetricContent}>
                <Text style={[styles.healthMetricLabel, { color: colors.text }]}>Weight</Text>
                <Text style={[styles.healthMetricValue, { color: colors.text }]}>{formattedWeight}</Text>
                <Text style={[styles.healthMetricDebug, { color: colors.textSecondary }]}>{debugWeight}</Text>
              </View>
            </View>
            
            <View style={[styles.healthMetricItem, { borderColor: colors.border }]}>
              <MaterialCommunityIcons name="cup-water" size={24} color={colors.primary} />
              <View style={styles.healthMetricContent}>
                <Text style={[styles.healthMetricLabel, { color: colors.text }]}>Water Intake</Text>
                <Text style={[styles.healthMetricValue, { color: colors.text }]}>
                  {waterSettings.isEnabled ? 
                    `${consumedWater.toFixed(0)} / ${waterSettings.dailyTarget} ml` :
                    'Reminders disabled'
                  }
                </Text>
                <View style={styles.waterProgressBar}>
                  <View 
                    style={[
                      styles.waterProgressFill, 
                      { 
                        width: `${Math.min((consumedWater / waterSettings.dailyTarget) * 100, 100)}%`,
                        backgroundColor: colors.primary
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
       
        {/* Settings Section */}
        <View style={[styles.settingsSection, { 
          backgroundColor: colors.background,
          borderColor: colors.border 
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingItemLeft}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notifications}
              onValueChange={(value) => toggleSwitch('notifications', value)}
              trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
              thumbColor={colors.switchThumb}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingItemLeft}>
              <MaterialCommunityIcons name={isDark ? "weather-night" : "white-balance-sunny"} size={24} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => toggleSwitch('darkMode', !isDark)}
              trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
              thumbColor={colors.switchThumb}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingItemLeft}>
              <MaterialCommunityIcons name="sync" size={24} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Health Sync</Text>
            </View>
            <Switch
              value={healthSync}
              onValueChange={(value) => toggleSwitch('healthSync', value)}
              trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
              thumbColor={colors.switchThumb}
            />
          </View>
          
          <View style={[styles.settingItem, { borderBottomColor: colors.border }]}>
            <View style={styles.settingItemLeft}>
              <MaterialCommunityIcons name="cup-water" size={24} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Water Reminders</Text>
            </View>
            <Switch
              value={waterSettings.isEnabled}
              onValueChange={(value) => toggleSwitch('waterReminders', value)}
              trackColor={{ false: colors.switchTrackOff, true: colors.primary }}
              thumbColor={colors.switchThumb}
            />
          </View>
        </View>
        
        {/* Profile Actions Section */}
        <View style={[styles.settingsSection, { 
          backgroundColor: colors.background,
          borderColor: colors.border 
        }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile</Text>
          
          <TouchableOpacity 
            style={[styles.settingButton, { borderColor: colors.border }]}
            onPress={handleEditProfile}
          >
            <View style={styles.settingItemLeft}>
              <MaterialCommunityIcons name="account-edit-outline" size={24} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Edit Profile</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingButton, { borderColor: colors.border }]}
            onPress={navigateToWaterReminders}
          >
            <View style={styles.settingItemLeft}>
              <MaterialCommunityIcons name="cup-water" size={24} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Water Reminder Settings</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingButton, { borderColor: colors.border }]}
            onPress={() => navigation.navigate('Camera')}
          >
            <View style={styles.settingItemLeft}>
              <MaterialCommunityIcons name="camera" size={24} color={colors.text} />
              <Text style={[styles.settingItemText, { color: colors.text }]}>Open Camera</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>FitFusion v1.0.0</Text>
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
    marginTop: 10,
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  profileImageContainer: {
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImageInitials: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 4,
  },
  profileJoinDate: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  overviewSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  healthMetricsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  healthMetricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  healthMetricContent: {
    marginLeft: 12,
  },
  healthMetricLabel: {
    fontSize: 14,
  },
  healthMetricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  healthMetricDebug: {
    fontSize: 12,
    marginTop: 2,
  },
  healthMetricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  healthMetricIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileStatsContainer: {
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  profileStatLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  cardWrapper: {
    width: cardWidth,
    marginBottom: 16,
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  card: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardIcon: {
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 4,
  },
  settingsSection: {
    marginTop: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    marginLeft: 12,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  versionText: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  nameInput: {
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  waterProgressBar: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
    marginTop: 4,
  },
  waterProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
});

export default ProfileSettingsScreen;