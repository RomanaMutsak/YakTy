import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

const COLORS = {
  starFilled: '#795548',
  starEmpty: 'rgba(121, 85, 72, 0.2)',
};

interface StarRatingProps {
  rating: number; 
  onRate?: (rating: number) => void; 
  size?: number; 
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, size = 36 }) => {
  const handleRate = (starIndex: number) => {
    if (!onRate) return; 

    const halfStar = starIndex - 0.5;
    const fullStar = starIndex;

    if (rating === halfStar) {
      onRate(fullStar);
    } else if (rating === fullStar) {
      onRate(halfStar);
    } else {
      onRate(halfStar);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((starIndex) => {
        let iconName: 'star' | 'star-half' | 'star-outline' = 'star-outline';
        
        if (rating >= starIndex) {
          iconName = 'star'; // Повна зірка
        } else if (rating >= starIndex - 0.5) {
          iconName = 'star-half'; // Половинка
        }

        return (
          <Pressable 
            key={starIndex} 
            onPress={() => handleRate(starIndex)} 
            disabled={!onRate} 
          >
            <Ionicons
              name={iconName}
              size={size}
              color={rating >= starIndex - 0.5 ? COLORS.starFilled : COLORS.starEmpty}
              style={styles.star}
            />
          </Pressable>
        );
      })}
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