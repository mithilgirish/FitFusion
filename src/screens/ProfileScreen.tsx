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
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

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

interface HealthMetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
}

function HealthMetricCard({ title, value, subtitle, icon, color }: HealthMetricCardProps) {
  return (
    <View style={styles.healthMetricCard}>
      <View style={[styles.healthMetricIconContainer, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      </View>
      <View style={styles.healthMetricContent}>
        <Text style={styles.healthMetricTitle}>{title}</Text>
        <Text style={styles.healthMetricValue}>{value}</Text>
        {subtitle && <Text style={styles.healthMetricSubtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
}

function ProfileSettingsScreen() {
    const [notifications, setNotifications] = useState(true);
    const [healthSync, setHealthSync] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const { theme, toggleTheme, colors, isDark, setTheme } = useTheme();
    
    // Mock user data
    const user = {
      name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      joinDate: 'Member since Jan 2025',
      profileImage: 'https://via.placeholder.com/100',
      stats: {
        workoutsCompleted: 127,
        achievementsUnlocked: 24,
        currentStreak: 8
      }
    };

    // Simulate data loading
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      
      return () => clearTimeout(timer);
    }, []);

    const toggleSwitch = (setting: string, value: boolean) => {
      switch(setting) {
        case 'notifications':
          setNotifications(value);
          break;
        case 'darkMode':
          setTheme(value ? 'dark' : 'light');
          break;
        case 'healthSync':
          setHealthSync(value);
          break;
      }
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

    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={colors.statusBar} backgroundColor={colors.background} />
        <LinearGradient
          colors={colors.backgroundGradient}
          style={styles.background}
        />
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.profileHeader}>
            <View style={styles.profileImageContainer}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.profileImagePlaceholder}
              >
                <Text style={styles.profileImageInitials}>AJ</Text>
              </LinearGradient>
            </View>
            <Text style={[styles.profileName, { color: colors.text }]}>{user.name}</Text>
            <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{user.email}</Text>
            <Text style={[styles.profileJoinDate, { color: colors.textSecondary }]}>{user.joinDate}</Text>
          </View>
          
          <View style={[styles.settingsSection, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
            
            <View style={[styles.settingItem, { borderColor: colors.border }]}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} />
                <Text style={[styles.settingItemText, { color: colors.text }]}>Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.primary }}
                thumbColor={notifications ? '#fff' : isDark ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
                onValueChange={(value) => toggleSwitch('notifications', value)}
                value={notifications}
              />
            </View>
            
            <View style={[styles.settingItem, { borderColor: colors.border }]}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="theme-light-dark" size={24} color={colors.text} />
                <Text style={[styles.settingItemText, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.primary }}
                thumbColor={isDark ? '#fff' : '#f4f3f4'}
                ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
                onValueChange={(value) => toggleSwitch('darkMode', value)}
                value={isDark}
              />
            </View>
            
            <View style={[styles.settingItem, { borderColor: colors.border }]}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="sync" size={24} color={colors.text} />
                <Text style={[styles.settingItemText, { color: colors.text }]}>Health Data Sync</Text>
              </View>
              <Switch
                trackColor={{ false: isDark ? '#3e3e3e' : '#d0d0d0', true: colors.primary }}
                thumbColor={healthSync ? '#fff' : isDark ? '#f4f3f4' : '#f4f3f4'}
                ios_backgroundColor={isDark ? '#3e3e3e' : '#d0d0d0'}
                onValueChange={(value) => toggleSwitch('healthSync', value)}
                value={healthSync}
              />
            </View>
          </View>
          
          <View style={[styles.settingsSection, { borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
            
            <TouchableOpacity style={[styles.settingButton, { borderColor: colors.border }]}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="account-edit-outline" size={24} color={colors.text} />
                <Text style={[styles.settingItemText, { color: colors.text }]}>Edit Profile</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingButton, { borderColor: colors.border }]}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="lock-outline" size={24} color={colors.text} />
                <Text style={[styles.settingItemText, { color: colors.text }]}>Change Password</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.settingButton, { borderColor: colors.border }]}>
              <View style={styles.settingItemLeft}>
                <MaterialCommunityIcons name="help-circle-outline" size={24} color={colors.text} />
                <Text style={[styles.settingItemText, { color: colors.text }]}>Help & Support</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.logoutButton}>
              <MaterialCommunityIcons name="logout" size={20} color="#FF5E62" />
              <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>FitFusion v1.0.3</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000428',
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
    color: '#ffffff',
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
    color: '#ffffff',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  profileJoinDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  overviewSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  metricsContainer: {
    paddingHorizontal: 16,
  },
  healthMetricCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
  healthMetricContent: {
    flex: 1,
  },
  healthMetricTitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  healthMetricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  healthMetricSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: 2,
  },
  profileStatsContainer: {
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#ffffff',
    marginTop: 8,
  },
  profileStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
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
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingItemText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 12,
  },
  settingButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF5E62',
  },
  logoutButtonText: {
    color: '#FF5E62',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  }
});

export default ProfileSettingsScreen;