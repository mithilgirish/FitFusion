import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Animated } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type IconType = 'ionicons' | 'material';

interface AnimatedIconProps {
  name: string;
  size?: number;
  color?: string;
  type?: IconType;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  name,
  size = 24,
  color,
  type = 'ionicons',
  style,
  onPress,
}) => {
  const { colors } = useTheme();
  
  // Use theme color if no color is provided
  const iconColor = color || colors.primary;
  
  // Determine which icon component to use
  const IconComponent = type === 'ionicons' ? Ionicons : MaterialCommunityIcons;
  
  return (
    <View style={[styles.container, style]}>
      <IconComponent
        name={name as any}
        size={size}
        color={iconColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AnimatedIcon; 