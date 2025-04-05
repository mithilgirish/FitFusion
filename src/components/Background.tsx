import React from 'react';
import { 
  StyleSheet, 
  StatusBar, 
  ViewStyle, 
  StyleProp, 
  View,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

interface BackgroundProps {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  overlay?: boolean;
  pattern?: boolean;
  animated?: boolean;
  gradient?: readonly [string, string];
}

const Background: React.FC<BackgroundProps> = ({
  style,
  children,
  overlay = false,
  pattern = false,
  animated = false,
  gradient,
}) => {
  const { colors, isDark } = useTheme();
  
  // Use provided gradient or default from theme
  const gradientColors = gradient || colors.backgroundGradient;
  
  return (
    <View style={[styles.container, style]}>
      <StatusBar barStyle={colors.statusBar} backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />
      
      {pattern && (
        <View style={styles.patternContainer}>
          <View style={[
            styles.patternCircle, 
            { 
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.03)' 
                : 'rgba(0, 0, 0, 0.02)' 
            }
          ]} />
          <View style={[
            styles.patternCircle, 
            { 
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.02)' 
                : 'rgba(0, 0, 0, 0.01)',
              width: width * 1.4,
              height: width * 1.4,
            }
          ]} />
          <View style={[
            styles.patternCircle, 
            { 
              backgroundColor: isDark 
                ? 'rgba(255, 255, 255, 0.01)' 
                : 'rgba(0, 0, 0, 0.005)',
              width: width * 1.8,
              height: width * 1.8,
            }
          ]} />
        </View>
      )}
      
      {overlay && (
        <View style={[
          styles.overlay, 
          { 
            backgroundColor: isDark 
              ? 'rgba(0, 0, 0, 0.2)' 
              : 'rgba(255, 255, 255, 0.1)'
          }
        ]} />
      )}
      
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  patternContainer: {
    position: 'absolute',
    width: width,
    height: height,
    alignItems: 'center',
    justifyContent: 'center',
  },
  patternCircle: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width / 2,
  },
});

export default Background; 