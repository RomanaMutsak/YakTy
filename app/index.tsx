import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

export default function WelcomeScreen() {
  const gradientProgress = useSharedValue(0);
  const introProgress = useSharedValue(0); 
  const primaryScale = useSharedValue(1); 
  const secondaryScale = useSharedValue(1); 

  // --- Запускаємо всі анімації ---
  useEffect(() => {
    gradientProgress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    // 1. ЗБІЛЬШУЄМО ЗАГАЛЬНИЙ ЧАС АНІМАЦІЇ до 3 секунд
    introProgress.value = withTiming(1, { 
      duration: 3000, // <--- ЗМІНЕНО (було 2000)
      easing: Easing.out(Easing.ease) 
    });

  }, []); // Запускається один раз

  const animatedGradientProps = useAnimatedProps(() => {
    return {
      start: { x: gradientProgress.value * 0.75, y: 0 },
      end: { x: 1 - gradientProgress.value * 0.75, y: 1 },
    };
  });

  // --- Поетапні анімовані стилі ---

  // 2. Анімація для заголовка: 0% - 33% (перша секунда)
  const titleAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      introProgress.value,
      [0, 0.33], // <--- ЗМІНЕНО 
      [0, 1]
    );
    const scale = interpolate(
      introProgress.value,
      [0, 0.33], // <--- ЗМІНЕНО
      [0.98, 1]
    );
    return { opacity, transform: [{ scale }] };
  });

  // 3. Анімація для ПІДЗАГОЛОВКА: 33% - 66% (друга секунда)
  const subtitleAnimatedStyle = useAnimatedStyle(() => {
    // Починаємо з 0.33, коли заголовок вже з'явився
    const opacity = interpolate(
      introProgress.value,
      [0.33, 0.66], // <--- ЗМІНЕНО
      [0, 1]
    );
    const translateY = interpolate(
      introProgress.value,
      [0.33, 0.66], // <--- ЗМІНЕНО
      [10, 0]
    );
    return { opacity, transform: [{ translateY }] };
  });

  // 4. Анімація для КНОПОК: 66% - 100% (третя секунда)
  const footerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      introProgress.value,
      [0.66, 1], // <--- ЗМІНЕНО
      [0, 1]
    );
    const translateY = interpolate(
      introProgress.value,
      [0.66, 1], // <--- ЗМІНЕНО
      [20, 0]
    );
    return { opacity, transform: [{ translateY }] };
  });


  // --- Анімація натискання кнопок (без змін) ---
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
    <AnimatedLinearGradient
      colors={['#f7b733', '#fc4a1a']}
      style={styles.container}
      animatedProps={animatedGradientProps}
    >
      <View style={styles.mainContent}>
        <Animated.Text style={[styles.title, titleAnimatedStyle]}>
          Як ти?
        </Animated.Text>
        
        <Animated.Text style={[styles.subtitle, subtitleAnimatedStyle]}>
          Тут ти можеш бути чесним
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, footerAnimatedStyle]}>
        {/* ... (код кнопок без змін) ... */}
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
    </AnimatedLinearGradient>
  );
}

// --- Стилі (без змін) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 50, 
    fontFamily: 'Nunito_300Light',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10, 
  },
  subtitle: {
    fontSize: 20, 
    fontFamily: 'Nunito_400Regular',
    color: 'rgba(255, 255, 255, 0.8)', 
    textAlign: 'center',
    marginBottom: 30, 
  },
  buttonPrimary: {
    backgroundColor: 'white',
    width: 300,
    paddingVertical: 15,
    borderRadius: 30,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  buttonPrimaryText: {
    fontSize: 18,
    color: '#fc4a1a',
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
  buttonSecondary: {
    width: 300,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'white',
    borderWidth: 1.5,
  },
  buttonSecondaryText: {
    fontSize: 18,
    color: 'white',
    fontFamily: 'Nunito_400Regular',
    textAlign: 'center',
  },
});