import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const COLORS = {
  starFilled: '#795548', 
  starEmpty: 'rgba(121, 85, 72, 0.2)',
};

interface StarRatingProps {
  rating: number; // Поточна оцінка (1-5)
  onRate: (rating: number) => void; // Функція для оновлення оцінки
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate }) => {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => onRate(star)}>
          <Ionicons
            name={star <= rating ? 'star' : 'star-outline'} // Заповнена або порожня
            size={36}
            color={star <= rating ? COLORS.starFilled : COLORS.starEmpty}
            style={styles.star}
          />
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 20, 
  },
  star: {
    marginHorizontal: 5, 
  },
});

export default StarRating;