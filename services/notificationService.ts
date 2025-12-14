import * as Notifications from 'expo-notifications';
import { Alert, Platform } from 'react-native';

Notifications.setNotificationHandler({
  // @ts-ignore 
  handleNotification: async () => ({
    shouldPlaySound: false, 
    shouldSetBadge: false, 
    // @ts-ignore 
    shouldShowAlert: Platform.select({ 
      ios: true, 
      android: true, 
    }), 
  }),
});

// Функція запиту дозволів 
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    Alert.alert('Помилка', 'Не вдалося отримати дозвіл на сповіщення!');
    return false;
  }
  return true;
}

// Функція ПЛАНУВАННЯ
export async function scheduleDailyNotification(
  id: string, 
  hour: number, 
  minute: number,
  repeats: boolean = true 
) {
  
  await Notifications.cancelScheduledNotificationAsync(id);

  // @ts-ignore 
  const trigger: Notifications.CalendarTriggerInput = {
    hour: hour,
    minute: minute,
    repeats: repeats,
  };
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title: repeats ? "Як ти? ☕️" : "Як ти? ☕️ (Тест)",
      body: 'Час для короткої рефлексії. Зайди у щоденник.',
      data: { screen: 'addEntry' },
      sound: true, 
    },
    trigger,
    identifier: id,
  });

  if (repeats) {
    console.log(`Сповіщення "${id}" заплановано на ${hour}:${minute} щодня.`);
  } else {
    console.log(`!!! ТЕСТОВЕ ОДНОРАЗОВЕ сповіщення "${id}" заплановано на ${hour}:${minute}.`);
  }
}

// Функція СКАСУВАННЯ 
export async function cancelNotification(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
  console.log(`Сповіщення "${id}" скасовано.`);
}