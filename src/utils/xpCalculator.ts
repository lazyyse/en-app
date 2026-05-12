// レベルは正解した問題数（ユニーク）から計算する
// 全200問を正解するとLv10、sqrt曲線で序盤は速め・後半は長くかかる
export const TOTAL_QUESTIONS = 200;
export const MAX_LEVEL = 10;
export const XP_PER_QUESTION = 10; // 1問あたりのスキルpt

export function calcLevel(correctCount: number): number {
  if (correctCount <= 0) return 1;
  if (correctCount >= TOTAL_QUESTIONS) return MAX_LEVEL;
  return Math.min(MAX_LEVEL - 1, Math.floor(Math.sqrt(correctCount / TOTAL_QUESTIONS) * (MAX_LEVEL - 1)) + 1);
}

function questionsForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level >= MAX_LEVEL) return TOTAL_QUESTIONS;
  for (let c = 0; c <= TOTAL_QUESTIONS; c++) {
    if (calcLevel(c) >= level) return c;
  }
  return TOTAL_QUESTIONS;
}

export function xpToNextLevel(correctCount: number): { current: number; needed: number; level: number } {
  const level = calcLevel(correctCount);
  if (level >= MAX_LEVEL) return { current: 1, needed: 1, level: MAX_LEVEL };

  const prevThreshold = questionsForLevel(level);
  const nextThreshold = questionsForLevel(level + 1);

  return {
    current: (correctCount - prevThreshold) * XP_PER_QUESTION,
    needed: Math.max(1, nextThreshold - prevThreshold) * XP_PER_QUESTION,
    level,
  };
}
