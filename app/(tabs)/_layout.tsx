import { Ionicons } from '@expo/vector-icons'; // Імпортуємо іконки
import { Tabs } from 'expo-router';
import React from 'react';

// Наша палітра "Затишний Щоденник"
const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  accent: '#A1887F', // Колір активної вкладки
  inactive: 'rgba(121, 85, 72, 0.4)', // Колір неактивної вкладки
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.accent, // Колір активної іконки/тексту
        tabBarInactiveTintColor: COLORS.inactive, // Колір неактивної
        tabBarStyle: {
          backgroundColor: COLORS.background, // Фон таб-бару
          borderTopColor: 'rgba(121, 85, 72, 0.1)', // Ледь помітна лінія зверху
        },
        headerStyle: {
          backgroundColor: COLORS.background, // Фон заголовка
        },
        headerTintColor: COLORS.textPrimary, // Колір тексту заголовка
        headerTitleStyle: {
          fontFamily: 'Nunito_600SemiBold', // Наш шрифт
        },
      }}
    >
      {/* 1. Головна вкладка */}
      <Tabs.Screen
        name="home" // <-- Посилається на app/(tabs)/home.tsx
        options={{
          title: 'Головна', // Назва вкладки
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: false, // Сховаємо стандартний заголовок, зробимо свій
        }}
      />
      {/* 2. Вкладка "Мої Записи" (Щоденник) */}
      <Tabs.Screen
        name="entries" // <-- Посилається на app/(tabs)/entries.tsx (створимо заглушку)
        options={{
          title: 'Мої Записи',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
          // Тут можна залишити стандартний заголовок
        }}
      />
      {/* 3. Вкладка "Статистика" */}
      <Tabs.Screen
        name="statistics" // <-- Посилається на app/(tabs)/statistics.tsx (створимо заглушку)
        options={{
          title: 'Статистика',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      {/* 4. Вкладка "Налаштування" */}
      <Tabs.Screen
        name="settings" // <-- Посилається на app/(tabs)/settings.tsx (створимо заглушку)
        options={{
          title: 'Налаштування',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}