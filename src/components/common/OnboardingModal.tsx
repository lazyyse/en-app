import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../utils/colors';

interface Props {
  visible: boolean;
  onDone: () => void;
}

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: '🎯',
    title: 'OneTap English へようこそ！',
    body: 'TOEIC 600点を目指す英語学習アプリ。\nタップするだけで手軽に学習できます。',
  },
  {
    icon: '📚',
    title: '3つのカテゴリで学習',
    body: '単語・会話・文法の3カテゴリ、\n計200問でTOEIC力を総合的に鍛えます。',
  },
  {
    icon: '⭐',
    title: 'スキルptを貯めてレベルアップ',
    body: '問題を正解するたびにスキルptを獲得。\nレベルが上がるほど実力の証明になります。',
  },
  {
    icon: '🚀',
    title: '今日だけがんばろう！',
    body: '1日3問でも続けることが大切。\n毎日少しずつ積み上げていきましょう。',
  },
];

export default function OnboardingModal({ visible, onDone }: Props) {
  const [page, setPage] = useState(0);
  const isLast = page === SLIDES.length - 1;
  const slide = SLIDES[page];

  const handleNext = () => {
    if (isLast) { onDone(); }
    else { setPage((p) => p + 1); }
  };

  return (
    <Modal visible={visible} animationType="fade">
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.skip} onPress={onDone}>
          <Text style={styles.skipText}>スキップ</Text>
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.icon}>{slide.icon}</Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.body}>{slide.body}</Text>
        </View>

        {/* ドットインジケーター */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextText}>{isLast ? 'はじめる！' : '次へ'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 28 },
  skip: { alignSelf: 'flex-end', paddingTop: 8, paddingBottom: 16 },
  skipText: { fontSize: 14, color: Colors.textLight },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20 },
  icon: { fontSize: 72 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.text, textAlign: 'center', lineHeight: 34 },
  body: { fontSize: 16, color: Colors.textLight, textAlign: 'center', lineHeight: 26 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.border },
  dotActive: { backgroundColor: Colors.primary, width: 24 },
  nextBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  nextText: { fontSize: 17, fontWeight: 'bold', color: Colors.white },
});
