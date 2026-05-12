import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { InterstitialAd, AdEventType, IS_EXPO_GO } from '../utils/adModules';

import { RootStackParamList, Category, ConversationMode } from '../types';
import { useProgress } from '../hooks/useProgress';
import { Colors } from '../utils/colors';
import Button from '../components/common/Button';
import EndingModal from '../components/common/EndingModal';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_TOTAL_QUESTIONS, CATEGORY_ID_PREFIX } from '../data';
import { INTERSTITIAL_AD_UNIT_ID } from '../utils/ads';
import { MAX_LEVEL } from '../utils/xpCalculator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Result'>;
type Route = RouteProp<RootStackParamList, 'Result'>;

interface Props { navigation: Nav; route: Route }

const CONV_MODE_KEY = '@en_app:conversation_mode';
const REVIEW_KEY = '@en_app:review_requested';

const interstitial = IS_EXPO_GO
  ? null
  : InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

export default function ResultScreen({ navigation, route }: Props) {
  const { answers, category } = route.params;
  const { progress, saveSession } = useProgress();
  const [leveledUp, setLeveledUp] = useState(false);
  const [showEnding, setShowEnding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [convMode, setConvMode] = useState<ConversationMode>('audio');
  const adLoaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(CONV_MODE_KEY).then((v) => {
      if (v === 'audio' || v === 'silent') setConvMode(v);
    });
    if (!interstitial) return;
    const unsubLoad = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      adLoaded.current = true;
    });
    interstitial.load();
    return () => { unsubLoad(); };
  }, []);

  const correct = answers.filter((a) => a.isCorrect).length;
  const total = answers.length;
  const xpEarned = answers.reduce((s, a) => s + a.xpEarned, 0);
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  useEffect(() => {
    if (saved) return;
    setSaved(true);
    saveSession(answers, category).then(async ({ leveledUp: lu, newLevel }) => {
      if (newLevel >= MAX_LEVEL) {
        setShowEnding(true); // 全問正解エンディング
      } else {
        setLeveledUp(lu);   // 通常レベルアップモーダル
      }
      // 5セッション達成後にレビュー誘導（1回のみ）
      if (progress && progress.history.length + 1 >= 5) {
        const alreadyRequested = await AsyncStorage.getItem(REVIEW_KEY);
        if (!alreadyRequested) {
          await AsyncStorage.setItem(REVIEW_KEY, 'true');
          const available = await StoreReview.isAvailableAsync();
          if (available) {
            setTimeout(() => StoreReview.requestReview(), 2000);
          }
        }
      }
    });
  }, []);

  const prefix = CATEGORY_ID_PREFIX[category];
  const correctForCategory = progress?.correctlyCompletedQuestionIds.filter((id) => id.startsWith(prefix)).length ?? 0;
  const totalForCategory = CATEGORY_TOTAL_QUESTIONS[category];

  const handleGoHome = () => {
    if (adLoaded.current && interstitial) {
      interstitial.show();
      adLoaded.current = false;
    }
    navigation.popToTop();
  };

  const handleNextSet = () => {
    if (category === 'conversation') {
      navigation.replace('Conversation', { mode: convMode });
    } else {
      navigation.replace('FillBlank', { category: category as 'vocabulary' | 'grammar' });
    }
  };

  const progressPct = totalForCategory > 0 ? correctForCategory / totalForCategory : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>セッション完了！</Text>
        <Text style={styles.category}>{CATEGORY_LABELS[category]}</Text>

        <View style={styles.circle}>
          <Text style={styles.pct}>{pct}%</Text>
          <Text style={styles.pctLabel}>正解率</Text>
        </View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{correct}/{total}</Text>
            <Text style={styles.statLabel}>正解数</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.accent }]}>+{xpEarned} スキルpt</Text>
            <Text style={styles.statLabel}>獲得スキルpt</Text>
          </View>
        </View>

        {/* 正解進捗 */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>{CATEGORY_LABELS[category]}の正解進捗</Text>
            <Text style={styles.progressCount}>{correctForCategory} / {totalForCategory} 問</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progressPct * 100}%`, backgroundColor: CATEGORY_COLORS[category] }]} />
          </View>
        </View>

        <View style={styles.actions}>
          {correctForCategory < totalForCategory && (
            <Button label="次のセットへ →" onPress={handleNextSet} />
          )}
          <Button label="ホームへ戻る" variant="secondary" onPress={handleGoHome} />
        </View>
      </View>

      <EndingModal visible={showEnding} onClose={() => { setShowEnding(false); navigation.popToTop(); }} />

      <Modal visible={leveledUp} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modal}>
            <Text style={styles.modalIcon}>🎉</Text>
            <Text style={styles.modalTitle}>レベルアップ！</Text>
            <Text style={styles.modalSub}>おめでとうございます</Text>
            <Button label="やった！" onPress={() => setLeveledUp(false)} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: Colors.text, marginBottom: 4 },
  category: { fontSize: 15, color: Colors.textLight, marginBottom: 32 },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  pct: { fontSize: 40, fontWeight: 'bold', color: Colors.primary },
  pctLabel: { fontSize: 14, color: Colors.textLight },
  stats: { flexDirection: 'row', marginBottom: 24, gap: 24 },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 13, color: Colors.textLight },
  statDivider: { width: 1, backgroundColor: Colors.border },
  progressSection: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressTitle: { fontSize: 13, fontWeight: 'bold', color: Colors.text },
  progressCount: { fontSize: 13, color: Colors.textLight },
  progressBarBg: { height: 12, backgroundColor: Colors.border, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  actions: { width: '100%', gap: 10 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  modal: { backgroundColor: Colors.white, borderRadius: 20, padding: 32, alignItems: 'center', gap: 8, width: '80%' },
  modalIcon: { fontSize: 48 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: Colors.text },
  modalSub: { fontSize: 15, color: Colors.textLight, marginBottom: 8 },
});
