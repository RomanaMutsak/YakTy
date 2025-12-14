import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
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
  buttonBackground: '#8D6E63',
  buttonText: '#FDF8F0',
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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const AnimatedIconButton = ({ onPress, iconName, color }: {
  onPress: () => void;
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
}) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.8, { duration: 100 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.iconButton, animatedStyle]}
    >
      <Ionicons name={iconName} size={22} color={color} />
    </AnimatedPressable>
  );
};

const MAX_NOTE_LENGTH = 120; 

const EntryCard = ({ item, onDelete, onUpdateNote }: { 
  item: Entry, 
  onDelete: (id: string) => void,
  onUpdateNote: (id: string, newNote: string) => void,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedNote, setEditedNote] = useState(item.note);

  const date = new Date(item.created_at);
  const formattedDate = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
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

  const handleSaveEdit = () => {
    Keyboard.dismiss();
    if (editedNote.trim() === item.note) {
      setIsEditing(false);
      return;
    }
    onUpdateNote(item.id, editedNote.trim());
    setIsEditing(false);
  };
  const handleCancelEdit = () => {
    Keyboard.dismiss();
    setEditedNote(item.note);
    setIsEditing(false);
  };

  const renderNote = () => {
    if (isEditing) {
      return (
        <TextInput
          style={styles.noteInput}
          value={editedNote}
          onChangeText={setEditedNote}
          multiline
          autoFocus
        />
      );
    }
    
    const isLongText = item.note.length > MAX_NOTE_LENGTH;

    if (isLongText && !isExpanded) {
      return (
        <>
          <Text style={styles.cardNote}>
            {item.note.substring(0, MAX_NOTE_LENGTH)}...
          </Text>
          <Pressable onPress={() => setIsExpanded(true)}>
            <Text style={styles.moreButton}>Більше...</Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <Text style={styles.cardNote}>{item.note}</Text>
        {/* Кнопка "Згорнути" з'являється, лише якщо текст був довгий */}
        {isLongText && isExpanded && (
          <Pressable onPress={() => setIsExpanded(false)}>
            <Text style={styles.moreButton}>Згорнути</Text>
          </Pressable>
        )}
      </>
    );
  };

  const renderRatingsOrControls = () => {
    if (isEditing) {
      return (
        <View style={styles.editControls}>
          <Pressable style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelButtonText}>Скасувати</Text>
          </Pressable>
          <Pressable style={styles.saveButton} onPress={handleSaveEdit}>
            <Text style={styles.saveButtonText}>Зберегти</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View style={styles.ratingsContainer}>
        <View style={styles.ratingItem}><Text style={styles.ratingLabel}>Настрій</Text><StarRating rating={item.mood} size={20} /></View>
        <View style={styles.ratingItem}><Text style={styles.ratingLabel}>Енергія</Text><StarRating rating={item.energy} size={20} /></View>
        {isMorning && item.sleep_quality != null && (<View style={styles.ratingItem}><Text style={styles.ratingLabel}>Якість сну</Text><StarRating rating={item.sleep_quality} size={20} /></View>)}
        {!isMorning && item.anxiety != null && (<View style={styles.ratingItem}><Text style={styles.ratingLabel}>Тривожність</Text><StarRating rating={item.anxiety} size={20} /></View>)}
        {!isMorning && item.gratitude != null && (<View style={styles.ratingItem}><Text style={styles.ratingLabel}>Вдячність</Text><StarRating rating={item.gratitude} size={20} /></View>)}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.cardDate}>{formattedDate}</Text>
          <Text style={styles.cardTime}>{formattedTime} ({isMorning ? 'Ранок' : 'Вечір'})</Text>
        </View>
        <View style={styles.iconContainer}>
          {!isEditing && (
            <>
              <AnimatedIconButton
                onPress={() => setIsEditing(true)}
                iconName="pencil-outline"
                color={COLORS.textSecondary}
              />
              <AnimatedIconButton
                onPress={confirmDelete}
                iconName="trash-outline"
                color={COLORS.textSecondary}
              />
            </>
          )}
        </View>
      </View>

      {renderNote()}
      <View style={styles.divider} />
      {renderRatingsOrControls()}
    </View>
  );
};


export default function EntriesScreen() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.replace('/login'); return; }
    const { data, error } = await supabase
      .from('daily_entries')
      .select('*') 
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }); 
    if (error) { Alert.alert('Помилка завантаження', error.message);
    } else { setEntries(data as Entry[]); }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [fetchEntries]) 
  );
  
  const handleDeleteEntry = async (id: string) => {
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== id));
    const { error } = await supabase.from('daily_entries').delete().eq('id', id);
    if (error) { Alert.alert('Помилка видалення', error.message); fetchEntries(); }
  };

  const handleUpdateNote = async (id: string, newNote: string) => {
    setEntries(prevEntries => 
      prevEntries.map(entry => 
        entry.id === id ? { ...entry, note: newNote } : entry
      )
    );
    const { error } = await supabase
      .from('daily_entries')
      .update({ note: newNote })
      .eq('id', id);
    if (error) {
      Alert.alert('Помилка оновлення', error.message);
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
        renderItem={({ item }) => (
          <EntryCard 
            item={item} 
            onDelete={handleDeleteEntry} 
            onUpdateNote={handleUpdateNote} 
          />
        )}
        contentContainerStyle={styles.listContainer}
        keyboardShouldPersistTaps="handled"
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexGrow: 1,
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
  iconContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    padding: 5,
    marginLeft: 10,
  },
  cardNote: {
    fontSize: 16,
    fontFamily: 'Nunito_400Regular',
    color: COLORS.textPrimary,
    lineHeight: 22,
    paddingVertical: 5,
  },
  moreButton: {
    fontSize: 14,
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.accent,
    marginTop: 5,
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
  noteInput: {
    minHeight: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 10,
    padding: 10,
    fontFamily: 'Nunito_400Regular',
    fontSize: 16,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: 'rgba(121, 85, 72, 0.2)',
    textAlignVertical: 'top',
  },
  editControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  cancelButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: COLORS.buttonBackground,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginLeft: 10,
  },
  saveButtonText: {
    fontFamily: 'Nunito_600SemiBold',
    color: COLORS.buttonText,
    fontSize: 16,
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