import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

import { RootStackParamList, FillBlankQuestion, AnswerResult } from '../types';
import { getQuestions } from '../data';
import { loadProgress } from '../store/progressStore';
import { shuffleArray } from '../utils/shuffleArray';
import { useFirstTapHint } from '../hooks/useFirstTapHint';
import { Colors } from '../utils/colors';

import ProgressHeader from '../components/common/ProgressHeader';
import BlankSentence from '../components/fillblank/BlankSentence';
import ChoiceButton from '../components/fillblank/ChoiceButton';

type Nav = NativeStackNavigationProp<RootStackParamList, 'FillBlank'>;
type Route = RouteProp<RootStackParamList, 'FillBlank'>;

interface Props { navigation: Nav; route: Route }
type ChoiceState = 'idle' | 'correct' | 'wrong' | 'disabled';

type QueueItem = FillBlankQuestion;

const SESSION_SIZE = 3;

export default function FillBlankScreen({ navigation, route }: Props) {
  const { category } = route.params;
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [sessionTotal, setSessionTotal] = useState(0);
  const [initialized, setInitialized] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);

  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);
  const [choiceStates, setChoiceStates] = useState<Record<string, ChoiceState>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showTapHint, markHintShown] = useFirstTapHint();

  useEffect(() => {
    const init = async () => {
      const all = getQuestions(category).filter((q) => q.type === 'fill_blank') as FillBlankQuestion[];
      const progress = await loadProgress();
      const notCorrect = all.filter((q) => !progress.correctlyCompletedQuestionIds.includes(q.id));
      const wrong = notCorrect.filter((q) => (progress.wronglyAnsweredQuestionIds ?? []).includes(q.id));
      const fresh = notCorrect.filter((q) => !(progress.wronglyAnsweredQuestionIds ?? []).includes(q.id));

      // fresh問題を優先。なくなったら間違い問題を後ろに追加（= 最後のセットに自然にスタック）
      const source = fresh.length > 0
        ? [...shuffleArray(fresh), ...shuffleArray(wrong)]
        : shuffleArray(wrong.length > 0 ? wrong : all);
      const pool = source.slice(0, SESSION_SIZE);

      const q = pool.map((q) => ({ ...q }));
      setQueue(q);
      setSessionTotal(pool.length);

      // 初回の選択肢を即座に設定（レイアウト安定のため）
      if (pool.length > 0) {
        const shuffled = shuffleArray(pool[0].choices);
        setShuffledChoices(shuffled);
        setChoiceStates(Object.fromEntries(shuffled.map((w) => [w, 'idle' as ChoiceState])));
      }
      setInitialized(true);
    };
    init();
  }, []);

  const current = queue[0] as QueueItem | undefined;

  useEffect(() => {
    if (!initialized || !current) return;
    const shuffled = shuffleArray(current.choices);
    setShuffledChoices(shuffled);
    setChoiceStates(Object.fromEntries(shuffled.map((w) => [w, 'idle' as ChoiceState])));
    setConfirmed(false);
    setSelectedWord(null);
  }, [queue[0]?.id, initialized]);

  const handleChoice = useCallback((word: string) => {
    if (confirmed || !current) return;
    const isCorrect = word === current.answer;
    setSelectedWord(word);
    setConfirmed(true);

    const newStates: Record<string, ChoiceState> = {};
    shuffledChoices.forEach((w) => {
      if (w === word) newStates[w] = isCorrect ? 'correct' : 'wrong';
      else if (w === current.answer) newStates[w] = 'correct';
      else newStates[w] = 'disabled';
    });
    setChoiceStates(newStates);
  }, [confirmed, current, shuffledChoices]);

  const handleNext = useCallback(() => {
    if (!current) return;
    if (showTapHint) markHintShown();
    const isCorrect = selectedWord === current.answer;
    const xpEarned = isCorrect ? current.xpReward : 0;
    const newAnswers = [...answers, { questionId: current.id, isCorrect, xpEarned }];
    const nextQueue = queue.slice(1);
    if (nextQueue.length === 0) {
      navigation.replace('Result', { answers: newAnswers, category });
    } else {
      setAnswers(newAnswers);
      setCompletedCount((c) => c + 1);
      setQueue(nextQueue);
    }
  }, [current, selectedWord, answers, queue, navigation, category]);

  if (!initialized) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }
  if (!current) return null;

  const isCorrect = selectedWord === current.answer;

  return (
    <SafeAreaView style={styles.safe}>
      <ProgressHeader
        current={completedCount}
        total={sessionTotal}
        onClose={() => navigation.goBack()}
      />

      {/* 固定高さの問題エリア */}
      <View style={styles.questionCard}>
        <BlankSentence sentence={current.sentence} filledWord={selectedWord ?? undefined} />
      </View>

      {/* 初回タップガイド */}
      {confirmed && showTapHint && (
        <View style={styles.tapHint}>
          <Text style={styles.tapHintText}>👆 緑色のボタンをタップして次の問題へ！</Text>
        </View>
      )}

      {/* 選択肢 — 常にレンダリング（位置固定） */}
      <View style={styles.choices}>
        {shuffledChoices.map((word) => (
          <ChoiceButton
            key={word}
            word={word}
            state={choiceStates[word] ?? 'idle'}
            onPress={
              confirmed
                ? choiceStates[word] === 'correct' ? handleNext : undefined
                : () => handleChoice(word)
            }
          />
        ))}
      </View>

      {/* フィードバック（スクロール可） */}
      {confirmed && (
        <ScrollView style={styles.feedbackScroll} contentContainerStyle={styles.feedbackContent}>
          <View style={[styles.feedback, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <Text style={styles.feedbackTitle}>{isCorrect ? '✓ 正解！' : '✗ 不正解'}</Text>
            {!isCorrect && <Text style={styles.correctAnswer}>正解: {current.answer}</Text>}
            <Text style={styles.translation}>{current.translation}</Text>
            <Text style={styles.explanation}>{current.explanation}</Text>
            {!isCorrect && <Text style={styles.retryNote}>この問題は後でもう一度出てきます</Text>}
            <Text style={styles.hint}>✓ 正解をタップして次へ</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  questionCard: {
    backgroundColor: Colors.white,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 16,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  tapHint: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FFC107',
  },
  tapHintText: { fontSize: 13, color: '#795548', fontWeight: '600' },
  choices: { paddingHorizontal: 16, paddingTop: 8 },
  feedbackScroll: { flex: 1 },
  feedbackContent: { padding: 16, paddingBottom: 32 },
  feedback: { borderRadius: 16, padding: 16, gap: 6 },
  feedbackCorrect: { backgroundColor: '#E8F9E0' },
  feedbackWrong: { backgroundColor: '#FFEAEA' },
  feedbackTitle: { fontSize: 18, fontWeight: 'bold', color: Colors.text },
  correctAnswer: { fontSize: 15, color: Colors.text },
  translation: { fontSize: 13, color: Colors.textLight },
  explanation: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
  retryNote: { fontSize: 13, color: Colors.danger },
  hint: { fontSize: 13, color: Colors.textLight, marginTop: 4 },
});
