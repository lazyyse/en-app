import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Speech from 'expo-speech';

import { RootStackParamList, ConversationQuestion, AnswerResult } from '../types';
import { getQuestions } from '../data';
import { loadProgress } from '../store/progressStore';
import { shuffleArray } from '../utils/shuffleArray';
import { useFirstTapHint } from '../hooks/useFirstTapHint';
import { Colors } from '../utils/colors';
import ProgressHeader from '../components/common/ProgressHeader';
import ChoiceButton from '../components/fillblank/ChoiceButton';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Conversation'>;
type Route = RouteProp<RootStackParamList, 'Conversation'>;

interface Props { navigation: Nav; route: Route }
type ChoiceState = 'idle' | 'correct' | 'wrong' | 'disabled';

type QueueItem = ConversationQuestion;

const SESSION_SIZE = 3;

export default function ConversationScreen({ navigation, route }: Props) {
  const { mode } = route.params;

  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [initialized, setInitialized] = useState(false);
  const totalInQueue = SESSION_SIZE;
  const [completedCount, setCompletedCount] = useState(0);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);

  useEffect(() => {
    const init = async () => {
      const all = getQuestions('conversation') as ConversationQuestion[];
      const progress = await loadProgress();
      const notCorrect = all.filter((q) => !progress.correctlyCompletedQuestionIds.includes(q.id));
      const wrong = notCorrect.filter((q) => (progress.wronglyAnsweredQuestionIds ?? []).includes(q.id));
      const fresh = notCorrect.filter((q) => !(progress.wronglyAnsweredQuestionIds ?? []).includes(q.id));

      const source = fresh.length > 0
        ? [...shuffleArray(fresh), ...shuffleArray(wrong)]
        : shuffleArray(wrong.length > 0 ? wrong : all);
      setQueue(source.slice(0, SESSION_SIZE));
      setInitialized(true);
    };
    init();
  }, []);

  const current = queue[0] as QueueItem | undefined;

  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);
  const [choiceStates, setChoiceStates] = useState<Record<string, ChoiceState>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [canAnswer, setCanAnswer] = useState(false);
  const [showTapHint, markHintShown] = useFirstTapHint();

  // silent mode: one word at a time
  const [silentWord, setSilentWord] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  };

  const startQuestion = useCallback((q: QueueItem) => {
    clearTimer();
    Speech.stop();

    const shuffled = shuffleArray(q.choices);
    setShuffledChoices(shuffled);
    setChoiceStates(Object.fromEntries(shuffled.map((w) => [w, 'idle' as ChoiceState])));
    setConfirmed(false);
    setSelectedWord(null);
    setCanAnswer(false);
    setSilentWord(null);

    if (mode === 'audio') {
      Speech.speak(q.question, {
        language: 'en-US',
        rate: 0.75,
        pitch: 0.85,
        onDone: () => setCanAnswer(true),
        onError: () => setCanAnswer(true),
      });
    } else {
      const words = q.question.split(' ');
      let index = 0;
      intervalRef.current = setInterval(() => {
        if (index < words.length) {
          setSilentWord(words[index]);
          index++;
        } else {
          clearTimer();
          setSilentWord(null);
          setCanAnswer(true);
        }
      }, 350);
    }
  }, [mode]);

  useEffect(() => {
    if (current) startQuestion(current);
    return clearTimer;
  }, [queue[0]?.id]);

  const handleChoice = useCallback((word: string) => {
    if (confirmed || !canAnswer || !current) return;
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
  }, [confirmed, canAnswer, current, shuffledChoices]);

  const handleNext = useCallback(() => {
    if (!current) return;
    if (showTapHint) markHintShown();
    const isCorrect = selectedWord === current.answer;
    const xpEarned = isCorrect ? current.xpReward : 0;
    const newAnswers = [...answers, { questionId: current.id, isCorrect, xpEarned }];
    const nextQueue = queue.slice(1);
    if (nextQueue.length === 0) {
      navigation.replace('Result', { answers: newAnswers, category: 'conversation' });
    } else {
      setAnswers(newAnswers);
      setCompletedCount((c) => c + 1);
      setQueue(nextQueue);
    }
  }, [current, selectedWord, answers, queue, navigation]);

  const handleReplay = useCallback(() => {
    if (!current || mode !== 'audio') return;
    Speech.stop();
    setCanAnswer(false);
    Speech.speak(current.question, {
      language: 'en-US',
      rate: 0.75,
      onDone: () => setCanAnswer(true),
      onError: () => setCanAnswer(true),
    });
  }, [current, mode]);

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
        total={totalInQueue}
        onClose={() => { clearTimer(); Speech.stop(); navigation.goBack(); }}
      />

      {/* 固定高さの問題エリア */}
      <View style={styles.questionCard}>
        {mode === 'audio' ? (
          <TouchableOpacity style={styles.speakBtn} onPress={handleReplay}>
            <Text style={styles.speakIcon}>🔊</Text>
            <Text style={styles.speakLabel}>再生する</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.silentWord}>
            {silentWord ?? (canAnswer ? '' : '　')}
          </Text>
        )}
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
            state={!canAnswer ? 'disabled' : (choiceStates[word] ?? 'idle')}
            onPress={
              !canAnswer ? undefined
                : confirmed
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
            <Text style={styles.questionRevealed}>{current.question}</Text>
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
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
  },
  speakBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speakIcon: { fontSize: 22 },
  speakLabel: { fontSize: 16, fontWeight: 'bold', color: Colors.white },
  silentWord: { fontSize: 28, fontWeight: 'bold', color: Colors.text, textAlign: 'center' },
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
  questionRevealed: { fontSize: 16, color: Colors.text, lineHeight: 24 },
  correctAnswer: { fontSize: 15, color: Colors.text },
  translation: { fontSize: 13, color: Colors.textLight },
  explanation: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
  retryNote: { fontSize: 13, color: Colors.danger },
  hint: { fontSize: 13, color: Colors.textLight, marginTop: 4 },
});
