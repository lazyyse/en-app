import React, { useCallback, useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize, IS_EXPO_GO } from '../utils/adModules';

import { RootStackParamList, Category, ConversationMode } from '../types';
import { useProgress } from '../hooks/useProgress';
import { Colors } from '../utils/colors';
import XPBar from '../components/common/XPBar';
import OnboardingModal from '../components/common/OnboardingModal';
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS, getQuestions } from '../data';
import { BANNER_AD_UNIT_ID } from '../utils/ads';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CONV_MODE_KEY = '@en_app:conversation_mode';
const ONBOARDING_KEY = '@en_app:onboarding_shown';
const CATEGORIES: Category[] = ['vocabulary', 'conversation', 'grammar'];
const VOCAB_SET_SIZE = 3;

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { progress, loading, xpInfo, refresh } = useProgress();
  const [convMode, setConvMode] = useState<ConversationMode>('audio');
  const [showOnboarding, setShowOnboarding] = useState(false);

  useFocusEffect(useCallback(() => { refresh(); }, []));

  useEffect(() => {
    AsyncStorage.getItem(CONV_MODE_KEY).then((v) => {
      if (v === 'silent' || v === 'audio') setConvMode(v);
    });
    AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      if (!v) setShowOnboarding(true);
    });
  }, []);

  const setConvModeAndSave = (m: ConversationMode) => {
    setConvMode(m);
    AsyncStorage.setItem(CONV_MODE_KEY, m);
  };

  const handleCategory = (category: Category) => {
    if (category === 'conversation') {
      navigation.navigate('Conversation', { mode: convMode });
    } else {
      navigation.navigate('FillBlank', { category });
    }
  };

  if (loading || !progress || !xpInfo) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <OnboardingModal visible={showOnboarding} onDone={handleOnboardingDone} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.appName}>OneTap English</Text>
            <Text style={styles.subTitle}>TOEIC 600点を目指そう</Text>
          </View>
        </View>

        {/* XP Bar */}
        <View style={styles.xpSection}>
          <XPBar level={xpInfo.level} current={xpInfo.current} needed={xpInfo.needed} />
        </View>

        {/* Category Cards */}
        <Text style={styles.sectionTitle}>カテゴリを選ぶ</Text>
        <View style={styles.cards}>
          {CATEGORIES.map((cat) => {
            const questions = getQuestions(cat);
            const isConversation = cat === 'conversation';
            const isTodayCleared = progress.todayCompletedCategories?.includes(cat) ?? false;
            return (
              <View key={cat} style={[styles.card, { borderLeftColor: CATEGORY_COLORS[cat] }, isTodayCleared && styles.cardCleared]}>
                <Text style={styles.cardIcon}>{CATEGORY_ICONS[cat]}</Text>
                <View style={styles.cardBody}>
                  <View style={styles.cardTitleRow}>
                    <Text style={styles.cardTitle}>{CATEGORY_LABELS[cat]}</Text>
                    {isTodayCleared && <Text style={[styles.cardCheck, { color: CATEGORY_COLORS[cat] }]}>✓</Text>}
                  </View>
                  {isConversation ? (
                    /* セグメントコントロール */
                    <View style={styles.segControl}>
                      <TouchableOpacity
                        style={[styles.segBtn, convMode === 'audio' && styles.segBtnActive]}
                        onPress={() => setConvModeAndSave('audio')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.segLabel, convMode === 'audio' && styles.segLabelActive]}>
                          音声
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.segBtn, convMode === 'silent' && styles.segBtnActive]}
                        onPress={() => setConvModeAndSave('silent')}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.segLabel, convMode === 'silent' && styles.segLabelActive]}>
                          サイレント
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={styles.cardSub}>{questions.length}問</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: CATEGORY_COLORS[cat] }]}
                  onPress={() => handleCategory(cat)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.startBtnText}>スタート</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Stats summary */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>+{progress.todayXP ?? 0}</Text>
            <Text style={styles.statLabel}>今日のスキルpt</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{progress.correctlyCompletedQuestionIds.length}</Text>
            <Text style={styles.statLabel}>正解済み問題</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>Lv.{progress.level}</Text>
            <Text style={styles.statLabel}>レベル</Text>
          </View>
        </View>
      </ScrollView>

      {!IS_EXPO_GO && (
        <View style={styles.adContainer}>
          <BannerAd
            unitId={BANNER_AD_UNIT_ID}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 20, gap: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { gap: 2 },
  appName: { fontSize: 28, fontWeight: 'bold', color: Colors.primary },
  subTitle: { fontSize: 13, color: Colors.textLight },
  xpSection: { backgroundColor: Colors.surface, padding: 16, borderRadius: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  cards: { gap: 12 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardCleared: { backgroundColor: '#F6FFF0' },
  cardIcon: { fontSize: 32 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardCheck: { fontSize: 16, fontWeight: 'bold' },
  cardBody: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.text },
  cardSub: { fontSize: 13, color: Colors.textLight },
  /* セグメントコントロール */
  segControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 2,
    alignSelf: 'flex-start',
  },
  segBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  segBtnActive: { backgroundColor: Colors.white, elevation: 1, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
  segLabel: { fontSize: 12, fontWeight: '600', color: Colors.textLight },
  segLabelActive: { color: Colors.text },
  startBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  startBtnText: { fontSize: 13, fontWeight: 'bold', color: Colors.white },
  /* Stats */
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
  },
  stat: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: 'bold', color: Colors.text },
  statLabel: { fontSize: 12, color: Colors.textLight },
  adContainer: { alignItems: 'center', backgroundColor: Colors.background },
});
