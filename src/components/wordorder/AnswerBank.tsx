import React from 'react';
import { View, StyleSheet } from 'react-native';
import WordChip from './WordChip';

interface Props {
  words: string[];
  selectedIndices: number[];
  onSelect: (index: number) => void;
}

export default function AnswerBank({ words, selectedIndices, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {words.map((word, i) => (
        <WordChip
          key={i}
          word={word}
          isSelected={selectedIndices.includes(i)}
          onPress={() => onSelect(i)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 16,
    gap: 4,
  },
});
