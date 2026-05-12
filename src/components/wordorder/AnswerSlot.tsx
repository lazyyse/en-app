import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../../utils/colors';

interface Props {
  placedWords: string[];
  onRemove: (index: number) => void;
  locked?: boolean;
}

export default function AnswerSlot({ placedWords, onRemove, locked = false }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {placedWords.length === 0 ? (
          <Text style={styles.placeholder}>ここに単語を並べてください</Text>
        ) : (
          placedWords.map((word, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => !locked && onRemove(i)}
              activeOpacity={locked ? 1 : 0.7}
              style={styles.chip}
            >
              <Text style={styles.word}>{word}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 56,
    borderBottomWidth: 2,
    borderColor: Colors.border,
    paddingVertical: 4,
    marginHorizontal: 16,
  },
  scroll: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4, paddingVertical: 4 },
  placeholder: { color: Colors.textLight, fontSize: 14, alignSelf: 'center' },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },
  word: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
