import { FontAwesome5, Ionicons } from '@expo/vector-icons';
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

export default function RegisterScreen() {
  const scale = useSharedValue(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ scale: scale.value }] };
  });
  const onPressIn = () => { scale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 100 }); };

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      Alert.alert('Помилка', 'Будь ласка, заповни всі поля');
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert('Помилка', 'Паролі не збігаються');
      return;
    }
    const { data, error } = await supabase.auth.signUp({ email: email, password: password });
    if (error) { Alert.alert('Помилка реєстрації', error.message); return; }
    if (!data.user) { Alert.alert('Помилка', 'Не вдалося створити користувача.'); return; }
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{ id: data.user.id, username: name }]);
    if (profileError) { Alert.alert('Помилка профілю', profileError.message); return; }
    Alert.alert('Успіх!', 'Акаунт успішно створено.');
    router.replace('/(tabs)/home'); 
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
            <FontAwesome5 
              name="hand-holding-heart" 
              size={40} 
              color={COLORS.textPrimary} 
              style={{ marginBottom: 20 }} 
            />

            <Text style={styles.title}>Створити акаунт</Text>
            <Text style={styles.subtitle}>Твій особистий простір</Text>
            
            <TextInput
              style={[styles.input, focusedInput === 'name' && styles.inputFocused]}
              placeholder="Твоє ім'я"
              placeholderTextColor={COLORS.textSecondary}
              value={name}
              onChangeText={setName}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
            />
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
            <View style={[styles.inputContainer, focusedInput === 'confirmPassword' && styles.inputFocused]}>
              <TextInput
                style={styles.inputField}
                placeholder="Повтори пароль"
                placeholderTextColor={COLORS.textSecondary}
                value={passwordConfirmation}
                onChangeText={setPasswordConfirmation}
                secureTextEntry={!isConfirmPasswordVisible}
                onFocus={() => setFocusedInput('confirmPassword')}
                onBlur={() => setFocusedInput(null)}
              />
              <Pressable onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon}>
                <Ionicons 
                  name={isConfirmPasswordVisible ? "eye-outline" : "eye-off-outline"} 
                  size={22} 
                  color={COLORS.textSecondary}
                />
              </Pressable>
            </View>
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
    fontSize: 32, 
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