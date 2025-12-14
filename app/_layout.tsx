import { Nunito_300Light, Nunito_400Regular, Nunito_600SemiBold, useFonts } from '@expo-google-fonts/nunito';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // (Якщо ти її повернув, залиш)

// 1. Визначимо твої кольори (щоб не дублювати)
const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_300Light,
    Nunito_400Regular,
    Nunito_600SemiBold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 2. Додаємо 'screenOptions' до Stack */}
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background, // Колір фону заголовка
          },
          headerTintColor: COLORS.textPrimary, // Колір тексту та стрілки "Назад"
          headerTitleStyle: {
            fontFamily: 'Nunito_600SemiBold', // Шрифт заголовка
          },
          headerShadowVisible: false, // Прибираємо тінь/лінію під заголовком
        }}
      >
        {/* Всі ці екрани тепер автоматично отримають новий стиль */}
        <Stack.Screen name="index" options={{ headerShown: false, title: 'вітання'  }} />
        <Stack.Screen name="register" options={{ title: 'Реєстрація' }} />
        <Stack.Screen name="login" options={{ title: 'Вхід' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'головна'  }} />
        <Stack.Screen name="addEntry" options={{ title: 'Новий Запис' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}