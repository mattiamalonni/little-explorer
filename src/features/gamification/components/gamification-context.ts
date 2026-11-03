"use client";

import { createContext, useContext } from "react";
import type { Progress, RoundInput, RoundReward } from "@/features/gamification/lib/progress";

export type GamificationContextValue = {
  progress: Progress;
  hydrated: boolean;
  completeRound: (input: RoundInput) => RoundReward;
  openProgress: () => void;
  resetProgress: () => void;
};

export const GamificationContext = createContext<GamificationContextValue | null>(null);

export function useGamification(): GamificationContextValue {
  const context = useContext(GamificationContext);
  if (!context) throw new Error("Gamification components require GamificationProvider");
  return context;
}
