import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ViewStyle,
  StyleProp
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface HeaderProps {
  title: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  transparent?: boolean;
  style?: StyleProp<ViewStyle>;
  animated?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  transparent = false,
  style,
  animated = true
}) => {
  const { colors, isDark } = useTheme();
  
  return (
    <View 
      style={[
        styles.container, 
        {
          backgroundColor: transparent 
            ? 'transparent' 
            : isDark 
              ? colors.surface 
              : colors.background,
          borderBottomColor: transparent 
            ? 'transparent' 
            : colors.border,
        },
        style,
      ]}
    >
      <StatusBar 
        barStyle={colors.statusBar} 
        backgroundColor={transparent ? 'transparent' : colors.background}
        translucent={transparent}
      />
      
      <View style={styles.content}>
        {leftIcon ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onLeftPress}
            activeOpacity={0.7}
          >
            <Ionicons name={leftIcon as keyof typeof Ionicons.glyphMap} size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
        
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            {title}
          </Text>
        </View>
        
        {rightIcon ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRightPress}
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon as keyof typeof Ionicons.glyphMap} size={24} color={colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    borderBottomWidth: 1,
  },
  content: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
});

export default Header; 