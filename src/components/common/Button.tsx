import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../utils/colors';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'disabled';
  style?: ViewStyle;
}

export default function Button({ label, onPress, variant = 'primary', style }: Props) {
  const isDisabled = variant === 'disabled';
  return (
    <TouchableOpacity
      onPress={isDisabled ? undefined : onPress}
      activeOpacity={isDisabled ? 1 : 0.8}
      style={[styles.base, styles[variant], style]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary, isDisabled && styles.labelDisabled]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: Colors.primary },
  secondary: { backgroundColor: Colors.white, borderWidth: 2, borderColor: Colors.primary },
  disabled: { backgroundColor: Colors.border },
  label: { fontSize: 17, fontWeight: 'bold', color: Colors.white },
  labelSecondary: { color: Colors.primary },
  labelDisabled: { color: Colors.textLight },
});
