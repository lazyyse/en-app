import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Colors } from '../../utils/colors';
import Button from './Button';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function EndingModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.title}>全問正解達成！</Text>
          <Text style={styles.badge}>Lv.10 MAX</Text>
          <Text style={styles.body}>
            200問すべてを正解しました。{'\n'}
            TOEIC 600点レベル突破です！
          </Text>
          <View style={styles.divider} />
          <Text style={styles.sub}>引き続き学習を続けてさらに力を磨きましょう。</Text>
          <Button label="ありがとう！" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  trophy: { fontSize: 64 },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.text, textAlign: 'center' },
  badge: {
    backgroundColor: Colors.primary,
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: 'hidden',
  },
  body: { fontSize: 16, color: Colors.text, textAlign: 'center', lineHeight: 26 },
  divider: { width: '100%', height: 1, backgroundColor: '#eee' },
  sub: { fontSize: 13, color: Colors.textLight, textAlign: 'center', lineHeight: 20 },
});
