import { useState, useEffect, useCallback } from 'react';
import { UserProgress, AnswerResult } from '../types';
import { loadProgress, recordSessionFromStorage } from '../store/progressStore';
import { xpToNextLevel } from '../utils/xpCalculator';

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setLoading(true);
    loadProgress().then((p) => {
      setProgress(p);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    refresh();
  }, []);

  const saveSession = useCallback(
    async (answers: AnswerResult[], categoryKey: string): Promise<{ leveledUp: boolean; newLevel: number }> => {
      const { next, leveledUp } = await recordSessionFromStorage(answers, categoryKey);
      setProgress(next);
      return { leveledUp, newLevel: next.level };
    },
    [],
  );

  const xpInfo = progress ? xpToNextLevel(progress.correctlyCompletedQuestionIds.length) : null;

  return { progress, loading, saveSession, xpInfo, refresh };
}
