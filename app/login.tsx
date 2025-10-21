import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { supabase } from '../supabaseConfig'; // Імпорт клієнта

export default function LoginScreen() {
  const scale = useSharedValue(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });
  const onPressIn = () => { scale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 100 }); };

  // Оновлення логіки входу
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Помилка', 'Будь ласка, заповни всі поля');
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Помилка входу', error.message);
      return;
    }

    if (data.user) {
      console.log('Успішний вхід:', data.user.id);
      // Перекид на головний екран (Dashboard)
      // Поки що його немає, тому просто виведено сповіщення
      Alert.alert('Успіх!', 'Ви увійшли в систему.');
      // router.replace('/home'); // Коли /home буде готовий
    }
  };

  return (
    <LinearGradient
      colors={['#f7b733', '#fc4a1a']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <Text style={styles.title}>Раді бачити знову!</Text>
          <Text style={styles.subtitle}>Як ти сьогодні?</Text>
          <TextInput
            style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
            placeholder="Email"
            placeholderTextColor="#fccb8a"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />
          <TextInput
            style={[styles.input, focusedInput === 'password' && styles.inputFocused]}
            placeholder="Пароль"
            placeholderTextColor="#fccb8a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
          />

          <Pressable
            onPress={handleLogin}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <Animated.View style={[styles.button, animatedStyle]}>
              <Text style={styles.buttonText}>Увійти</Text>
            </Animated.View>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={() => router.replace('/register')}>
            <Text style={styles.linkText}>Немає акаунту? Створити</Text>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
},
  keyboardView: { 
    flex: 1 
},
  scrollView: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
},
  title: { 
    fontSize: 32, 
    fontFamily: 'Nunito_300Light', 
    color: 'white', 
    marginBottom: 10, 
    textAlign: 'center' 
},
  subtitle: { 
    fontSize: 18, 
    fontFamily: 'Nunito_400Regular', 
    color: 'rgba(255, 255, 255, 0.8)', 
    marginBottom: 40, 
    textAlign: 'center' 
},
  input: { 
    width: '90%', 
    height: 50, 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    fontFamily: 'Nunito_400Regular', 
    fontSize: 16, 
    color: 'white', 
    marginBottom: 15, 
    borderWidth: 1.5, 
    borderColor: 'transparent' 
},
  inputFocused: { 
    borderColor: 'white' 
},
  button: { 
    backgroundColor: 'white', 
    width: 300, 
    paddingVertical: 15, 
    borderRadius: 30, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 20 
},
  buttonText: { 
    fontSize: 18, 
    color: '#fc4a1a', 
    fontFamily: 'Nunito_600SemiBold', 
    textAlign: 'center' 
},
  linkButton: { 
    marginTop: 25, 
    padding: 10 
},
  linkText: { 
    fontSize: 16, 
    color: 'white', 
    fontFamily: 'Nunito_400Regular' 
},
});