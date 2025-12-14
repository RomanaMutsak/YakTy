import { Nunito_300Light, Nunito_400Regular, Nunito_600SemiBold, useFonts } from '@expo-google-fonts/nunito';
import { SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.background, 
          },
          headerTintColor: COLORS.textPrimary, 
          headerTitleStyle: {
            fontFamily: 'Nunito_600SemiBold', 
          },
          headerShadowVisible: false, 
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: 'вітання'  }} />
        <Stack.Screen name="register" options={{ title: 'Реєстрація' }} />
        <Stack.Screen name="login" options={{ title: 'Вхід' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'головна'  }} />
        <Stack.Screen name="addEntry" options={{ title: 'Новий Запис' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}