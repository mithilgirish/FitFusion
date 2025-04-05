import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme, ColorValue, OpaqueColorValue } from 'react-native';

// Define the theme color types
type ThemeColors = {
  buttonSecondaryText: ColorValue | undefined;
  accent: string | OpaqueColorValue | undefined;
  switchTrackOff: ColorValue | null | undefined;
  switchThumb: ColorValue | undefined;
  textTertiary: ColorValue | undefined;
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  cardAlpha: string;
  cardGradients: {
    steps: readonly [string, string];
    distance: readonly [string, string];
    floors: readonly [string, string];
    sleep: readonly [string, string];
    default: readonly [string, string];
    workout: readonly [string, string];
    nutrition: readonly [string, string];
    water: readonly [string, string];
    heartRate: readonly [string, string];
    calories: readonly [string, string];
  };
  statusBar: 'dark-content' | 'light-content';
  backgroundGradient: readonly [string, string];
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  animation: {
    duration: {
      short: number;
      medium: number;
      long: number;
    };
    timing: {
      easeIn: string;
      easeOut: string;
      easeInOut: string;
      bounce: string;
    };
  };
}

// Define theme colors
const lightTheme: ThemeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  primary: '#5271ff',
  secondary: '#03dac6',
  error: '#b00020',
  success: '#4CAF50',
  warning: '#FF9800',
  info: '#2196F3',
  text: '#121212',
  textSecondary: '#757575',
  textTertiary: '#9e9e9e',
  border: '#e0e0e0',
  card: '#f0f0f0',
  cardAlpha: 'rgba(255, 255, 255, 0.15)',
  buttonSecondaryText: '#5271ff',
  accent: '#ff4081',
  switchTrackOff: 'rgba(0, 0, 0, 0.1)',
  switchThumb: '#ffffff',
  cardGradients: {
    steps: ['#FF9A9E', '#FAD0C4'] as const,
    distance: ['#A1C4FD', '#C2E9FB'] as const,
    floors: ['#96FBC4', '#F9F586'] as const,
    sleep: ['#FFDEE9', '#B5FFFC'] as const,
    default: ['#5271ff', '#9299ff'] as const,
    workout: ['#FF9A9E', '#FECFEF'] as const,
    nutrition: ['#43E97B', '#38F9D7'] as const,
    water: ['#4FACFE', '#00F2FE'] as const,
    heartRate: ['#FF512F', '#DD2476'] as const,
    calories: ['#FF6B6B', '#FF8E53'] as const,
  },
  statusBar: 'dark-content',
  backgroundGradient: ['#E0EAFC', '#CFDEF3'] as const,
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  animation: {
    duration: {
      short: 200,
      medium: 300,
      long: 500,
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
};

const darkTheme: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#6789ff',
  secondary: '#03dac6',
  error: '#cf6679',
  success: '#66BB6A',
  warning: '#FFA726',
  info: '#42A5F5',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  textTertiary: '#757575',
  border: '#2c2c2c',
  card: '#252525',
  cardAlpha: 'rgba(0, 0, 0, 0.2)',
  buttonSecondaryText: '#6789ff',
  accent: '#ff79b0',
  switchTrackOff: 'rgba(255, 255, 255, 0.3)',
  switchThumb: '#f1f1f1',
  cardGradients: {
    steps: ['#FF5F6D', '#FFC371'] as const,
    distance: ['#4776E6', '#8E54E9'] as const,
    floors: ['#00F260', '#0575E6'] as const,
    sleep: ['#834d9b', '#d04ed6'] as const,
    default: ['#6789ff', '#9299ff'] as const,
    workout: ['#FF416C', '#FF4B2B'] as const,
    nutrition: ['#00B09B', '#96C93D'] as const,
    water: ['#396afc', '#2948ff'] as const,
    heartRate: ['#FF0844', '#FFB199'] as const,
    calories: ['#F6356A', '#FF8C42'] as const,
  },
  statusBar: 'light-content',
  backgroundGradient: ['#000428', '#004e92'] as const,
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  animation: {
    duration: {
      short: 200,
      medium: 300,
      long: 500,
    },
    timing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },
};

type ThemeType = 'light' | 'dark' | 'system';

// Create context with default values
type ThemeContextType = {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
  colors: ThemeColors;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: 'system',
  toggleTheme: () => {},
  setTheme: () => {},
  colors: lightTheme,
  isDark: false,
});

// Create the provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Get device color scheme
  const deviceColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeType>('system');
  
  // Calculate the effective theme (actual light/dark value)
  const effectiveTheme = theme === 'system' 
    ? (deviceColorScheme || 'light') 
    : theme;
  
  const isDark = effectiveTheme === 'dark';

  // Update theme when device theme changes
  useEffect(() => {
    if (theme === 'system' && deviceColorScheme) {
      // Don't need to update state, just recalculate effective theme
      console.log(`System theme changed to ${deviceColorScheme}`);
    }
  }, [deviceColorScheme]);

  // Toggle theme function
  const toggleTheme = () => {
    setThemeState(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  };
  
  // Direct setter for theme
  const setTheme = (newTheme: ThemeType) => {
    setThemeState(newTheme);
  };

  // Get the right color palette based on theme
  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Create hook for easy theme access
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;