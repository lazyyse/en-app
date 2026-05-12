import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

type State = 'idle' | 'correct' | 'wrong' | 'disabled';

interface Props {
  word: string;
  state: State;
  onPress?: () => void;
}

export default function ChoiceButton({ word, state, onPress }: Props) {
  const tappable = state === 'idle' || (state === 'correct' && !!onPress);
  return (
    <TouchableOpacity
      onPress={tappable ? onPress : undefined}
      activeOpacity={tappable ? 0.75 : 1}
      style={[styles.base, styles[state]]}
    >
      <Text style={[styles.label, (state === 'correct' || state === 'wrong') && styles.labelLight]}>
        {state === 'correct' ? '✓ ' : state === 'wrong' ? '✗ ' : ''}
        {word}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 2,
    marginVertical: 6,
    alignItems: 'center',
  },
  idle: { backgroundColor: Colors.white, borderColor: Colors.border },
  correct: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  wrong: { backgroundColor: Colors.danger, borderColor: Colors.danger },
  disabled: { backgroundColor: Colors.surface, borderColor: Colors.border },
  label: { fontSize: 17, fontWeight: '600', color: Colors.text },
  labelLight: { color: Colors.white },
});
