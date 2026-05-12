import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../utils/colors';

interface Props {
  level: number;
  current: number;
  needed: number;
}

export default function XPBar({ level, current, needed }: Props) {
  const progress = needed > 0 ? Math.min(current / needed, 1) : 1;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.levelText}>Lv.{level}</Text>
        <Text style={styles.xpText}>{current} / {needed} スキルpt</Text>
      </View>
      <View style={styles.barBg}>
        <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  levelText: { fontSize: 14, fontWeight: 'bold', color: Colors.accent },
  xpText: { fontSize: 12, color: Colors.textLight },
  barBg: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 5,
  },
});
