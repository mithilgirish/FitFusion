import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Define the theme color types
type ThemeColors = {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  error: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  cardGradients: {
    steps: readonly [string, string];
    distance: readonly [string, string];
    floors: readonly [string, string];
    sleep: readonly [string, string];
    default: readonly [string, string];
  };
  statusBar: 'dark-content' | 'light-content';
  backgroundGradient: readonly [string, string];
}

// Define theme colors
const lightTheme: ThemeColors = {
  background: '#f5f5f5',
  surface: '#ffffff',
  primary: '#5271ff',
  secondary: '#03dac6',
  error: '#b00020',
  text: '#121212',
  textSecondary: '#757575',
  border: '#e0e0e0',
  card: '#f0f0f0',
  cardGradients: {
    steps: ['#FF9A9E', '#FAD0C4'] as const,
    distance: ['#A1C4FD', '#C2E9FB'] as const,
    floors: ['#96FBC4', '#F9F586'] as const,
    sleep: ['#FFDEE9', '#B5FFFC'] as const,
    default: ['#5271ff', '#9299ff'] as const,
  },
  statusBar: 'dark-content',
  backgroundGradient: ['#E0EAFC', '#CFDEF3'] as const,
};

const darkTheme: ThemeColors = {
  background: '#121212',
  surface: '#1e1e1e',
  primary: '#6789ff',
  secondary: '#03dac6',
  error: '#cf6679',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#2c2c2c',
  card: '#252525',
  cardGradients: {
    steps: ['#FF5F6D', '#FFC371'] as const,
    distance: ['#4776E6', '#8E54E9'] as const,
    floors: ['#00F260', '#0575E6'] as const,
    sleep: ['#834d9b', '#d04ed6'] as const,
    default: ['#6789ff', '#9299ff'] as const,
  },
  statusBar: 'light-content',
  backgroundGradient: ['#000428', '#004e92'] as const,
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