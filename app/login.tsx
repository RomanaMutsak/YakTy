import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { supabase } from '../supabaseConfig';

const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  inputBackground: 'rgba(121, 85, 72, 0.08)',
  inputFocusedBorder: '#A1887F',
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
};

export default function LoginScreen() {
  const scale = useSharedValue(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });
  const onPressIn = () => { scale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 100 }); };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Помилка', 'Будь ласка, заповни всі поля');
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) { Alert.alert('Помилка входу', error.message); return; }
    if (data.user) {
      console.log('Успішний вхід:', data.user.id);
      Alert.alert('Успіх!', 'Ви увійшли в систему.');
      // router.replace('/home');
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            <Ionicons
              name="heart-outline" 
              size={40}
              color={COLORS.textPrimary}
              style={{ marginBottom: 20 }}
            />

            <Text style={styles.title}>Раді бачити знову!</Text>
            <Text style={styles.subtitle}>Як ти сьогодні?</Text>

             <TextInput
              style={[styles.input, focusedInput === 'email' && styles.inputFocused]}
              placeholder="Email"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
            <View style={[styles.inputContainer, focusedInput === 'password' && styles.inputFocused]}>
              <TextInput
                style={styles.inputField}
                placeholder="Пароль"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
              />
              <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon}>
                <Ionicons
                  name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
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
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 30,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 35,
    textAlign: 'center',
  },
  input: {
    width: '90%',
    height: 50,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 15,
    paddingHorizontal: 20,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textPrimary,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 50,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputField: {
    flex: 1,
    height: '100%',
    paddingLeft: 20,
    paddingRight: 5,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  eyeIcon: {
    paddingHorizontal: 15,
  },
  inputFocused: {
    borderColor: COLORS.inputFocusedBorder,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: COLORS.buttonBackground,
    width: 300,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.buttonText,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
  linkButton: {
    marginTop: 25,
    padding: 5,
  },
  linkText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontFamily: 'Nunito_400Regular',
  },
});