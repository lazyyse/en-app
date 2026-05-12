import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, LessonRecord, AnswerResult } from '../types';
import { calcLevel } from '../utils/xpCalculator';

const STORAGE_KEY = '@en_app:user_progress';

const DEFAULT_PROGRESS: UserProgress = {
  totalXP: 0,
  level: 1,
  streak: 0,
  lastStudyDate: null,
  correctlyCompletedQuestionIds: [],
  history: [],
  todayXP: 0,
  todayDate: null,
  todayCompletedCategories: [],
  wronglyAnsweredQuestionIds: [],
};

export async function loadProgress(): Promise<UserProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as any;
    // migrate old data: completedQuestionIds → correctlyCompletedQuestionIds
    if (parsed.completedQuestionIds && !parsed.correctlyCompletedQuestionIds) {
      parsed.correctlyCompletedQuestionIds = parsed.completedQuestionIds;
      delete parsed.completedQuestionIds;
    }
    if (!parsed.correctlyCompletedQuestionIds) parsed.correctlyCompletedQuestionIds = [];
    if (parsed.todayXP === undefined) parsed.todayXP = 0;
    if (parsed.todayDate === undefined) parsed.todayDate = null;
    if (!parsed.todayCompletedCategories) parsed.todayCompletedCategories = [];
    if (!parsed.wronglyAnsweredQuestionIds) parsed.wronglyAnsweredQuestionIds = [];
    // 日付が変わっていたら今日の記録をリセット
    if (parsed.todayDate !== getTodayString()) {
      parsed.todayXP = 0;
      parsed.todayDate = getTodayString();
      parsed.todayCompletedCategories = [];
    }
    return parsed as UserProgress;
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export async function resetProgress(): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_PROGRESS }));
}

export async function saveProgress(progress: UserProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // AsyncStorageの書き込みに失敗しても続行
  }
}

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

function calcStreak(prev: UserProgress): number {
  const today = getTodayString();
  if (!prev.lastStudyDate) return 1;
  if (prev.lastStudyDate === today) return prev.streak;

  const lastDate = new Date(prev.lastStudyDate);
  const todayDate = new Date(today);
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);

  return diffDays === 1 ? prev.streak + 1 : 1;
}

export async function recordSessionFromStorage(
  answers: AnswerResult[],
  categoryKey: string,
): Promise<{ next: UserProgress; leveledUp: boolean }> {
  const prev = await loadProgress();
  return recordSession(prev, answers, categoryKey);
}

export async function recordSession(
  prev: UserProgress,
  answers: AnswerResult[],
  categoryKey: string,
): Promise<{ next: UserProgress; leveledUp: boolean }> {
  const xpEarned = answers.reduce((sum, a) => sum + a.xpEarned, 0);
  const score = answers.filter((a) => a.isCorrect).length;
  const newTotalXP = prev.totalXP + xpEarned;
  const prevLevel = prev.level;

  const correctIds = answers.filter((a) => a.isCorrect).map((a) => a.questionId);
  const incorrectIds = answers.filter((a) => !a.isCorrect).map((a) => a.questionId);

  // 正解した問題のIDのみ追加（重複なし）
  const newIds = correctIds.filter((id) => !prev.correctlyCompletedQuestionIds.includes(id));
  const newCompletedIds = [...prev.correctlyCompletedQuestionIds, ...newIds];

  // 間違い記録：正解したものを除去、新たに間違えたものを追加
  const prevWrong = prev.wronglyAnsweredQuestionIds ?? [];
  const wronglyAnsweredQuestionIds = [
    ...prevWrong.filter((id) => !correctIds.includes(id)),
    ...incorrectIds.filter((id) => !prevWrong.includes(id) && !newCompletedIds.includes(id)),
  ];
  const newLevel = calcLevel(newCompletedIds.length);

  const record: LessonRecord = {
    date: getTodayString(),
    category: categoryKey as LessonRecord['category'],
    score,
    total: answers.length,
    xpEarned,
  };

  const today = getTodayString();
  const isSameDay = prev.todayDate === today;
  const todayXP = isSameDay ? (prev.todayXP ?? 0) + xpEarned : xpEarned;
  const prevCategories = isSameDay ? (prev.todayCompletedCategories ?? []) : [];
  const todayCompletedCategories = prevCategories.includes(categoryKey as any)
    ? prevCategories
    : [...prevCategories, categoryKey as any];

  const next: UserProgress = {
    totalXP: newTotalXP,
    level: newLevel,
    streak: calcStreak(prev),
    lastStudyDate: today,
    correctlyCompletedQuestionIds: newCompletedIds,
    history: [...prev.history, record].slice(-50),
    todayXP,
    todayDate: today,
    todayCompletedCategories,
    wronglyAnsweredQuestionIds,
  };

  await saveProgress(next);
  return { next, leveledUp: newLevel > prevLevel };
}
