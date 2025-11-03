import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../supabaseConfig';

const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  inputBackground: 'rgba(121, 85, 72, 0.08)',
  inputFocusedBorder: '#A1887F',
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
  error: '#D32F2F',
  switchActive: '#8D6E63', 
  switchInactive: 'rgba(121, 85, 72, 0.2)',
};

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(''); 
  
  // Стани для перемикачів сповіщень
  const [morningNotifications, setMorningNotifications] = useState(true);
  const [eveningNotifications, setEveningNotifications] = useState(true);
  
  // Функція для завантаження імені
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (error) {
      Alert.alert('Помилка', error.message);
    } else if (profile) {
      setUsername(profile.username);
    }
    setLoading(false);
  }, []);

 useFocusEffect(
    useCallback(() => {
      fetchProfile(); 
    }, [fetchProfile]) 
  );

  // Функція для оновлення профілю
  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Помилка', "Ім'я не може бути порожнім");
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', user.id);

    if (error) {
      Alert.alert('Помилка оновлення', error.message);
    } else {
      Alert.alert('Успіх', "Ім'я оновлено!");
    }
    setLoading(false);
  };

  // Функція виходу з системи
  const handleLogout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Помилка виходу', error.message);
      setLoading(false);
    } else {
      // Перекид на 'index' 
      router.replace('/'); 
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        
        <Text style={styles.sectionTitle}>Профіль</Text>
        <View style={styles.section}>
          <Text style={styles.label}>Твоє ім'я</Text>
          <TextInput
            style={styles.input}
            placeholder="Як тебе звати?"
            placeholderTextColor={COLORS.textSecondary}
            value={username}
            onChangeText={setUsername}
          />
          <Pressable style={styles.button} onPress={handleUpdateProfile}>
            <Text style={styles.buttonText}>Зберегти ім'я</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionTitle}>Сповіщення</Text>
        <View style={styles.section}>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Ранкові (9:00)</Text>
            <Switch
              trackColor={{ false: COLORS.switchInactive, true: COLORS.switchActive }}
              thumbColor={COLORS.background}
              onValueChange={() => setMorningNotifications(prev => !prev)}
              value={morningNotifications}
            />
          </View>
          <View style={styles.switchRow}>
            <Text style={styles.label}>Вечірні (21:00)</Text>
            <Switch
              trackColor={{ false: COLORS.switchInactive, true: COLORS.switchActive }}
              thumbColor={COLORS.background}
              onValueChange={() => setEveningNotifications(prev => !prev)}
              value={eveningNotifications}
            />
          </View>
          {/* Тут пізніше можна додати вибір часу */}
        </View>

        <Text style={styles.sectionTitle}>Акаунт</Text>
        <View style={styles.section}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutButtonText}>Вийти з акаунту</Text>
          </Pressable>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    padding: 20,
  },
  section: {
    backgroundColor: 'rgba(121, 85, 72, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textPrimary,
    marginBottom: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: 'white', 
    borderRadius: 15,
    paddingHorizontal: 15,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(121, 85, 72, 0.1)',
    marginBottom: 15,
  },
  button: {
    backgroundColor: COLORS.buttonBackground,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.buttonText,
    fontFamily: 'Nunito_600SemiBold',
  },
  // Для сповіщень
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10, 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    paddingVertical: 14,
    borderRadius: 15,
  },
  logoutButtonText: {
    fontSize: 16,
    color: COLORS.error, 
    fontFamily: 'Nunito_600SemiBold',
    marginLeft: 10,
  },
});