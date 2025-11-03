import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
// Завантажувач шрифтів та самі шрифти
import { Nunito_300Light, Nunito_400Regular, Nunito_600SemiBold, useFonts } from '@expo-google-fonts/nunito';

// Ця команда не дає сплеш-скріну зникнути автоматично
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
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Реєстрація' }} />
      <Stack.Screen name="login" options={{ title: 'Вхід' }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} /> 
      <Stack.Screen name="addEntry" options={{ title: 'Новий Запис' }} />
    </Stack>
  );
}