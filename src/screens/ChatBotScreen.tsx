import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GEMINI_API_KEY } from '@env';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useHealthData, WorkoutData } from '../hooks/useHealthData';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface HealthData {
  steps: number;
  distance: number;
  floors: number;
  sleepHours: number;
  height: number;
  weight: number;
  workouts: WorkoutData[];
  sleepStages?: {
    REM: number;
    deep: number;
    light: number;
    awake: number;
  };
}

interface ChatBotScreenProps {
  initialTopic?: string;
}

// Initialize Gemini with error handling
let genAI: GoogleGenerativeAI | undefined;
try {
  if (!GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not defined in .env file');
  } else {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  }
} catch (error) {
  console.error('Error initializing Gemini:', error);
}

const renderMessage = (text: string, isUser: boolean, colors: any) => {
  if (!text.includes('**') && !text.includes('*')) {
    return (
      <Text style={[
        styles.messageText,
        { color: isUser ? '#fff' : colors.text }
      ]}>
        {text}
      </Text>
    );
  }

  const textColor = isUser ? '#fff' : colors.text;
  const listIconColor = isUser ? '#fff' : colors.primary;

  return (
    <Markdown
      style={{
        body: { ...styles.messageText, color: textColor } as any,
        strong: { ...styles.markdownBold, color: textColor } as any,
        em: { ...styles.markdownItalic, color: textColor } as any,
        bullet_list: styles.markdownList,
        bullet_list_icon: { ...styles.markdownListIcon, color: listIconColor } as any,
        bullet_list_content: { ...styles.markdownListContent, color: textColor } as any,
        heading1: { ...styles.markdownHeading1, color: textColor } as any,
        heading2: { ...styles.markdownHeading2, color: textColor } as any,
        heading3: { ...styles.markdownHeading3, color: textColor } as any,
        paragraph: { ...styles.markdownParagraph, color: textColor } as any,
      }}
    >
      {text}
    </Markdown>
  );
};

export default function ChatBotScreen({ initialTopic }: ChatBotScreenProps) {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const healthData = useHealthData();
  const healthDataRef = useRef(healthData);

  // Update the ref when healthData changes, but don't trigger re-renders
  useEffect(() => {
    healthDataRef.current = healthData;
  }, [healthData]);

  // Set up initial message with user's health context if available
  useEffect(() => {
    const welcomeMessage: Message = {
      text: "👋 Hello! I'm your AI health assistant. I have access to your latest health data and can provide personalized advice. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  }, []);
  
  // Handle initial topic separately
  useEffect(() => {
    if (initialTopic) {
      setTimeout(() => {
        const data = healthDataRef.current;
        const topicMap: { [key: string]: string } = {
          "steps": `I took ${data.steps || 0} steps today. Can you analyze this and give me feedback?`,
          "walking distance": `I walked ${data.distance ? (data.distance / 1000).toFixed(2) : 0} km today. Is this enough?`,
          "stair climbing": `I climbed ${data.floors || 0} floors today. Is this good exercise?`,
          "sleep": `I slept ${data.sleepHours ? data.sleepHours.toFixed(1) : 0} hours last night. How can I improve my sleep quality?`,
          "workouts": `Here's my workout history. Can you analyze my recent workouts and suggest improvements?`,
          "weight": `My weight is ${data.weight ? data.weight.toFixed(1) : 'unknown'} kg and my height is ${data.height ? (data.height * 100).toFixed(0) : 'unknown'} cm. Is this healthy?`
        };
        
        const query = topicMap[initialTopic] || `Can you tell me more about ${initialTopic}?`;
        setInputText(query);
        
        // Automatically send the message after setting input text
        const userMessage: Message = {
          text: query,
          isUser: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, userMessage]);
        handleSendMessage(query);
      }, 500);
    }
  }, [initialTopic]); // Remove healthData from dependencies
  
  // Create a context string from health data
  const createHealthContext = () => {
    const data = healthDataRef.current;
    let context = "My current health data:\n";
    
    // Basic metrics
    context += `- Steps today: ${data.steps || 0}\n`;
    context += `- Distance walked: ${data.distance ? (data.distance / 1000).toFixed(2) : 0} km\n`;
    context += `- Floors climbed: ${data.floors || 0}\n`;
    context += `- Sleep duration: ${data.sleepHours ? data.sleepHours.toFixed(1) : 0} hours\n`;
    
    // Height and weight if available
    if (data.height) {
      const heightCm = (data.height * 100).toFixed(1);
      context += `- Height: ${heightCm} cm\n`;
    }
    
    if (data.weight) {
      context += `- Weight: ${data.weight.toFixed(1)} kg\n`;
      
      // Calculate BMI if both height and weight are available
      if (data.height) {
        const bmi = (data.weight / (data.height * data.height)).toFixed(1);
        context += `- BMI: ${bmi}\n`;
      }
    }
    
    // Sleep stages breakdown
    if (data.sleepStages) {
      context += "- Sleep stages breakdown:\n";
      context += `  - REM sleep: ${data.sleepStages.REM.toFixed(1)} hours\n`;
      context += `  - Deep sleep: ${data.sleepStages.deep.toFixed(1)} hours\n`;
      context += `  - Light sleep: ${data.sleepStages.light.toFixed(1)} hours\n`;
      context += `  - Awake time: ${data.sleepStages.awake.toFixed(1)} hours\n`;
    }
    
    // Workout data (recent workouts)
    if (data.workouts && data.workouts.length > 0) {
      context += "\nRecent workout history:\n";
      
      // Get the last 5 workouts for context
      const recentWorkouts = data.workouts.slice(0, 5);
      
      recentWorkouts.forEach((workout, index) => {
        context += `- Workout ${index + 1}: ${workout.name} (${workout.type})\n`;
        context += `  - Date: ${workout.date}\n`;
        context += `  - Duration: ${workout.duration} minutes\n`;
        context += `  - Calories burned: ${workout.calories} cal\n`;
        if (workout.distance) {
          context += `  - Distance: ${workout.distance} km\n`;
        }
      });
      
      // Calculate weekly totals
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      
      const weeklyWorkouts = data.workouts.filter(workout => {
        const workoutDate = new Date(workout.date);
        return workoutDate >= startOfWeek;
      });
      
      const totalWorkouts = weeklyWorkouts.length;
      const totalDuration = weeklyWorkouts.reduce((sum, workout) => sum + workout.duration, 0);
      const totalCalories = weeklyWorkouts.reduce((sum, workout) => sum + workout.calories, 0);
      
      context += "\nWeekly workout summary:\n";
      context += `- Total workouts this week: ${totalWorkouts}\n`;
      context += `- Total active minutes: ${totalDuration}\n`;
      context += `- Total calories burned: ${totalCalories}\n`;
    }
    
    return context;
  };

  // Handle message sending separate from the component function
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    if (!genAI) {
      setError("AI service is not initialized. Please check your API key.");
      return;
    }

    setInputText('');
    setLoading(true);
    setError(null);

    try {
      // Create our prompt with health context
      let prompt = text.trim();
      const healthContext = createHealthContext();
      
      if (healthContext) {
        prompt = `${healthContext}\n\nMy question: ${prompt}\n\nPlease provide personalized health advice based on my data.`;
      }
      
      // Use the updated model name
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      
      // System prompt to guide AI response style
      const generationConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      };
      
      const chat = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: "Can you help me with health and fitness advice?" }],
          },
          {
            role: "model",
            parts: [{ text: "I'd be happy to help you with health and fitness advice! I can provide personalized recommendations based on your health data, suggest exercise routines, offer nutrition guidance, analyze your sleep patterns, and more. What specific aspect of your health would you like to focus on today?" }],
          },
        ],
      });
      
      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const responseText = response.text();

      if (responseText) {
        const botMessage: Message = {
          text: responseText,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
        
        // Scroll to bottom after a small delay to ensure the message is rendered
        setTimeout(() => scrollToBottom(), 100);
      } else {
        throw new Error("Empty response received from AI");
      }
    } catch (error) {
      console.error('Error getting response:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'Invalid API key. Please check your configuration.';
        } else if (error.message.includes('model')) {
          errorMessage = 'Error accessing the AI model. Please try again later.';
        }
      }

      setError(errorMessage);
      const errorMessageObj: Message = {
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessageObj]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!inputText.trim() || loading) return;
    
    const userMessage: Message = {
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    handleSendMessage(inputText);
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // Optimized scrollToBottom whenever messages change
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  if (!genAI) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error: Could not initialize the chat. Please check your API key configuration.
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            try {
              if (GEMINI_API_KEY) {
                genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
                // Force a re-render
                setError(null);
              } else {
                Alert.alert('Error', 'API key is missing. Please check your environment configuration.');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to initialize chat. Please check your API key.');
            }
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBar} />
      <LinearGradient
        colors={colors.backgroundGradient}
        style={StyleSheet.absoluteFillObject}
      />

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>AI Health Assistant</Text>
        <TouchableOpacity
          style={[
            styles.headerButton,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' }
          ]}
          onPress={() => {
            setMessages([{
              text: "👋 Hello! I'm your AI health assistant. I have access to your latest health data and can provide personalized advice. How can I help you today?",
              isUser: false,
              timestamp: new Date(),
            }]);
          }}
        >
          <MaterialCommunityIcons name="refresh" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={[styles.errorContainer, { backgroundColor: colors.error }]}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <MaterialCommunityIcons name="close" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={scrollToBottom}
        >
          {messages.map((message, index) => (
            <View
              key={index}
              style={[
                styles.messageBubble,
                message.isUser
                  ? [styles.userMessage, { backgroundColor: colors.primary }]
                  : [styles.aiMessage, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }],
              ]}
            >
              {renderMessage(message.text, message.isUser, colors)}
              <Text style={[
                styles.timestamp, 
                { color: message.isUser ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary }
              ]}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          ))}
          {loading && (
            <View
              style={[
                styles.messageBubble,
                styles.aiMessage,
                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
              ]}
            >
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  Thinking...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { 
              color: colors.text,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'
            }]}
            placeholder="Type your health question..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: colors.primary },
              !inputText.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim() || loading}
          >
            <MaterialCommunityIcons
              name="send"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButton: {
    padding: 8,
    borderRadius: 20,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    maxWidth: '80%',
    elevation: 1,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    padding: 12,
    borderRadius: 20,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  errorContainer: {
    padding: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorText: {
    color: 'white',
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  markdownBold: {
    fontWeight: 'bold',
  },
  markdownItalic: {
    fontStyle: 'italic',
  },
  markdownList: {
    marginVertical: 8,
  },
  markdownListIcon: {
    fontSize: 12,
  },
  markdownListContent: {
    flex: 1,
  },
  markdownHeading1: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  markdownHeading2: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 6,
  },
  markdownHeading3: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  markdownParagraph: {
    marginVertical: 4,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    alignSelf: 'center',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});