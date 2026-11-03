import type { Progress as ProgressRecord } from "@prisma/client";
import { createDefaultProgress, type Progress } from "@/features/gamification/lib/progress";

export type ProgressData = {
  stars: number;
  rounds: number;
  perfectRounds: number;
  correctEnglish: number;
  correctMath: number;
  correctItalian: number;
  games: string[];
  streak: number;
  lastPlayed: string | null;
  badges: string[];
};

export function progressFromRecord(record: ProgressRecord | null | undefined): Progress {
  if (!record) return createDefaultProgress();
  return {
    version: 1,
    stars: record.stars,
    rounds: record.rounds,
    perfectRounds: record.perfectRounds,
    correct: {
      english: record.correctEnglish,
      math: record.correctMath,
      italian: record.correctItalian,
    },
    games: [...record.games],
    streak: record.streak,
    lastPlayed: record.lastPlayed,
    badges: [...record.badges],
  };
}

export function progressToRecordData(progress: Progress): ProgressData {
  return {
    stars: progress.stars,
    rounds: progress.rounds,
    perfectRounds: progress.perfectRounds,
    correctEnglish: progress.correct.english,
    correctMath: progress.correct.math,
    correctItalian: progress.correct.italian,
    games: progress.games,
    streak: progress.streak,
    lastPlayed: progress.lastPlayed,
    badges: progress.badges,
  };
}
