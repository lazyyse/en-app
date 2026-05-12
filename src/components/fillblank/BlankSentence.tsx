import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

interface Props {
  sentence: string;
  filledWord?: string;
}

export default function BlankSentence({ sentence, filledWord }: Props) {
  const parts = sentence.split('___');

  return (
    <View style={styles.container}>
      <Text style={styles.sentence}>
        {parts[0]}
        <Text style={styles.blank}>
          {filledWord ? ` ${filledWord} ` : '  ______  '}
        </Text>
        {parts[1] ?? ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, paddingVertical: 16 },
  sentence: { fontSize: 20, lineHeight: 32, color: Colors.text, textAlign: 'center' },
  blank: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
});
