import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StarRating from '../../components/StarRating';
import { supabase } from '../../supabaseConfig';

const COLORS = {
  background: '#FDF8F0',
  textPrimary: '#795548',
  textSecondary: 'rgba(121, 85, 72, 0.6)',
  inputBackground: 'rgba(121, 85, 72, 0.08)',
  accent: '#A1887F',
  error: '#D32F2F',
};

interface Entry {
  id: string;
  created_at: string;
  entry_type: 'morning' | 'evening';
  note: string;
  mood: number;
  energy: number;
  sleep_quality?: number | null;
  anxiety?: number | null;
  gratitude?: number | null;
}

const EntryCard = ({ item, onDelete }: { item: Entry, onDelete: (id: string) => void }) => {
  const date = new Date(item.created_at);
  const formattedDate = date.toLocaleDateString('uk-UA', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('uk-UA', {
    hour: '2-digit', minute: '2-digit'
  });
  const isMorning = item.entry_type === 'morning';

  const confirmDelete = () => {
    Alert.alert(
      "Видалити запис?",
      "Цю дію неможливо буде скасувати.",
      [
        { text: "Скасувати", style: "cancel" },
        { text: "Видалити", style: "destructive", onPress: () => onDelete(item.id) }
      ]
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardDate}>{formattedDate}</Text>
          <Text style={styles.cardTime}>{formattedTime} ({isMorning ? 'Ранок' : 'Вечір'})</Text>
        </View>
        <Pressable onPress={confirmDelete} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={22} color={COLORS.textSecondary} />
        </Pressable>
      </View>

      <Text style={styles.cardNote}>{item.note}</Text>

      <View style={styles.divider} />

      <View style={styles.ratingsContainer}>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Настрій</Text>
          <StarRating rating={item.mood} size={20} />
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Енергія</Text>
          <StarRating rating={item.energy} size={20} />
        </View>
        
        {isMorning && item.sleep_quality != null && (
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Якість сну</Text>
            <StarRating rating={item.sleep_quality} size={20} />
          </View>
        )}
        {!isMorning && item.anxiety != null && (
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Тривожність</Text>
            <StarRating rating={item.anxiety} size={20} />
          </View>
        )}
        {!isMorning && item.gratitude != null && (
          <View style={styles.ratingItem}>
            <Text style={styles.ratingLabel}>Вдячність</Text>
            <StarRating rating={item.gratitude} size={20} />
          </View>
        )}
      </View>
    </View>
  );
};


export default function EntriesScreen() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.replace('/login');
      return;
    }

    const { data, error } = await supabase
      .from('daily_entries')
      .select('*') 
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }); 

    if (error) {
      Alert.alert('Помилка завантаження', error.message);
    } else {
      setEntries(data as Entry[]);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries]) 
  );
  
  const handleDeleteEntry = async (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    
    const { error } = await supabase
      .from('daily_entries')
      .delete()
      .eq('id', id);
      
    if (error) {
      Alert.alert('Помилка видалення', error.message);
      fetchEntries();
    }
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
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EntryCard item={item} onDelete={handleDeleteEntry} />}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.placeholderContainer}>
            <Ionicons name="book-outline" size={60} color={COLORS.textSecondary} />
            <Text style={styles.placeholderText}>Тут ще немає записів</Text>
            <Text style={styles.placeholderSubText}>
              Почни вести щоденник, і твої записи з'являться тут.
            </Text>
          </View>
        }
      />
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
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: '100%', 
  },
  card: {
    backgroundColor: 'rgba(121, 85, 72, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.84,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(121, 85, 72, 0.1)',
    paddingBottom: 10,
    marginBottom: 10,
  },
  cardDate: {
    fontSize: 16,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textPrimary,
  },
  cardTime: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
  },
  deleteButton: {
    padding: 5,
  },
  cardNote: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textPrimary,
    lineHeight: 22,
    paddingVertical: 5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(121, 85, 72, 0.1)',
    marginVertical: 10,
  },
  ratingsContainer: {
    paddingTop: 5,
  },
  ratingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  ratingLabel: {
    fontSize: 14,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
  },
  placeholderContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 100, 
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 20,
  },
  placeholderSubText: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});