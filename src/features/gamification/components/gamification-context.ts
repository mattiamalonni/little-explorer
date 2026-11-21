"use client";

import { createContext, useContext } from "react";
import type { GameSetting, GameSettings } from "@/features/gamification/lib/game-settings";
import type { Progress, RoundInput, RoundReward, World } from "@/features/gamification/lib/progress";

export type SessionUser = {
  id: string;
  name: string;
};

export type AppStatus = "loading" | "auth" | "ready" | "error";
export type SyncState = "idle" | "saving" | "saved" | "error";

export type SessionPayload = {
  user: SessionUser;
  progress: unknown;
  settings?: unknown;
  /** Giorno calcolato sul server: client e DB devono usare la stessa data per streak e badge. */
  today?: string;
};

/** Risolto lato server nel layout: evita il fetch client di /api/me e lo spinner iniziale. */
export type InitialSession = { status: "ready"; payload: SessionPayload } | { status: "auth" } | { status: "unknown" };

export type GamificationContextValue = {
  progress: Progress;
  hydrated: boolean;
  status: AppStatus;
  user: SessionUser | null;
  authBusy: boolean;
  authError: string | null;
  syncState: SyncState;
  confirmedRewards: Record<string, RoundReward>;
  hasLegacyProgress: boolean;
  settings: GameSettings;
  updateGameSetting: (world: World, gameId: string, setting: GameSetting) => void;
  login: (name: string, password: string) => Promise<void>;
  register: (name: string, password: string) => Promise<void>;
  clearAuthError: () => void;
  retryBootstrap: () => void;
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
