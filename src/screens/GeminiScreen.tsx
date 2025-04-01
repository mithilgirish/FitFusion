import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { useHealthData } from '../hooks/useHealthData';

// Initialize Gemini
const genAI = new GoogleGenerativeAI('YOUR_API_KEY'); // Replace with your actual API key

export default function GeminiScreen() {
  const { steps, distance, floors, sleepHours, sleepStages } = useHealthData();
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analyzeHealthData();
  }, [steps, distance, floors, sleepHours, sleepStages]);

  const analyzeHealthData = async () => {
    if (!steps || !distance || !floors || !sleepHours) return;

    setLoading(true);
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const prompt = `Analyze the following health data and provide personalized insights and recommendations:
        Steps: ${steps}
        Distance: ${distance} meters
        Floors Climbed: ${floors}
        Sleep: ${sleepHours.toFixed(1)} hours
        Sleep Stages:
        - REM: ${sleepStages.REM.toFixed(1)} hours
        - Deep Sleep: ${sleepStages.deep.toFixed(1)} hours
        - Light Sleep: ${sleepStages.light.toFixed(1)} hours
        - Awake Time: ${sleepStages.awake.toFixed(1)} hours

        Please provide:
        1. A summary of the user's activity level
        2. Health benefits of their current activity
        3. Personalized recommendations for improvement
        4. Tips for maintaining or increasing activity levels
        5. Sleep quality analysis and recommendations`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      setAnalysis(response.text());
    } catch (error) {
      console.error('Error analyzing health data:', error);
      setAnalysis('Sorry, there was an error analyzing your health data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Health Insights</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />
      ) : (
        <View style={styles.analysisContainer}>
          <Text style={styles.analysisText}>{analysis}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loader: {
    marginTop: 20,
  },
  analysisContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analysisText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
}); 