import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealthData } from '.././hooks/useHealthData';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: readonly [string, string];
  icon?: string;
  children?: React.ReactNode;
  fullWidth?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

const Card = ({ title, value, subtitle, color, icon, children, fullWidth }: CardProps) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={[
      styles.cardWrapper, 
      fullWidth && styles.fullWidthCard
    ]}>
      <LinearGradient
        colors={color}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={[styles.card, { 
          backgroundColor: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.15)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)'
        }]}>
          <View style={styles.cardHeader}>
            {icon && <Text style={styles.cardIcon}>{icon}</Text>}
            <Text style={[styles.cardTitle, { color: '#ffffff' }]}>{title}</Text>
          </View>
          <Text style={[styles.cardValue, { 
            color: '#ffffff',
            textShadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'
          }]}>{value}</Text>
          {subtitle && <Text style={[styles.cardSubtitle, { color: 'rgba(255, 255, 255, 0.6)' }]}>{subtitle}</Text>}
          {children}
        </View>
      </LinearGradient>
    </View>
  );
};

const SleepStageBar = ({ stage, duration, totalDuration, color, icon }: { stage: string; duration: number; totalDuration: number; color: string; icon: string }) => {
  const { colors, isDark } = useTheme();
  
  const percentage = (duration / totalDuration) * 100;
  
  return (
    <View style={styles.sleepStageContainer}>
      <View style={styles.sleepStageLabel}>
        <View style={styles.sleepStageLabelLeft}>
          <Text style={styles.sleepStageIcon}>{icon}</Text>
          <Text style={[styles.sleepStageText, { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }]}>{stage}</Text>
        </View>
        <View style={styles.sleepStageLabelRight}>
          <Text style={[styles.sleepStageDuration, { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }]}>{duration.toFixed(1)}h</Text>
          <Text style={[styles.sleepStagePercentage, { color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)' }]}>({percentage.toFixed(0)}%)</Text>
        </View>
      </View>
      <View style={[styles.sleepStageBarContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
        <View 
          style={[
            styles.sleepStageBar, 
            { width: `${percentage}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
};

const SleepQualityIndicator = ({ quality }: { quality: string }) => {
  const qualityMap = {
    'poor': { color: '#FF5E62', icon: '😴', text: 'Poor' },
    'fair': { color: '#FFC371', icon: '😐', text: 'Fair' },
    'good': { color: '#81C784', icon: '😊', text: 'Good' },
    'excellent': { color: '#64B5F6', icon: '🤩', text: 'Excellent' }
  } as const;
  
  const qualityInfo = qualityMap[quality.toLowerCase() as keyof typeof qualityMap] || qualityMap.fair;
  
  return (
    <View style={[styles.sleepQualityContainer, { backgroundColor: `${qualityInfo.color}30` }]}>
      <Text style={styles.sleepQualityIcon}>{qualityInfo.icon}</Text>
      <View style={styles.sleepQualityTextContainer}>
        <Text style={[styles.sleepQualityText, { color: qualityInfo.color }]}>
          {qualityInfo.text} Sleep Quality
        </Text>
        <Text style={styles.sleepQualitySubtext}>
          {quality === 'excellent' ? 'Optimal recovery achieved' : 
           quality === 'good' ? 'Good recovery with balanced cycles' :
           quality === 'poor' ? 'Limited deep sleep detected' :
           'Average sleep patterns observed'}
        </Text>
      </View>
    </View>
  );
};

function AppContent() {
  const [date] = useState(new Date());
  const { steps, distance, floors, sleepHours, sleepStages, workouts } = useHealthData();
  const { theme, toggleTheme, colors, isDark } = useTheme();
  
  // Calculate estimated calories burned based on steps (average 0.04 calories per step)
  const caloriesBurned = Math.round(steps * 0.04);
  
  // Sleep quality is determined based on the ratio of deep + REM sleep to total sleep time
  const totalSleepTime = sleepStages ? 
    sleepStages.light + sleepStages.deep + sleepStages.REM : 0;
    
  const qualitySleep = sleepStages ? sleepStages.deep + sleepStages.REM : 0;
  const sleepQualityRatio = totalSleepTime > 0 ? qualitySleep / totalSleepTime : 0;
  
  // Determine sleep quality
  let sleepQuality = 'fair';
  if (sleepQualityRatio >= 0.45) sleepQuality = 'excellent';
  else if (sleepQualityRatio >= 0.35) sleepQuality = 'good';
  else if (sleepQualityRatio <= 0.2) sleepQuality = 'poor';
  
  // Calculate sleep debt (assuming 8 hours is optimal)
  const sleepDebt = Math.max(0, 8 - sleepHours);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />
      <LinearGradient
        colors={colors.backgroundGradient}
        style={styles.background}
      />
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={[
            styles.title, 
            { 
              color: colors.text,
              textShadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.25)'
            }
          ]}>FitFusion</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatDate(date)}</Text>
          
          <TouchableOpacity style={styles.themeToggle} onPress={toggleTheme}>
            <Ionicons 
              name={isDark ? 'sunny-outline' : 'moon-outline'} 
              size={24} 
              color={colors.text} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsContainer}>
          <Card 
            title="STEPS" 
            value={steps.toLocaleString()}
            subtitle={`${((steps / 10000) * 100).toFixed(0)}% OF DAILY GOAL`}
            color={colors.cardGradients.steps}
            icon="👣"
          />
          <Card 
            title="DISTANCE" 
            value={`${(distance / 1000).toFixed(2)} km`}
            subtitle={`${(distance / 1000 / 5 * 100).toFixed(0)}% OF TARGET 5KM`}
            color={colors.cardGradients.distance}
            icon="🌐"
          />
          <Card 
            title="CALORIES" 
            value={`${caloriesBurned} kcal`}
            subtitle={`${(caloriesBurned / 2000 * 100).toFixed(0)}% OF DAILY BURN GOAL`}
            color={colors.cardGradients.calories}
            icon="🔥"
          />
          <Card 
            title="FLOORS" 
            value={floors.toString()}
            subtitle={`APPROX. ${(floors * 3).toFixed(0)}m ELEVATION`}
            color={colors.cardGradients.floors}
            icon="🏢"
          />
          
          {/* Full width sleep card with enhanced details */}
          <Card 
            title="SLEEP ANALYSIS" 
            value={`${sleepHours.toFixed(1)} hours`}
            subtitle={sleepDebt > 0.5 ? `SLEEP DEBT: ${sleepDebt.toFixed(1)} HOURS` : "WELL RESTED"}
            color={colors.cardGradients.sleep}
            icon="💤"
            fullWidth={true}
          >
            <SleepQualityIndicator quality={sleepQuality} />
            
            {sleepStages && (
              <View style={styles.sleepStagesContainer}>
                <SleepStageBar 
                  stage="REM Sleep" 
                  duration={sleepStages.REM} 
                  totalDuration={totalSleepTime} 
                  color="#FF5E62"
                  icon="🧠" 
                />
                <SleepStageBar 
                  stage="Deep Sleep" 
                  duration={sleepStages.deep} 
                  totalDuration={totalSleepTime} 
                  color="#2196F3" 
                  icon="⚡" 
                />
                <SleepStageBar 
                  stage="Light Sleep" 
                  duration={sleepStages.light} 
                  totalDuration={totalSleepTime} 
                  color="#00BCD4" 
                  icon="💫" 
                />
                <SleepStageBar 
                  stage="Awake" 
                  duration={sleepStages.awake} 
                  totalDuration={totalSleepTime + sleepStages.awake} 
                  color="#A4B0BD" 
                  icon="👁️" 
                />
              </View>
            )}
            
            <View style={styles.sleepInsightsContainer}>
              <Text style={[styles.sleepInsightsTitle, { color: "#ffffff" }]}>SLEEP INSIGHTS</Text>
              <Text style={[styles.sleepInsightsText, { color: "rgba(255, 255, 255, 0.8)" }]}>
                {sleepQuality === 'excellent' ? 
                  "Excellent deep and REM sleep. Your body is recovering well." :
                  sleepQuality === 'good' ? 
                  "Good balance of sleep stages. Focus on consistency." :
                  sleepQuality === 'poor' ? 
                  "Low deep sleep. Try to reduce stress before bedtime." :
                  "Fair sleep quality. Consider improving sleep hygiene."}
              </Text>
            </View>
            
            {/* Sleep recommendations */}
            <View style={styles.sleepRecommendations}>
              <Text style={styles.sleepRecommendationsTitle}>RECOMMENDATIONS</Text>
              <View style={styles.recommendationItem}>
                <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.recommendationText}>
                  {sleepDebt > 1 ? "Try to sleep 30-60 minutes earlier tonight" : 
                   "Maintain your current sleep schedule"}
                </Text>
              </View>
              <View style={styles.recommendationItem}>
                <Ionicons name="moon-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.recommendationText}>
                  {sleepQuality === 'poor' || sleepQuality === 'fair' ? 
                    "Reduce screen time 1 hour before bed" : 
                    "Continue your effective bedtime routine"}
                </Text>
              </View>
            </View>
          </Card>
        </View>

        <View style={[styles.quoteBubble, { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
        }]}>
          <Text style={[styles.quoteText, { color: colors.text }]}>
            "The future of health is here. Your body, quantified."
          </Text>
        </View>
        
        {/* Extra space at the bottom for better scrolling */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <AppContent />
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
    position: 'relative',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 5,
  },
  dateText: {
    fontSize: 16,
    marginTop: 8,
  },
  themeToggle: {
    position: 'absolute',
    right: 20,
    top: 8,
    padding: 8,
    borderRadius: 20,
  },
  cardsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardWrapper: {
    width: cardWidth,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    aspectRatio: 0.9,
  },
  fullWidthCard: {
    width: '100%',
    aspectRatio: undefined,
    marginBottom: 24,
  },
  cardGradient: {
    borderRadius: 20,
    height: '100%',
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    height: '100%',
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
    fontWeight: '600',
    letterSpacing: 1,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sleepStagesContainer: {
    marginTop: 20,
    marginBottom: 12,
  },
  sleepStageContainer: {
    marginBottom: 14,
  },
  sleepStageLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    alignItems: 'center',
  },
  sleepStageLabelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepStageLabelRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sleepStageIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  sleepStageText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sleepStageDuration: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  sleepStagePercentage: {
    fontSize: 10,
  },
  sleepStageBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  sleepStageBar: {
    height: '100%',
    borderRadius: 5,
  },
  sleepQualityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  sleepQualityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sleepQualityTextContainer: {
    flex: 1,
  },
  sleepQualityText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sleepQualitySubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sleepInsightsContainer: {
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sleepInsightsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  sleepInsightsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  quoteBubble: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sleepRecommendations: {
    marginTop: 18,
    padding: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sleepRecommendationsTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.8,
    color: '#ffffff',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  recommendationText: {
    fontSize: 14,
    marginLeft: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    flex: 1,
  },
  bottomSpace: {
    height: 100,
  },
});