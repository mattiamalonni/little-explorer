"use client";

import { useEffect, useRef, useState } from "react";
import { useGamification } from "@/features/gamification/components/gamification-context";
import type { RoundReward, World } from "@/features/gamification/lib/progress";

type RoundRewardInput = {
  roundId: string;
  world: World;
  gameId: string;
  correct: number;
  total: number;
  enabled?: boolean;
};

export function useRoundReward({ roundId, world, gameId, correct, total, enabled = true }: RoundRewardInput): RoundReward | null {
  const { hydrated, completeRound, confirmedRewards } = useGamification();
  const [reward, setReward] = useState<RoundReward | null>(null);
  const recorded = useRef(false);

  useEffect(() => {
    if (!enabled || !hydrated || recorded.current) return;
    recorded.current = true;
    setReward(completeRound({ roundId, world, gameId, correct, total }));
  }, [enabled, hydrated, completeRound, roundId, world, gameId, correct, total]);

  // La reward calcolata dal browser è solo un'anteprima: appena il server conferma,
  // la versione autorevole sostituisce la cerimonia di fine partita.
  return confirmedRewards[roundId] ?? reward;
}
