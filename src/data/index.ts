import { Question, Category, Difficulty } from '../types';
import vocabulary from './questions/vocabulary.json';
import conversation from './questions/conversation.json';
import grammar from './questions/grammar.json';

const questionMap: Record<Category, Question[]> = {
  vocabulary: vocabulary as Question[],
  conversation: conversation as Question[],
  grammar: grammar as Question[],
};

export function getQuestions(category: Category, difficulty?: Difficulty): Question[] {
  const all = questionMap[category] ?? [];
  if (!difficulty) return all;
  // difficulty フィールドなし = '600' 扱い
  return all.filter((q) => (q.difficulty ?? '600') === difficulty);
}

export function getAllQuestions(difficulty?: Difficulty): Question[] {
  return Object.values(questionMap).flat().filter(
    (q) => !difficulty || (q.difficulty ?? '600') === difficulty,
  );
}

export const CATEGORY_LABELS: Record<Category, string> = {
  vocabulary: '単語',
  conversation: '会話',
  grammar: '文法',
};

export const CATEGORY_ICONS: Record<Category, string> = {
  vocabulary: '📖',
  conversation: '💬',
  grammar: '✏️',
};

export const CATEGORY_COLORS: Record<Category, string> = {
  vocabulary: '#58CC02',
  conversation: '#1CB0F6',
  grammar: '#FF9600',
};

export const CATEGORY_TOTAL_QUESTIONS: Record<Category, number> = {
  vocabulary: 100,
  conversation: 50,
  grammar: 50,
};

export const CATEGORY_ID_PREFIX: Record<Category, string> = {
  vocabulary: 'VC_',
  conversation: 'CV_',
  grammar: 'GR_',
};
