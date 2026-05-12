import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

interface Props {
  word: string;
  isSelected: boolean;
  onPress: () => void;
}

export default function WordChip({ word, isSelected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={isSelected ? undefined : onPress}
      activeOpacity={isSelected ? 1 : 0.7}
      style={[styles.chip, isSelected && styles.selected]}
    >
      <Text style={[styles.text, isSelected && styles.textSelected]}>{word}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    margin: 4,
  },
  selected: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
  },
  text: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  textSelected: { color: Colors.textLight },
});
