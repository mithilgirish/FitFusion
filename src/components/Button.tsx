import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  View,
  ViewStyle, 
  TextStyle,
  StyleProp
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

type ButtonVariant = 'filled' | 'outlined' | 'gradient' | 'text';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  gradient?: readonly [string, string];
  animated?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'filled',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  iconPosition = 'left',
  gradient,
  animated = true
}) => {
  const { colors, isDark } = useTheme();
  
  // Button height based on size
  const buttonHeight = size === 'small' ? 36 : size === 'medium' ? 44 : 52;
  const fontSize = size === 'small' ? 14 : size === 'medium' ? 16 : 18;
  const paddingHorizontal = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
  
  // Button style based on variant
  let buttonStyle: StyleProp<ViewStyle> = {};
  let buttonTextStyle: StyleProp<TextStyle> = {};
  
  // Common styles
  buttonStyle = {
    height: buttonHeight,
    paddingHorizontal,
    borderRadius: buttonHeight / 2,
  };
  
  switch (variant) {
    case 'filled':
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: disabled ? colors.border : colors.primary,
        ...(!disabled && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }),
      };
      buttonTextStyle = {
        color: disabled ? colors.textSecondary : '#ffffff',
      };
      break;
      
    case 'outlined':
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? colors.border : colors.primary,
      };
      buttonTextStyle = {
        color: disabled ? colors.textSecondary : colors.primary,
      };
      break;
      
    case 'text':
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
      };
      buttonTextStyle = {
        color: disabled ? colors.textSecondary : colors.primary,
      };
      break;
      
    case 'gradient':
      buttonStyle = {
        ...buttonStyle,
        backgroundColor: 'transparent',
        ...(!disabled && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 4.65,
          elevation: 8,
        }),
      };
      buttonTextStyle = {
        color: '#ffffff',
      };
      break;
  }
  
  const buttonContent = (
    <>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'outlined' || variant === 'text' ? colors.primary : '#ffffff'} />
      ) : (
        <>
          {icon && iconPosition === 'left' && icon}
          <Text style={[styles.text, { fontSize }, buttonTextStyle, textStyle]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && icon}
        </>
      )}
    </>
  );
  
  if (variant === 'gradient' && !disabled) {
    const gradientColors = gradient || [colors.primary, colors.secondary];
    return (
      <View style={[styles.container, buttonStyle, style]}>
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={disabled || loading}
          onPress={onPress}
          style={styles.touchable}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradient, { height: buttonHeight, borderRadius: buttonHeight / 2 }]}
          >
            <View style={styles.content}>
              {buttonContent}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <View style={[styles.container, buttonStyle, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        disabled={disabled || loading}
        onPress={onPress}
        style={styles.touchable}
      >
        <View style={styles.content}>
          {buttonContent}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    marginVertical: 8,
  },
  touchable: {
    height: '100%',
    width: '100%',
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  text: {
    fontWeight: '600',
    marginHorizontal: 8,
  },
});

export default Button; 