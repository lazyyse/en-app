import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Colors } from '../../utils/colors';

interface Props {
  current: number;
  total: number;
  onClose?: () => void;
}

export default function ProgressHeader({ current, total, onClose }: Props) {
  const progress = total > 0 ? current / total : 0;

  const handleClose = () => {
    if (!onClose) return;
    Alert.alert(
      '学習をやめますか？',
      'ここまでの進捗は保存されません。',
      [
        { text: 'つづける', style: 'cancel' },
        { text: 'やめる', style: 'destructive', onPress: onClose },
      ],
    );
  };

  return (
    <View style={styles.container}>
      {onClose && (
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      )}
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <Text style={styles.counter}>{current}/{total}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, color: Colors.text, fontWeight: 'bold' },
  barBg: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.border,
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  counter: { fontSize: 13, color: Colors.textLight, minWidth: 32, textAlign: 'right' },
});
