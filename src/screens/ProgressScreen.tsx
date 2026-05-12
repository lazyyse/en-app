import React, { useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { useProgress } from '../hooks/useProgress';
import { resetProgress } from '../store/progressStore';
import { Colors } from '../utils/colors';
import XPBar from '../components/common/XPBar';
import { APP_VERSION, PRIVACY_POLICY_URL } from '../utils/constants';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_TOTAL_QUESTIONS, CATEGORY_ID_PREFIX } from '../data';
import { Category } from '../types';

function getTodayAndWeek(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export default function ProgressScreen() {
  const { progress, loading, xpInfo, refresh } = useProgress();

  useFocusEffect(useCallback(() => { refresh(); }, []));

  if (loading || !progress || !xpInfo) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const handleReset = () => {
    Alert.alert(
      'データをリセット',
      '学習データをすべて削除します。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'リセット', style: 'destructive',
          onPress: async () => { await resetProgress(); refresh(); },
        },
      ],
    );
  };

  const studiedDates = new Set(progress.history.map((h: any) => h.date));
  const week = getTodayAndWeek();

  const categoryStats: Record<string, { correct: number; total: number }> = {};
  for (const record of progress.history) {
    const cat = record.category as string;
    if (!categoryStats[cat]) categoryStats[cat] = { correct: 0, total: 0 };
    categoryStats[cat].correct += record.score;
    categoryStats[cat].total += record.total;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>学習記録</Text>

        {/* レベル */}
        <View style={styles.card}>
          <XPBar level={xpInfo.level} current={xpInfo.current} needed={xpInfo.needed} />
        </View>

        {/* Weekly calendar */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>今週の学習</Text>
          <View style={styles.calendar}>
            {week.map((date, i) => {
              const d = new Date(date);
              const isToday = date === new Date().toISOString().slice(0, 10);
              const studied = studiedDates.has(date);
              return (
                <View key={date} style={styles.dayCol}>
                  <Text style={styles.dayLabel}>{DAY_LABELS[d.getDay()]}</Text>
                  <View style={[styles.dayDot, studied && styles.dayDotStudied, isToday && styles.dayDotToday]}>
                    {studied && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* 問題正解進捗 */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>問題正解進捗</Text>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
            const correct = progress.correctlyCompletedQuestionIds.filter((id) => id.startsWith(CATEGORY_ID_PREFIX[cat])).length;
            const total = CATEGORY_TOTAL_QUESTIONS[cat];
            const pct = total > 0 ? correct / total : 0;
            return (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catLabel}>{CATEGORY_LABELS[cat]}</Text>
                <View style={styles.catBarBg}>
                  <View style={[styles.catBarFill, { width: `${pct * 100}%`, backgroundColor: CATEGORY_COLORS[cat] }]} />
                </View>
                <Text style={styles.catPct}>{correct}/{total}</Text>
              </View>
            );
          })}
        </View>

        {/* Category stats */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>カテゴリ別正解率</Text>
          {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => {
            const stat = categoryStats[cat];
            const pct = stat && stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
            return (
              <View key={cat} style={styles.catRow}>
                <Text style={styles.catLabel}>{CATEGORY_LABELS[cat]}</Text>
                <View style={styles.catBarBg}>
                  <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: CATEGORY_COLORS[cat] }]} />
                </View>
                <Text style={styles.catPct}>{stat ? `${pct}%` : '-'}</Text>
              </View>
            );
          })}
        </View>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress.totalXP}</Text>
            <Text style={styles.statLabel}>総スキルpt</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress.history.length}</Text>
            <Text style={styles.statLabel}>セッション数</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{progress.correctlyCompletedQuestionIds.length}</Text>
            <Text style={styles.statLabel}>正解済み問題</Text>
          </View>
        </View>
        {/* フッター */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => Linking.openURL(PRIVACY_POLICY_URL)} activeOpacity={0.7}>
            <Text style={styles.footerLink}>プライバシーポリシー</Text>
          </TouchableOpacity>
          <Text style={styles.footerSep}>|</Text>
          <Text style={styles.footerVersion}>v{APP_VERSION}</Text>
        </View>

        {/* データリセット */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.7}>
          <Text style={styles.resetText}>学習データをリセット</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 16 },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.text },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  streakLabel: { fontSize: 14, color: Colors.textLight },
  divider: { height: 1, backgroundColor: Colors.border },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  calendar: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayLabel: { fontSize: 12, color: Colors.textLight },
  dayDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotStudied: { backgroundColor: Colors.primary },
  dayDotToday: { borderWidth: 2, borderColor: Colors.primary },
  checkMark: { fontSize: 16, color: Colors.white },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  catLabel: { fontSize: 13, color: Colors.text, width: 90 },
  catBarBg: { flex: 1, height: 10, backgroundColor: Colors.border, borderRadius: 5, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: 5 },
  catPct: { fontSize: 13, color: Colors.textLight, width: 36, textAlign: 'right' },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
  },
  statItem: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textLight },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, paddingVertical: 8 },
  footerLink: { fontSize: 13, color: Colors.primary },
  footerSep: { fontSize: 13, color: Colors.border },
  footerVersion: { fontSize: 13, color: Colors.textLight },
  resetBtn: { paddingVertical: 14, alignItems: 'center' },
  resetText: { fontSize: 14, color: Colors.danger },
});
