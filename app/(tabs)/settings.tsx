import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  cancelNotification,
  registerForPushNotificationsAsync,
  scheduleDailyNotification
} from '../../services/notificationService';
import { supabase } from '../../supabaseConfig';

const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  sectionBackground: 'rgba(121, 85, 72, 0.05)',
  inputBackground: 'white',
  inputBorder: 'rgba(121, 85, 72, 0.1)',
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
  error: '#D32F2F',
  errorBackground: 'rgba(211, 47, 47, 0.1)',
  switchActive: '#8D6E63',
  switchInactive: 'rgba(121, 85, 72, 0.2)',
};

export default function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  
  const [morningNotifications, setMorningNotifications] = useState(true);
  const [eveningNotifications, setEveningNotifications] = useState(true); 

  useFocusEffect(
    useCallback(() => {
      async function loadData() {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { 
          router.replace('/login'); 
          setLoading(false);
          return; 
        }
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, morning_notify_enabled, evening_notify_enabled')
          .eq('id', user.id)
          .single();
        if (error) {
          Alert.alert('Помилка завантаження профілю', error.message);
        } else if (profile) {
          setUsername(profile.username || '');
          if (profile.morning_notify_enabled != null) {
            setMorningNotifications(profile.morning_notify_enabled);
          }
          if (profile.evening_notify_enabled != null) {
            setEveningNotifications(profile.evening_notify_enabled);
          }
        }
        setLoading(false);
      }
      loadData();
    }, [])
  );

  const updateUserProfile = async (column: string, value: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from('profiles')
      .update({ [column]: value })
      .eq('id', user.id);
    if (error) { Alert.alert('Помилка збереження', error.message); }
  };
  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      Alert.alert('Помилка', "Ім'я не може бути порожнім");
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    await updateUserProfile('username', username.trim());
    setLoading(false);
    Alert.alert('Успіх', "Ім'я оновлено!");
  };
  const handleLogout = async () => {
    Alert.alert(
      "Вийти з акаунту?",
      "Ви впевнені, що хочете вийти?",
      [
        { text: "Скасувати", style: "cancel" },
        { 
          text: "Вийти", 
          style: "destructive", 
          onPress: async () => {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Помилка виходу', error.message);
              setLoading(false);
            } else {
              router.replace('/'); 
            }
          }
        }
      ]
    );
  };

  const handleMorningToggle = async (value: boolean) => {
    setMorningNotifications(value);
    
    const NOTIFICATION_ID = 'morning'; 
    const TEST_ID = 'morning_test'; 
    
    if (value) {
      const permissionGranted = await registerForPushNotificationsAsync();
      if (permissionGranted) {
        
        // --- ТЕСТОВИЙ КОД ---
        const now = new Date();
        const testTime = new Date(now.getTime() + 60 * 1000); // 1 хвилина
        const testHour = testTime.getHours();
        const testMinute = testTime.getMinutes();
        console.log(`ПЛАНУЄМО ТЕСТОВЕ ОДНОРАЗОВЕ СПОВІЩЕННЯ на ${testHour}:${testMinute}`);
        await scheduleDailyNotification(TEST_ID, testHour, testMinute, false); // <--- Тест
        
        // --- Планувальний код ---
      await scheduleDailyNotification(NOTIFICATION_ID, 9, 0, true); 

      } else {
        setMorningNotifications(false);
      }
    } else {
      await cancelNotification(NOTIFICATION_ID);
      await cancelNotification(TEST_ID);
    }
  };
  
  const handleEveningToggle = async (value: boolean) => {
    setEveningNotifications(value);
    
    const NOTIFICATION_ID = 'evening';
    const TEST_ID = 'evening_test';
    
    if (value) {
      const permissionGranted = await registerForPushNotificationsAsync();
      if (permissionGranted) {

        // --- ТЕСТОВИЙ КОД ---
        const now = new Date();
        const testTime = new Date(now.getTime() + 60 * 1000); 
        const testHour = testTime.getHours();
        const testMinute = testTime.getMinutes();
        console.log(`ТЕСТОВЕ ОДНОРАЗОВЕ СПОВІЩЕННЯ буде о ${testHour}:${testMinute}`);
        await scheduleDailyNotification(TEST_ID, testHour, testMinute, false); 

        // --- Планувальний код ---
         await scheduleDailyNotification(NOTIFICATION_ID, 21, 0, true);
      } else {
        setEveningNotifications(false);
      }
    } else {
      await cancelNotification(NOTIFICATION_ID);
      await cancelNotification(TEST_ID);
    }
  };

  // Видалення акаунту 
  const handleDeleteAccount = async () => {
    Alert.alert(
      "Видалити акаунт?",
      "Ця дія НЕЗВОРОТНА. Всі ваші дані (профіль, записи, статистика) будуть повністю видалені. Ви впевнені?",
      [
        { text: "Скасувати", style: "cancel" },
        { 
          text: "Видалити", 
          style: "destructive", 
          onPress: async () => {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { setLoading(false); return; }
            const { error } = await supabase.functions.invoke('delete-user', {
              body: { user_id: user.id },
            });
            if (error) {
              Alert.alert('Помилка видалення', error.message);
              setLoading(false);
            } else {
              Alert.alert('Успіх', 'Ваш акаунт видалено.');
              router.replace('/');
            }
          }
        }
      ]
    );
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
              onValueChange={handleMorningToggle} 
              value={morningNotifications}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.switchRow}>
            <Text style={styles.label}>Вечірні (21:00)</Text>
            <Switch
              trackColor={{ false: COLORS.switchInactive, true: COLORS.switchActive }}
              thumbColor={COLORS.background}
              onValueChange={handleEveningToggle} 
              value={eveningNotifications}
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Акаунт</Text>
        <View style={styles.section}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.textPrimary} />
            <Text style={styles.logoutButtonText}>Вийти з акаунту</Text>
          </Pressable>
          
          <View style={styles.divider} />
          
          <Pressable style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={COLORS.error} />
            <Text style={styles.deleteButtonText}>Видалити акаунт</Text>
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
    backgroundColor: COLORS.sectionBackground,
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
    fontSize: 18, 
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textPrimary,
    padding: 5,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 15,
    paddingHorizontal: 15,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: 15,
  },
  button: {
    backgroundColor: COLORS.buttonBackground,
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: COLORS.buttonText,
    fontFamily: 'Nunito_600SemiBold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 5, 
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.inputBackground, 
    paddingVertical: 14,
    borderRadius: 15,
  },
  logoutButtonText: {
    fontSize: 16,
    color: COLORS.textPrimary, 
    fontFamily: 'Nunito_600SemiBold',
    marginLeft: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.errorBackground,
    paddingVertical: 14,
    borderRadius: 15,
  },
  deleteButtonText: {
    fontSize: 16,
    color: COLORS.error,
    fontFamily: 'Nunito_600SemiBold',
    marginLeft: 10,
  },
});