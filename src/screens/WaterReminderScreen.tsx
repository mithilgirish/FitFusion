import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWaterTracking } from '../hooks/useWaterTracking';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function WaterReminderScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  
  const { 
    consumedWater, 
    settings, 
    isLoading, 
    isHealthConnectAvailable, 
    addWaterIntake, 
    resetWaterIntake, 
    saveSettings,
    refreshWaterData
  } = useWaterTracking();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState<'startTime' | 'endTime'>('startTime');
  const [tempTime, setTempTime] = useState(new Date());
  const [showIntervalPicker, setShowIntervalPicker] = useState(false);

  // Water glass increments (in ml)
  const waterIncrements = [150, 250, 350, 500];

  // Interval options in minutes
  const intervalOptions = [
    { label: '30 minutes', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
  ];

  // Register for notifications (Android requires explicit permission)
  useEffect(() => {
    if (Platform.OS === 'android') {
      registerForPushNotificationsAsync();
    }
    
    // Re-schedule notifications if enabled
    if (settings.isEnabled) {
      scheduleNotifications();
    }
  }, [settings]);

  // Refresh water data when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshWaterData();
    });

    return unsubscribe;
  }, [navigation]);

  const registerForPushNotificationsAsync = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Push notifications need to be enabled for water reminders to work.',
        [{ text: 'OK' }]
      );
      return;
    }
  };

  // Schedule notifications
  const scheduleNotifications = async () => {
    if (!settings.isEnabled) return;
    
    // Cancel any existing notifications first
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    const startTime = new Date(settings.startTime);
    const endTime = new Date(settings.endTime);
    const intervalMs = settings.interval * 60 * 1000; // convert minutes to ms
    
    // Calculate how many notifications to schedule
    const startMs = startTime.getTime();
    const endMs = endTime.getTime();
    const now = new Date().getTime();
    
    // Schedule notifications for today
    let currentTime = Math.max(now, startMs);
    
    while (currentTime <= endMs) {
      const triggerTime = new Date(currentTime);
      
      // Only schedule if the time is in the future
      if (triggerTime.getTime() > now) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "💧 Hydration Reminder",
              body: "Time to drink some water! Stay hydrated for better health.",
              sound: true,
            },
            trigger: {
              channelId: 'water-reminders',
              seconds: Math.round((triggerTime.getTime() - Date.now()) / 1000),
            } as any,
          });
        } catch (error) {
          console.error("Failed to schedule notification:", error);
        }
      }
      
      // Move to next interval
      currentTime += intervalMs;
    }
    
    // Also schedule tomorrow's notifications if enabled
    if (settings.isEnabled) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      let tomorrowTime = tomorrow.getTime() + startTime.getHours() * 3600000 + startTime.getMinutes() * 60000;
      const tomorrowEnd = tomorrow.getTime() + endTime.getHours() * 3600000 + endTime.getMinutes() * 60000;
      
      while (tomorrowTime <= tomorrowEnd) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: "💧 Hydration Reminder",
              body: "Time to drink some water! Stay hydrated for better health.",
              sound: true,
            },
            trigger: {
              channelId: 'water-reminders',
              seconds: Math.round((new Date(tomorrowTime).getTime() - Date.now()) / 1000),
            } as any,
          });
        } catch (error) {
          console.error("Failed to schedule tomorrow's notification:", error);
        }
        
        tomorrowTime += intervalMs;
      }
    }
  };

  // Toggle reminders
  const toggleReminders = (value: boolean) => {
    const updatedSettings = {
      ...settings,
      isEnabled: value,
    };
    
    saveSettings(updatedSettings);
    
    if (value) {
      scheduleNotifications();
    } else {
      Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  // Time picker handlers
  const openTimePicker = (mode: 'startTime' | 'endTime') => {
    setTimePickerMode(mode);
    setTempTime(new Date(mode === 'startTime' ? settings.startTime : settings.endTime));
    setShowTimePicker(true);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || tempTime;
    setShowTimePicker(Platform.OS === 'ios');
    setTempTime(currentTime);
    
    if (Platform.OS === 'android' && selectedTime) {
      const updatedSettings = {
        ...settings,
        [timePickerMode]: currentTime.toISOString(),
      };
      
      saveSettings(updatedSettings);
    }
  };

  const confirmTimeSelection = () => {
    const updatedSettings = {
      ...settings,
      [timePickerMode]: tempTime.toISOString(),
    };
    
    saveSettings(updatedSettings);
    setShowTimePicker(false);
  };

  // Update interval
  const updateInterval = (newInterval: number) => {
    const updatedSettings = {
      ...settings,
      interval: newInterval,
    };
    
    saveSettings(updatedSettings);
    setShowIntervalPicker(false);
  };

  // Update daily target
  const updateDailyTarget = (target: number) => {
    const updatedSettings = {
      ...settings,
      dailyTarget: target,
    };
    
    saveSettings(updatedSettings);
  };

  // Reset water consumption
  const resetWaterConsumption = () => {
    Alert.alert(
      "Reset Water Consumption",
      "Are you sure you want to reset today's water consumption to zero?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Reset", 
          style: "destructive",
          onPress: () => resetWaterIntake()
        },
      ]
    );
  };

  // Calculate progress percentage
  const progressPercentage = Math.min((consumedWater / settings.dailyTarget) * 100, 100);
  
  // Format time for display (12-hour format with AM/PM)
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.statusBar} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading water data...</Text>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Water Reminder
        </Text>
        {!isHealthConnectAvailable && (
          <View style={styles.healthConnectWarning}>
            <MaterialCommunityIcons name="alert-circle" size={18} color="#ff9800" />
            <Text style={styles.healthConnectWarningText}>
              Using local storage (Health Connect not available)
            </Text>
          </View>
        )}
      </View>
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Water Consumption Tracker */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Water Intake</Text>
          
          <View style={styles.waterProgressContainer}>
            <View style={styles.waterGraphic}>
              <View style={styles.waterContainer}>
                <View 
                  style={[
                    styles.waterFill, 
                    { 
                      height: `${progressPercentage}%`,
                      backgroundColor: colors.primary,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.waterAmount, { color: colors.text }]}>
                {consumedWater} / {settings.dailyTarget} ml
              </Text>
              <Text style={[styles.waterPercentage, { color: colors.textSecondary }]}>
                {Math.round(progressPercentage)}%
              </Text>
            </View>
            
            <View style={styles.waterActionsContainer}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Add Water:</Text>
              <View style={styles.waterButtonsGrid}>
                {waterIncrements.map((amount) => (
                  <TouchableOpacity
                    key={amount}
                    style={[
                      styles.waterButton,
                      { backgroundColor: colors.card, borderColor: colors.primary }
                    ]}
                    onPress={() => addWaterIntake(amount)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons name="cup-water" size={20} color={colors.primary} />
                    <Text style={[styles.waterButtonText, { color: colors.primary }]}>
                      {amount} ml
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: '#ff6b6b' }]}
                onPress={resetWaterConsumption}
              >
                <Text style={{ color: '#ff6b6b' }}>Reset Today's Water</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Reminders Settings */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Reminder Settings</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <MaterialCommunityIcons name="bell" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Enable Reminders</Text>
            </View>
            <Switch
              value={settings.isEnabled}
              onValueChange={toggleReminders}
              trackColor={{ false: '#767577', true: colors.primary }}
              thumbColor="#f4f3f4"
            />
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <MaterialCommunityIcons name="clock-start" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Start Time</Text>
            </View>
            <TouchableOpacity 
              style={[styles.timeSelector, { borderColor: colors.border }]}
              onPress={() => openTimePicker('startTime')}
            >
              <Text style={{ color: colors.text }}>{formatTime(settings.startTime)}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <MaterialCommunityIcons name="clock-end" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>End Time</Text>
            </View>
            <TouchableOpacity 
              style={[styles.timeSelector, { borderColor: colors.border }]}
              onPress={() => openTimePicker('endTime')}
            >
              <Text style={{ color: colors.text }}>{formatTime(settings.endTime)}</Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <MaterialCommunityIcons name="timer" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Reminder Interval</Text>
            </View>
            <TouchableOpacity 
              style={[styles.timeSelector, { borderColor: colors.border }]}
              onPress={() => setShowIntervalPicker(true)}
            >
              <Text style={{ color: colors.text }}>
                {intervalOptions.find(opt => opt.value === settings.interval)?.label || `${settings.interval} min`}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingLabelContainer}>
              <MaterialCommunityIcons name="cup-water" size={20} color={colors.primary} />
              <Text style={[styles.settingLabel, { color: colors.text }]}>Daily Goal</Text>
            </View>
            <Text style={{ color: colors.text }}>{settings.dailyTarget} ml</Text>
          </View>
          
          <View style={styles.goalSliderContainer}>
            <TouchableOpacity 
              style={[
                styles.goalButton,
                settings.dailyTarget === 2000 ? { backgroundColor: colors.primary } : { borderColor: colors.border }
              ]}
              onPress={() => updateDailyTarget(2000)}
            >
              <Text style={{ color: settings.dailyTarget === 2000 ? '#fff' : colors.text }}>2000 ml</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.goalButton,
                settings.dailyTarget === 2500 ? { backgroundColor: colors.primary } : { borderColor: colors.border }
              ]}
              onPress={() => updateDailyTarget(2500)}
            >
              <Text style={{ color: settings.dailyTarget === 2500 ? '#fff' : colors.text }}>2500 ml</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.goalButton,
                settings.dailyTarget === 3000 ? { backgroundColor: colors.primary } : { borderColor: colors.border }
              ]}
              onPress={() => updateDailyTarget(3000)}
            >
              <Text style={{ color: settings.dailyTarget === 3000 ? '#fff' : colors.text }}>3000 ml</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.goalButton,
                settings.dailyTarget === 3500 ? { backgroundColor: colors.primary } : { borderColor: colors.border }
              ]}
              onPress={() => updateDailyTarget(3500)}
            >
              <Text style={{ color: settings.dailyTarget === 3500 ? '#fff' : colors.text }}>3500 ml</Text>
            </TouchableOpacity>
          </View>
          
          {settings.isEnabled && (
            <TouchableOpacity 
              style={[styles.updateButton, { backgroundColor: colors.primary }]}
              onPress={scheduleNotifications}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Update Reminders</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Water Benefits</Text>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="brain" size={20} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Improves brain function and energy levels
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="heart-pulse" size={20} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Helps regulate blood pressure
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="weight-lifter" size={20} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Enhances physical performance
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="stomach" size={20} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Aids digestion and prevents constipation
            </Text>
          </View>
          <View style={styles.benefitRow}>
            <MaterialCommunityIcons name="water" size={20} color={colors.primary} />
            <Text style={[styles.benefitText, { color: colors.text }]}>
              Helps maintain skin hydration and elasticity
            </Text>
          </View>
        </View>
      </ScrollView>
      
      {/* Time Picker Modal for iOS */}
      {Platform.OS === 'ios' && showTimePicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showTimePicker}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </TouchableOpacity>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {timePickerMode === 'startTime' ? 'Select Start Time' : 'Select End Time'}
                </Text>
                <TouchableOpacity onPress={confirmTimeSelection}>
                  <Text style={{ color: colors.primary }}>Done</Text>
                </TouchableOpacity>
              </View>
              
              <DateTimePicker
                value={tempTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                style={{ width: '100%' }}
              />
            </View>
          </View>
        </Modal>
      )}
      
      {/* Android renders the time picker directly */}
      {Platform.OS === 'android' && showTimePicker && (
        <DateTimePicker
          value={tempTime}
          mode="time"
          is24Hour={false}
          display="default"
          onChange={handleTimeChange}
        />
      )}
      
      {/* Interval Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showIntervalPicker}
        onRequestClose={() => setShowIntervalPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowIntervalPicker(false)}>
                <Text style={{ color: colors.text }}>Cancel</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Reminder Interval
              </Text>
              <View style={{ width: 50 }}></View> {/* Spacer for alignment */}
            </View>
            
            <ScrollView>
              {intervalOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.intervalOption,
                    settings.interval === option.value && { backgroundColor: `${colors.primary}20` }
                  ]}
                  onPress={() => updateInterval(option.value)}
                >
                  <Text style={{ 
                    color: settings.interval === option.value ? colors.primary : colors.text,
                    fontWeight: settings.interval === option.value ? 'bold' : 'normal',
                  }}>
                    {option.label}
                  </Text>
                  {settings.interval === option.value && (
                    <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  healthConnectWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  healthConnectWarningText: {
    color: '#ff9800',
    marginLeft: 4,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  waterProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  waterGraphic: {
    alignItems: 'center',
    width: '40%',
  },
  waterContainer: {
    width: 100,
    height: 160,
    borderWidth: 3,
    borderColor: '#3498db',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
    marginBottom: 8,
  },
  waterFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#3498db',
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  waterAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  waterPercentage: {
    fontSize: 14,
  },
  waterActionsContainer: {
    width: '55%',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  waterButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  waterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  waterButtonText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  resetButton: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    marginLeft: 8,
    fontSize: 16,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 120,
    justifyContent: 'space-between',
  },
  goalSliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  goalButton: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 70,
    alignItems: 'center',
  },
  updateButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 10,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  intervalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
}); 