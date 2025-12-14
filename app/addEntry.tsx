import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
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
import StarRating from '../components/StarRating';
import { supabase } from '../supabaseConfig';

// ... (Палітра COLORS, formatDateTime, questionPools, getRandomQuestion... все без змін)
const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  inputBackground: 'rgba(121, 85, 72, 0.08)',
  inputFocusedBorder: '#A1887F',
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
  starFilled: '#795548',
  starEmpty: 'rgba(121, 85, 72, 0.2)',
};
const formatDateTime = (date: Date) => {
  const optionsDate: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  const optionsTime: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
  return `${date.toLocaleDateString('uk-UA', optionsDate)}, ${date.toLocaleTimeString('uk-UA', optionsTime)}`;
};
const questionPools = {
  mood: [ "Наскільки спокійно ти почуваєшся всередині?", "Який твій загальний емоційний фон сьогодні?", "Наскільки гармонійно ти себе відчуваєш?", "Наскільки легко тобі сьогодні було відпускати контроль?", "Як би ти оцінив(ла) свій настрій?", ],
  energy: [ "Наскільки сповненим(ою) сил ти себе відчуваєш?", "Як би ти оцінив(ла) свій рівень енергії?", "Чи відчуваєш ти втому чи бадьорість?", "Чи відчував(ла) ти сьогодні контакт зі своїми емоціями?", "Чи вдавалося тобі помічати дрібниці, які приносять радість?", ],
  sleepQuality: [ "Наскільки добре ти спав(ла)?", "Наскільки легко тобі було заснути сьогодні вночі?", "Наскільки твій розум був спокійним перед сном?", "Як би ти оцінив(ла) якість свого сну?", "Наскільки глибоким і спокійним був твій сон?", ],
  anxiety: [ "Наскільки сильною була тривога чи неспокій?", "Чи вдалося тобі зберегти спокій протягом дня?", "Як би ти оцінив(ла) свій рівень стресу?", "Чи відчуваєш ти довіру до життя зараз?", "Чи зміг(ла) ти знайти хоча б короткий момент повного спокою?", ],
  gratitude: [ "Наскільки легко тобі згадати моменти вдячності за день?", "Чи відчуваєш ти вдячність за сьогоднішній день?", "Чи були сьогодні моменти, які змусили тебе посміхнутися?", "Наскільки ти приймаєш себе таким(ою), яким(ою) є?", "Чи можеш ти бути добрим(ою) до себе, навіть коли щось не виходить?", ],
};
const getRandomQuestion = (metric: keyof typeof questionPools) => {
  const pool = questionPools[metric];
  return pool[Math.floor(Math.random() * pool.length)];
};
// ... (Кінець блоку без змін)


export default function AddEntryScreen() {
  // ... (всі useState, анімації та useFocusEffect - без змін)
  const [entryText, setEntryText] = useState('');
  const [isTextSaved, setIsTextSaved] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [mood, setMood] = useState(0);
  const [anxiety, setAnxiety] = useState(0);
  const [energy, setEnergy] = useState(0);
  const [sleepQuality, setSleepQuality] = useState(0);
  const [gratitude, setGratitude] = useState(0);
  const [moodQuestion, setMoodQuestion] = useState('');
  const [energyQuestion, setEnergyQuestion] = useState('');
  const [sleepQuestion, setSleepQuestion] = useState('');
  const [anxietyQuestion, setAnxietyQuestion] = useState('');
  const [gratitudeQuestion, setGratitudeQuestion] = useState('');
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => { scale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 100 }); };

  useFocusEffect(
    useCallback(() => {
      const now = new Date();
      setCurrentDateTime(now);
      setMoodQuestion(getRandomQuestion('mood'));
      setEnergyQuestion(getRandomQuestion('energy'));
      const morning = now.getHours() < 14;
      if (morning) {
        setSleepQuestion(getRandomQuestion('sleepQuality'));
      } else {
        setAnxietyQuestion(getRandomQuestion('anxiety'));
        setGratitudeQuestion(getRandomQuestion('gratitude'));
      }
      setEntryText('');
      setIsTextSaved(false);
      setMood(0);
      setAnxiety(0);
      setEnergy(0);
      setSleepQuality(0);
      setGratitude(0);
    }, [])
  );
  // ... (Кінець блоку без змін)

  const isMorning = currentDateTime.getHours() < 14;

  // ... (handleSaveText та handleSaveEntry - без змін)
  const handleSaveText = () => {
    if (!entryText.trim()) {
      Alert.alert('Порожній запис', 'Будь ласка, напиши щось про свій день.');
      return;
    }
    Keyboard.dismiss();
    setIsTextSaved(true);
  };

  const handleSaveEntry = async () => {
    const ratingsToCheck = [mood, energy];
    if (isMorning) ratingsToCheck.push(sleepQuality);
    else ratingsToCheck.push(anxiety, gratitude);

    if (ratingsToCheck.some(rating => rating === 0)) {
       Alert.alert('Не всі оцінки', 'Будь ласка, оціни свій стан за всіма критеріями.');
       return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      Alert.alert('Помилка', 'Не вдалося визначити користувача.');
      router.replace('/login');
      return;
    }
    console.log('Attempting to save with user_id:', user.id);
    const entryData = {
      user_id: user.id,
      created_at: currentDateTime.toISOString(),
      entry_type: isMorning ? 'morning' : 'evening',
      note: entryText,
      mood: mood,
      anxiety: isMorning ? null : anxiety,
      energy: energy,
      sleep_quality: isMorning ? sleepQuality : null,
      gratitude: isMorning ? null : gratitude,
    };
    console.log("Saving entry:", entryData);
    const { error } = await supabase
      .from('daily_entries')
      .insert([entryData]);
    if (error) {
      Alert.alert('Помилка збереження', error.message);
    } else {
      Alert.alert('Успіх!', 'Запис збережено.');
      router.back();
    }
  };


  return (
    // 1. Прибираємо 'View' та 'styles.container' звідси
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView} // <--- 'keyboardView' тепер головний
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {/* 2. Обгортаємо ScrollView у View style={{ flex: 1 }} */}
        {/* Це дозволить ScrollView коректно стискатися */}
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.dateTimeText}>{formatDateTime(currentDateTime)}</Text>

            {!isTextSaved && (
              <>
                <Text style={styles.promptText}>Як ти сьогодні?</Text>
                <TextInput
                  style={styles.textInput}
                  multiline
                  placeholder="Напиши свої думки тут..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={entryText}
                  onChangeText={setEntryText}
                  // 3. (Опціонально) Додаємо це, щоб при фокусі поле було видно
                  // onFocus={(e) => {
                  //   // @ts-ignore
                  //   e.target.scrollIntoView({ behavior: 'smooth' });
                  // }}
                />
                <Pressable
                  onPress={handleSaveText}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  style={{ marginTop: 20 }}
                >
                  <Animated.View style={[styles.button, animatedStyle]}>
                    <Text style={styles.buttonText}>Далі</Text>
                  </Animated.View>
                </Pressable>
              </>
            )}

            {isTextSaved && (
              <View style={styles.slidersContainer}>
                <Text style={styles.promptText}>Оціни свій стан:</Text>

                <Text style={styles.sliderLabel}>{moodQuestion}</Text>
                <StarRating rating={mood} onRate={setMood} />

                <Text style={styles.sliderLabel}>{energyQuestion}</Text>
                <StarRating rating={energy} onRate={setEnergy} />

                {isMorning && (
                  <>
                    <Text style={styles.sliderLabel}>{sleepQuestion}</Text>
                    <StarRating rating={sleepQuality} onRate={setSleepQuality} />
                  </>
                )}

                {!isMorning && (
                  <>
                    <Text style={styles.sliderLabel}>{anxietyQuestion}</Text>
                    <StarRating rating={anxiety} onRate={setAnxiety} />

                    <Text style={styles.sliderLabel}>{gratitudeQuestion}</Text>
                    <StarRating rating={gratitude} onRate={setGratitude} />
                  </>
                )}

                <Pressable
                  onPress={handleSaveEntry}
                  onPressIn={onPressIn}
                  onPressOut={onPressOut}
                  style={{ marginTop: 15 }}
                >
                  <Animated.View style={[styles.button, animatedStyle]}>
                    <Text style={styles.buttonText}>Зберегти запис</Text>
                  </Animated.View>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: COLORS.background, 
  },
  scrollView: {
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  dateTimeText: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 25,
  },
  promptText: {
    fontSize: 25,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    minHeight: 150,
    maxHeight: 250, 
    backgroundColor: COLORS.inputBackground,
    borderRadius: 15,
    padding: 15,
    paddingTop: 15,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  slidersContainer: {
    width: '100%',
    marginTop: 20,
    alignItems: 'center', 
  },
  sliderLabel: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textPrimary,
    marginTop: 10,
    marginBottom: 10,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.buttonBackground,
    width: 300,
    paddingVertical: 14,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.84,
    elevation: 3,
  },
  buttonText: {
    fontSize: 18,
    color: COLORS.buttonText,
    fontFamily: 'Nunito_600SemiBold',
    textAlign: 'center',
  },
});