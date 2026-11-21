"use client";

import { createContext, useContext } from "react";
import type { GameSetting, GameSettings } from "@/features/gamification/lib/game-settings";
import type { Progress, RoundInput, RoundReward, World } from "@/features/gamification/lib/progress";

export type SessionUser = {
  id: string;
  name: string;
};

export type AppStatus = "loading" | "auth" | "ready";
export type SyncState = "idle" | "saving" | "saved" | "error";

export type GamificationContextValue = {
  progress: Progress;
  hydrated: boolean;
  status: AppStatus;
  user: SessionUser | null;
  authBusy: boolean;
  authError: string | null;
  syncState: SyncState;
  hasLegacyProgress: boolean;
  settings: GameSettings;
  updateGameSetting: (world: World, gameId: string, setting: GameSetting) => void;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  clearAuthError: () => void;
  logout: () => Promise<void>;
  retrySave: () => void;
  completeRound: (input: RoundInput) => RoundReward;
  openProgress: () => void;
  resetProgress: () => Promise<void>;
};

export const GamificationContext = createContext<GamificationContextValue | null>(null);

export function useGamification(): GamificationContextValue {
  const context = useContext(GamificationContext);
  if (!context) throw new Error("Gamification components require GamificationProvider");
  return context;
}
