export type QuestionType = 'fill_blank' | 'conversation';
export type Category = 'vocabulary' | 'conversation' | 'grammar';
export type ConversationMode = 'audio' | 'silent';

export type Difficulty = '600' | '730';

export interface FillBlankQuestion {
  id: string;
  type: 'fill_blank';
  category: 'vocabulary' | 'grammar';
  sentence: string;
  answer: string;
  choices: string[];
  translation: string;
  explanation: string;
  xpReward: number;
  difficulty?: Difficulty;
}

export interface ConversationQuestion {
  id: string;
  type: 'conversation';
  category: 'conversation';
  question: string;
  answer: string;
  choices: string[];
  translation: string;
  explanation: string;
  xpReward: number;
  difficulty?: Difficulty;
}

export type Question = FillBlankQuestion | ConversationQuestion;

export interface LessonRecord {
  date: string;
  category: Category;
  score: number;
  total: number;
  xpEarned: number;
}

export interface UserProgress {
  totalXP: number;
  level: number;
  streak: number;
  lastStudyDate: string | null;
  correctlyCompletedQuestionIds: string[];
  history: LessonRecord[];
  todayXP: number;
  todayDate: string | null;
  todayCompletedCategories: Category[];
  wronglyAnsweredQuestionIds: string[];
}

export interface AnswerResult {
  questionId: string;
  isCorrect: boolean;
  xpEarned: number;
}

export interface SessionState {
  questions: Question[];
  currentIndex: number;
  answers: AnswerResult[];
  category: Category;
}

export type RootStackParamList = {
  MainTabs: undefined;
  FillBlank: { category: 'vocabulary' | 'grammar' };
  Conversation: { mode: ConversationMode };
  Result: { answers: AnswerResult[]; category: Category };
};

export type MainTabParamList = {
  Home: undefined;
  Progress: undefined;
};
