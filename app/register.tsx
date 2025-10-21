import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { supabase } from '../supabaseConfig';

export default function RegisterScreen() {
  const scale = useSharedValue(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });
  const onPressIn = () => { scale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 100 }); };

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Помилка', 'Будь ласка, заповни всі поля');
      return;
    }

    // Реєстр користувача
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Помилка реєстрації', error.message);
      return;
    }

    if (!data.user) {
      Alert.alert('Помилка', 'Не вдалося створити користувача. Можливо, такий email вже існує.');
      return;
    }

    // Створення запису у таблиці 'profiles'
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { id: data.user.id, username: name } // 'id' має збігатися з user.id
      ]);

    if (profileError) {
      Alert.alert('Помилка профілю', profileError.message);
      return;
    }

    Alert.alert('Успіх!', 'Акаунт успішно створено.');
// TODO: Коли головний екран (дашборд) буде готовий, перекине туди:
// router.replace('/(tabs)/home');
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
          <Text style={styles.title}>Створити акаунт</Text>
          <Text style={styles.subtitle}>Почнемо твій шлях до гармонії</Text>
          <TextInput
            style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
            placeholder="Твоє ім'я"
            placeholderTextColor="#fccb8a"
            value={name}
            onChangeText={setName}
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput(null)}
          />
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
            onPress={handleRegister}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <Animated.View style={[styles.button, animatedStyle]}>
              <Text style={styles.buttonText}>Зареєструватися</Text>
            </Animated.View>
          </Pressable>

          <Pressable style={styles.linkButton} onPress={() => router.replace('/login')}>
            <Text style={styles.linkText}>Вже є акаунт? Увійти</Text>
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
    textAlign: 'center' },
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