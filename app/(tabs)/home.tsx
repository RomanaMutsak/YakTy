import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { supabase } from '../../supabaseConfig';

const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
  adviceText: '#A1887F', 
  inputBackground: 'rgba(121, 85, 72, 0.08)', 
};

const adviceList = [
  "Пам'ятай дихати глибоко, коли відчуваєш напругу.",
  "Маленький крок уперед — це все одно крок. Будь добрим до себе.",
  "Дозволь собі відчувати те, що відчуваєш, без засудження.",
  "Зроби коротку перерву. Навіть 5 хвилин тиші можуть допомогти.",
  "Напиши три речі, за які ти вдячний сьогодні.",
  "Прогулянка на свіжому повітрі може змінити твій погляд на речі.",
  "Ти не один. Звернись по підтримку, якщо вона тобі потрібна.",
  "Дозволь собі відпочити. Твоє тіло та розум цього заслуговують.",
  "Святкуй свої маленькі перемоги.",
  "Твої почуття важливі. Не ігноруй їх.",
  "Сфотографуй яскраву подію.",
  "Прийми те, що поза твоїм контролем.",
  "Згадай, що ти любиш у собі.",
  "Приділи кілька хвилин, щоб послухати звуки навколо.",
  "Випий склянку води.",
  "Відпусти перфекціонізм.",
  "Скажи собі: «Я справляюся».",
  "Посміхнись собі у дзеркало — навіть маленька усмішка змінює настрій.",
  "Не бійся робити паузу. Тиша — теж дія.",
  "Згадай момент, коли ти почувався(лася) у безпеці. Побудь там подумки.",
  "Спробуй записати свої думки — вони легше відпускають, коли на папері.",
  "Знайди щось м’яке, тепле чи приємне на дотик і доторкнись до нього свідомо.",
  "Нагадуй собі: «Я роблю все можливе в цей момент».",
  "Вимкни телефон на 10 хвилин і просто побудь у тиші.",
  "Зроби глибокий вдих і повільний видих. Повтори тричі.",
  "Послухай музику, яка тебе заспокоює або надихає.",
  "Дозволь собі сказати «ні», якщо щось забирає твою енергію.",
  "Побудь на природі — навіть коротка прогулянка заспокоює серце.",
  "Не порівнюй себе з іншими. Твій шлях — унікальний.",
  "Напиши повідомлення людині, яку цінуєш. Навіть коротке «дякую» має силу.",
  "Зроби щось приємне без причини — просто тому, що можеш.",
  "Згадай, що все тимчасове — і хороше, і складне.",
  "Обійми себе або когось близького. Дотик лікує.",
  "Постав свічку чи ароматичну паличку — дозволь собі момент спокою.",
  "Відпусти очікування. Дозволь життю бути таким, яким воно є зараз.",
  "Поглянь на небо. Хмари теж проходять — як і важкі думки.",
  "Пам’ятай, що ти маєш право не знати відповіді зараз.",
  "Іноді просто бути — це вже достатньо.",
  "Не поспішай.",
  "Пробач собі за те, що не виходило раніше.",
  "Відчуй, як повітря входить і виходить із твого тіла.",
  "Знайди щось гарне навколо — навіть дрібниця може принести тепло.",
  "Поклади руку на серце й відчуй, як воно б’ється — це життя у тобі.",
  "Дозволь собі плакати, якщо хочеться. Сльози — це очищення.",
  "Пам’ятай: слабкість — не ворог, вона вчить тебе бути справжнім(ньою).",
  "Не все потрібно виправляти. Деколи достатньо прийняти.",
  "Зроби щось повільно — випий чай, пройдися, просто спостерігай.",
  "Напиши собі коротке послання підтримки. Прочитай його, коли стане важко.",
  "Подихай запахом кави, дощу чи улюбленого парфуму. Це заспокоює.",
  "Згадай людину, яка тебе любить, і пошли їй подумки тепло.",
  "Не намагайся бути ідеальним(ною). Достатньо бути живим(ою).",
  "Якщо щось болить — це теж частина росту. Дай собі час.",
  "Зроби щось творче — малюй, співай, пиши, навіть якщо не вмієш.",
  "Пам’ятай, що кожен день — новий шанс знайти рівновагу.",
  "Вдихни вдячність. Видихни напругу.",
  "Світ не вимагає, щоб ти був(ла) сильним(ною) завжди.",
];

export default function HomeScreen() {
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  const [currentAdvice, setCurrentAdvice] = useState<string>('');

  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const onPressIn = () => { scale.value = withTiming(0.95, { duration: 100 }); };
  const onPressOut = () => { scale.value = withTiming(1, { duration: 100 }); };

  const fetchUserData = useCallback(async () => {
    setLoading(true);
    setCurrentHour(new Date().getHours());

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Помилка отримання профілю:", error.message);
        setUsername('Друже');
      } else if (profile) {
        setUsername(profile.username);
      } else {
         setUsername('Друже');
      }
    } else {
      router.replace('/login');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * adviceList.length);
    setCurrentAdvice(adviceList[randomIndex]);
  }, []); 

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );


  const getGreeting = () => {
    if (currentHour < 12) return "Доброго ранку";
    if (currentHour < 18) return "Добрий день";
    return "Добрий вечір";
  };

  const getButtonText = () => {
    if (currentHour < 14) return "Додати ранковий запис";
    return "Додати вечірній запис";
  };

  if (loading && !username) { 
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={COLORS.textPrimary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>{getGreeting()},</Text>
        <Text style={styles.username}>{username || 'Друже'}!</Text>

        <View style={styles.adviceContainer}>
          <Text style={styles.adviceTitle}>Порада дня:</Text>
          <Text style={styles.adviceText}>{currentAdvice}</Text>
        </View>

        <Pressable
          onPress={() => router.push('/addEntry')}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          style={{ marginTop: 'auto', marginBottom: 20 }} 
        >
          <Animated.View style={[styles.button, animatedStyle]}>
            <Ionicons name="add-circle-outline" size={24} color={COLORS.buttonText} style={{ marginRight: 10 }} />
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          </Animated.View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30, 
    paddingTop: 50, 
    paddingBottom: 20, 
    alignItems: 'center',
  },
  greeting: {
    fontSize: 26, 
    fontFamily: 'Nunito_300Light',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  username: {
    fontSize: 32, 
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 40,
  },
  adviceContainer: {
    backgroundColor: COLORS.inputBackground, 
    borderRadius: 15,
    padding: 20,
    width: '100%', 
    marginTop: 20,
    alignItems: 'center', 
  },
  adviceTitle: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  adviceText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.adviceText, 
    textAlign: 'center',
    lineHeight: 22, 
  },
  button: {
    backgroundColor: COLORS.buttonBackground,
    width: 320,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
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
});