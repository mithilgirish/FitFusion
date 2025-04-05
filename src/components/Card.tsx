import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ViewStyle, 
  TextStyle,
  StyleProp
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  title: string;
  value?: string;
  subtitle?: string;
  gradient?: readonly [string, string];
  icon?: string | React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  children?: React.ReactNode;
  animated?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  value, 
  subtitle, 
  gradient, 
  icon, 
  onPress, 
  style, 
  titleStyle,
  valueStyle,
  subtitleStyle,
  children,
  animated = true
}) => {
  const { colors, isDark } = useTheme();
  
  const cardContent = (
    <View style={[
      styles.content, 
      { 
        backgroundColor: isDark ? colors.cardAlpha : colors.cardAlpha,
        borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.4)'
      }
    ]}>
      <View style={styles.header}>
        {typeof icon === 'string' ? (
          <Text style={styles.icon}>{icon}</Text>
        ) : icon ? (
          <View style={styles.iconContainer}>{icon}</View>
        ) : null}
        <Text style={[
          styles.title, 
          { color: '#ffffff' },
          titleStyle
        ]}>{title}</Text>
      </View>
      
      {value && (
        <Text style={[
          styles.value, 
          { 
            color: '#ffffff',
            textShadowColor: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'
          },
          valueStyle
        ]}>{value}</Text>
      )}
      
      {subtitle && (
        <Text style={[
          styles.subtitle, 
          { color: 'rgba(255, 255, 255, 0.6)' },
          subtitleStyle
        ]}>{subtitle}</Text>
      )}
      
      {children}
    </View>
  );
  
  const cardComponent = gradient ? (
    <LinearGradient
      colors={gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradient,
        { 
          shadowColor: colors.shadow.shadowColor,
          shadowOffset: colors.shadow.shadowOffset,
          shadowOpacity: colors.shadow.shadowOpacity,
          shadowRadius: colors.shadow.shadowRadius,
          elevation: colors.shadow.elevation,
        }
      ]}
    >
      {cardContent}
    </LinearGradient>
  ) : (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.card,
        shadowColor: colors.shadow.shadowColor,
        shadowOffset: colors.shadow.shadowOffset,
        shadowOpacity: colors.shadow.shadowOpacity,
        shadowRadius: colors.shadow.shadowRadius,
        elevation: colors.shadow.elevation,
      },
      style
    ]}>
      {cardContent}
    </View>
  );
  
  if (onPress) {
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          style={styles.touchable}
        >
          {cardComponent}
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={styles.wrapper}>
      {cardComponent}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  touchable: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  container: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  content: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  iconContainer: {
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
});

export default Card; 