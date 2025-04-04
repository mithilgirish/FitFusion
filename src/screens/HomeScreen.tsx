import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, SafeAreaView, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealthData } from '.././hooks/useHealthData';
import {  useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface CardProps {
  title: string;
  value: string;
  subtitle?: string;
  color: readonly [string, string];
  icon?: string;
  children?: React.ReactNode;
}

const { width } = Dimensions.get('window');
const cardWidth = width / 2 - 24;

const Card = ({ title, value, subtitle, color, icon, children }: CardProps) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={styles.cardWrapper}>
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

const SleepStageBar = ({ stage, duration, totalDuration, color }: { stage: string; duration: number; totalDuration: number; color: string }) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View style={styles.sleepStageContainer}>
      <View style={styles.sleepStageLabel}>
        <Text style={[styles.sleepStageText, { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }]}>{stage}</Text>
        <Text style={[styles.sleepStageDuration, { color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)' }]}>{duration.toFixed(1)}h</Text>
      </View>
      <View style={[styles.sleepStageBarContainer, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
        <View 
          style={[
            styles.sleepStageBar, 
            { width: `${(duration / totalDuration) * 100}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
};

function AppContent() {
  const [date] = useState(new Date());
  const { steps, distance, floors, sleepHours, sleepStages } = useHealthData();
  const { theme, toggleTheme, colors, isDark } = useTheme();
  
  const totalSleepStages = sleepStages ? 
    sleepStages.awake + sleepStages.light + sleepStages.deep + sleepStages.REM : 0;

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
          
     
        </View>

        <View style={styles.cardsContainer}>
          <Card 
            title="STEPS" 
            value={steps.toLocaleString()}
            subtitle="GOAL: 10,000"
            color={colors.cardGradients.steps}
            icon="👣"
          />
          <Card 
            title="DISTANCE" 
            value={`${(distance / 1000).toFixed(2)} km`}
            subtitle="KEEP MOVING"
            color={colors.cardGradients.distance}
            icon="🌐"
          />
          <Card 
            title="FLOORS" 
            value={floors.toString()}
            subtitle="ELEVATION GAINED"
            color={colors.cardGradients.floors}
            icon="🏢"
          />
          <Card 
            title="SLEEP" 
            value={`${sleepHours.toFixed(1)} hrs`}
            subtitle="SLEEP ANALYSIS"
            color={colors.cardGradients.sleep}
            icon="💤"
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

        <View style={[styles.quoteBubble, { 
          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)'
        }]}>
          <Text style={[styles.quoteText, { color: colors.text }]}>
            "The future of health is here. Your body, quantified."
          </Text>
        </View>
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
    borderRadius: 20,
    borderWidth: 1,
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
    fontWeight: '500',
  },
  sleepStageDuration: {
    fontSize: 12,
  },
  sleepStageBarContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  sleepStageBar: {
    height: '100%',
    borderRadius: 3,
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
});