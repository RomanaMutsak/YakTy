import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Свої URL та ключ
const supabaseUrl = "https://gsxepkgyjtuovivveazq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdzeGVwa2d5anR1b3ZpdnZlYXpxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNzIxNDAsImV4cCI6MjA3NjY0ODE0MH0.858mANF9YQf0nsOitMLEiLmCbyn-k8D7Xed40HeZOnQ";

// Створення клієнта
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Кажемо Supabase використовувати AsyncStorage для збереження сесії
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});