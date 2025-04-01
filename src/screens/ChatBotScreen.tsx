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
} from 'react-native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GEMINI_API_KEY } from '@env';
import Markdown from 'react-native-markdown-display';
import { useTheme } from '../context/ThemeContext';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface HealthData {
  steps: number;
  distance: string;
  floors: number;
  sleepHours: string;
  sleepStages?: {
    REM: number;
    deep: number;
    light: number;
    awake: number;
  };
}

interface ChatBotScreenProps {
  initialTopic?: string;
  healthData?: HealthData;
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

export default function ChatBotScreen({ initialTopic, healthData }: ChatBotScreenProps) {
  const { theme, toggleTheme, colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Set up initial message with user's health context if available
  useEffect(() => {
    const welcomeMessage: Message = {
      text: healthData 
        ? "👋 Hello! I'm your AI health assistant. I have access to your latest health data and can provide personalized advice. How can I help you today?"
        : "👋 Hello! I'm your AI health assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
    
    // If initialTopic is provided, simulate a user query based on that topic
    if (initialTopic) {
      setTimeout(() => {
        const topicMap: { [key: string]: string } = {
          "steps": `I took ${healthData?.steps || 'some'} steps today. Can you analyze this and give me feedback?`,
          "walking distance": `I walked ${healthData?.distance || 'some'} km today. Is this enough?`,
          "stair climbing": `I climbed ${healthData?.floors || 'some'} floors today. Is this good exercise?`,
          "sleep": `I slept ${healthData?.sleepHours || 'some'} hours last night. How can I improve my sleep quality?`
        };
        
        const query = topicMap[initialTopic] || `Can you tell me more about ${initialTopic}?`;
        setInputText(query);
      }, 500);
    }
  }, [initialTopic, healthData]);

  // Create a context string from health data
  const createHealthContext = () => {
    if (!healthData) return "";
    
    let context = "My current health data:\n";
    context += `- Steps today: ${healthData.steps}\n`;
    context += `- Distance walked: ${healthData.distance} km\n`;
    context += `- Floors climbed: ${healthData.floors}\n`;
    context += `- Sleep duration: ${healthData.sleepHours} hours\n`;
    
    if (healthData.sleepStages) {
      context += "- Sleep stages breakdown:\n";
      context += `  - REM sleep: ${healthData.sleepStages.REM.toFixed(1)} hours\n`;
      context += `  - Deep sleep: ${healthData.sleepStages.deep.toFixed(1)} hours\n`;
      context += `  - Light sleep: ${healthData.sleepStages.light.toFixed(1)} hours\n`;
      context += `  - Awake time: ${healthData.sleepStages.awake.toFixed(1)} hours\n`;
    }
    
    return context;
  };

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;
    if (!genAI) {
      setError("AI service is not initialized. Please check your API key.");
      return;
    }

    const userMessage: Message = {
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError(null);

    try {
      // Create our prompt with health context
      let prompt = inputText.trim();
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

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  // Handle automatic sending of the first message when initialTopic is set
  useEffect(() => {
    if (inputText && initialTopic) {
      sendMessage();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputText, initialTopic]);

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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>AI Health Assistant</Text>
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
          >
            <MaterialCommunityIcons
              name={theme === 'light' ? 'weather-night' : 'weather-sunny'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
        {healthData && (
          <TouchableOpacity 
            style={[styles.dataIndicator, { backgroundColor: colors.card }]}
            onPress={() => {
              Alert.alert(
                "Health Data Available",
                "AI assistant has access to your health metrics:\n" + createHealthContext(),
                [{ text: "OK" }]
              );
            }}
          >
            <MaterialCommunityIcons name="database-check" size={18} color={colors.primary} />
            <Text style={[styles.dataIndicatorText, { color: colors.primary }]}>Health data connected</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={[styles.messagesContainer, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.isUser ? styles.userMessage : styles.botMessage,
            ]}
          >
            {!message.isUser && (
              <View style={[styles.botAvatar, { backgroundColor: colors.card }]}>
                <MaterialCommunityIcons name="robot" size={20} color={colors.primary} />
              </View>
            )}
            <View style={[
              styles.messageBubble,
              message.isUser ? [styles.userMessageBubble, { backgroundColor: colors.primary }] : [styles.botMessageBubble, { backgroundColor: colors.card }]
            ]}>
              {renderMessage(message.text, message.isUser, colors)}
              <Text style={[
                styles.timestamp,
                message.isUser ? styles.userTimestamp : styles.botTimestamp,
                { color: message.isUser ? 'rgba(255, 255, 255, 0.7)' : colors.textSecondary }
              ]}>
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
            </View>
          </View>
        ))}

        {loading && (
          <View style={[styles.loadingContainer, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text }]}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.suggestionContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        {messages.length > 0 && !loading && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.suggestionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setInputText("How can I improve my daily step count?")}
            >
              <Text style={[styles.suggestionText, { color: colors.primary }]}>Improve steps</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.suggestionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setInputText("Give me a personalized workout plan")}
            >
              <Text style={[styles.suggestionText, { color: colors.primary }]}>Workout plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.suggestionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setInputText("How can I sleep better?")}
            >
              <Text style={[styles.suggestionText, { color: colors.primary }]}>Sleep tips</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.suggestionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setInputText("What's a healthy diet for my activity level?")}
            >
              <Text style={[styles.suggestionText, { color: colors.primary }]}>Diet advice</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

      <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          }]}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Type your message..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !inputText.trim() && styles.sendButtonDisabled,
            { backgroundColor: inputText.trim() ? colors.primary : colors.border }
          ]}
          onPress={sendMessage}
          disabled={!inputText.trim() || loading}
        >
          <MaterialCommunityIcons
            name="send"
            size={24}
            color={inputText.trim() ? '#fff' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
  },
  dataIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
  },
  dataIndicatorText: {
    fontSize: 14,
    marginLeft: 6,
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 24,
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    width: '100%',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  botMessage: {
    justifyContent: 'flex-start',
  },
  botAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  userMessageBubble: {
    borderBottomRightRadius: 4,
  },
  botMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
    marginLeft: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
  },
  suggestionContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
  },
  suggestionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    minHeight: 40,
    borderWidth: 1,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  sendButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  markdownBold: {
    fontWeight: '700',
  },
  markdownItalic: {
    fontStyle: 'italic',
  },
  markdownList: {
    marginVertical: 8,
    paddingLeft: 8,
  },
  markdownListIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  markdownListContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  markdownHeading1: {
    fontSize: 24,
    fontWeight: '700',
    marginVertical: 16,
  },
  markdownHeading2: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 12,
  },
  markdownHeading3: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  markdownParagraph: {
    fontSize: 16,
    lineHeight: 24,
    marginVertical: 8,
  },
  userTimestamp: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  botTimestamp: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
});