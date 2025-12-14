import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

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
          backgroundColor: COLORS.background, 
          borderTopColor: 'rgba(121, 85, 72, 0.1)', 
        },
        headerStyle: {
          backgroundColor: COLORS.background, 
        },
        headerTintColor: COLORS.textPrimary, 
        headerTitleStyle: {
          fontFamily: 'Nunito_600SemiBold', 
        },
      }}
    >
      {/* 1. Головна вкладка */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Головна', 
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
          headerShown: false, 
        }}
      />
      {/* 2. Вкладка "Мої Записи" (Щоденник) */}
      <Tabs.Screen
        name="entries" 
        options={{
          title: 'Мої Записи',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      {/* 3. Вкладка "Статистика" */}
      <Tabs.Screen
        name="statistics" 
        options={{
          title: 'Статистика',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          ),
        }}
      />
      {/* 4. Вкладка "Чат" */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Помічник',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
          headerTitle: 'Твій помічник', 
        }}
        />
      {/* 5. Вкладка "Налаштування" */}
      <Tabs.Screen
        name="settings" 
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