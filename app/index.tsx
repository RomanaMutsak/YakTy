import { router, useFocusEffect } from 'expo-router';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  inputBackground: 'rgba(121, 85, 72, 0.08)',
  inputFocusedBorder: '#A1887F',
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
};

export default function WelcomeScreen() {
  const introProgress = useSharedValue(0);
  const primaryScale = useSharedValue(1);
  const secondaryScale = useSharedValue(1);

  useFocusEffect(
    useCallback(() => {
      introProgress.value = 0; 
      introProgress.value = withTiming(1, { 
        duration: 2500, 
        easing: Easing.out(Easing.ease)
      });
    }, [])
  );

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(introProgress.value, [0, 0.4], [0, 1]);
    const translateY = interpolate(introProgress.value, [0, 0.4], [5, 0]); 
    return { opacity, transform: [{ translateY }] }; 
  });

  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(introProgress.value, [0.4, 0.7], [0, 1]); 
    const translateY = interpolate(introProgress.value, [0.4, 0.7], [10, 0]); 
    return { opacity, transform: [{ translateY }] };
  });

  const footerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(introProgress.value, [0.7, 1], [0, 1]); 
    const translateY = interpolate(introProgress.value, [0.7, 1], [20, 0]); 
    return { opacity, transform: [{ translateY }] };
  });

  const primaryAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: primaryScale.value }] };
  });
  const secondaryAnimatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: secondaryScale.value }] };
  });

  const onPrimaryPressIn = () => { primaryScale.value = withTiming(0.95, { duration: 100 }); };
  const onPrimaryPressOut = () => { primaryScale.value = withTiming(1, { duration: 100 }); };
  const onSecondaryPressIn = () => { secondaryScale.value = withTiming(0.95, { duration: 100 }); };
  const onSecondaryPressOut = () => { secondaryScale.value = withTiming(1, { duration: 100 }); };

  return (
    <View style={styles.container}>
      <View style={styles.mainContent}>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Як ти?
        </Animated.Text>
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Тут ти можеш бути чесним
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, footerAnimatedStyle]}>
        <Pressable
          onPress={() => router.push('/register')}
          onPressIn={onPrimaryPressIn}
          onPressOut={onPrimaryPressOut}
        >
          <Animated.View style={[styles.buttonPrimary, primaryAnimatedStyle]}>
            <Text style={styles.buttonPrimaryText}>Зареєструватися</Text>
          </Animated.View>
        </Pressable>
        <Pressable
          onPress={() => router.push('/login')}
          onPressIn={onSecondaryPressIn}
          onPressOut={onSecondaryPressOut}
        >
          <Animated.View style={[styles.buttonSecondary, secondaryAnimatedStyle]}>
            <Text style={styles.buttonSecondaryText}>Увійти</Text>
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  footer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontFamily: 'Nunito_300Light',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonPrimary: {
    backgroundColor: COLORS.buttonBackground,
    width: 300,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonPrimaryText: {
    fontSize: 18,
    color: COLORS.buttonText,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
  buttonSecondary: {
    width: 300,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: COLORS.buttonBackground,
    borderWidth: 1.5,
  },
  buttonSecondaryText: {
    fontSize: 18,
    color: COLORS.buttonBackground,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
});