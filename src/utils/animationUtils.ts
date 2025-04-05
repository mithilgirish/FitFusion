import { Animated, Easing } from 'react-native';

// Animation preset configurations
export const Animations = {
  fadeIn: (value: Animated.Value, duration: number = 300) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    });
  },
  
  fadeOut: (value: Animated.Value, duration: number = 300) => {
    return Animated.timing(value, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    });
  },
  
  slideInUp: (value: Animated.Value, duration: number = 300, fromValue: number = 100) => {
    value.setValue(fromValue);
    return Animated.timing(value, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    });
  },
  
  slideInDown: (value: Animated.Value, duration: number = 300, fromValue: number = -100) => {
    value.setValue(fromValue);
    return Animated.timing(value, {
      toValue: 0,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    });
  },
  
  slideOutUp: (value: Animated.Value, duration: number = 300, toValue: number = -100) => {
    return Animated.timing(value, {
      toValue,
      duration,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    });
  },
  
  slideOutDown: (value: Animated.Value, duration: number = 300, toValue: number = 100) => {
    return Animated.timing(value, {
      toValue,
      duration,
      useNativeDriver: true,
      easing: Easing.in(Easing.ease),
    });
  },
  
  pulse: (value: Animated.Value, duration: number = 1000) => {
    return Animated.sequence([
      Animated.timing(value, {
        toValue: 1.1,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(value, {
        toValue: 1,
        duration: duration / 2,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]);
  },
  
  shake: (value: Animated.Value, duration: number = 500, intensity: number = 10) => {
    value.setValue(0);
    return Animated.sequence([
      Animated.timing(value, { toValue: intensity, duration: duration / 5, useNativeDriver: true }),
      Animated.timing(value, { toValue: -intensity, duration: duration / 5, useNativeDriver: true }),
      Animated.timing(value, { toValue: intensity / 2, duration: duration / 5, useNativeDriver: true }),
      Animated.timing(value, { toValue: -intensity / 2, duration: duration / 5, useNativeDriver: true }),
      Animated.timing(value, { toValue: 0, duration: duration / 5, useNativeDriver: true }),
    ]);
  },
  
  bounce: (value: Animated.Value, duration: number = 800) => {
    value.setValue(0);
    return Animated.sequence([
      Animated.spring(value, {
        toValue: 1,
        useNativeDriver: true,
        friction: 5,
        tension: 40,
      }),
    ]);
  },

  stagger: (animations: Animated.CompositeAnimation[], delay: number = 100) => {
    return Animated.stagger(delay, animations);
  },
  
  loop: (animation: Animated.CompositeAnimation, iterations: number = -1) => {
    return Animated.loop(animation, { iterations });
  },
  
  // Scale animation for button press effect
  pressIn: (value: Animated.Value, scale: number = 0.95, duration: number = 150) => {
    return Animated.timing(value, {
      toValue: scale,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.ease),
    });
  },
  
  pressOut: (value: Animated.Value, duration: number = 150) => {
    return Animated.timing(value, {
      toValue: 1,
      duration,
      useNativeDriver: true,
      easing: Easing.out(Easing.elastic(1.3)),
    });
  },
};

// Animation hooks for components
export const useAnimatedValue = (initialValue: number = 0) => {
  return new Animated.Value(initialValue);
};

// Create interpolated transforms
export const createTransform = (
  animatedValue: Animated.Value,
  inputRange: number[],
  outputRange: number[] | string[],
  extrapolate: 'clamp' | 'identity' | 'extend' = 'clamp'
) => {
  return animatedValue.interpolate({
    inputRange,
    outputRange,
    extrapolate,
  });
};

// Combine multiple animations
export const sequence = (animations: Animated.CompositeAnimation[]) => {
  return Animated.sequence(animations);
};

export const parallel = (animations: Animated.CompositeAnimation[]) => {
  return Animated.parallel(animations);
};

// Get timing from theme
export const getTimingFromTheme = (theme: any, type: 'short' | 'medium' | 'long' = 'medium') => {
  return theme.colors.animation.duration[type];
};

// Get easing from theme
export const getEasingFromTheme = (theme: any, type: 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce' = 'easeOut') => {
  return theme.colors.animation.timing[type];
};

export default Animations; 