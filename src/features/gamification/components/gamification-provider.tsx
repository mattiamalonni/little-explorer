"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GamificationContext } from "@/features/gamification/components/gamification-context";
import { ProgressPanel } from "@/features/gamification/components/progress-panel";
import {
  applyRound,
  clearProgress,
  createDefaultProgress,
  loadProgress,
  saveProgress,
  STORAGE_KEY,
  type Progress,
  type RoundReward,
} from "@/features/gamification/lib/progress";

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(createDefaultProgress);
  const [hydrated, setHydrated] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const progressRef = useRef(progress);
  const rewardsRef = useRef(new Map<string, RoundReward>());

  useEffect(() => {
    const stored = loadProgress();
    progressRef.current = stored;
    // localStorage esiste solo nel browser: qui idratiamo lo stato dopo il mount, senza mismatch SSR.
    // oxlint-disable-next-line react/set-state-in-effect
    setProgress(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    function syncProgress(event: StorageEvent) {
      if (event.key !== STORAGE_KEY) return;
      const stored = loadProgress();
      progressRef.current = stored;
      setProgress(stored);
    }
    window.addEventListener("storage", syncProgress);
    return () => window.removeEventListener("storage", syncProgress);
  }, []);

  const completeRound = useCallback((input: Parameters<typeof applyRound>[1]) => {
    const cached = rewardsRef.current.get(input.roundId);
    if (cached) return cached;

    const result = applyRound(progressRef.current, input);
    progressRef.current = result.progress;
    rewardsRef.current.set(input.roundId, result.reward);
    setProgress(result.progress);
    saveProgress(result.progress);
    return result.reward;
  }, []);

  const openProgress = useCallback(() => setPanelOpen(true), []);
  const closeProgress = useCallback(() => setPanelOpen(false), []);

  const resetProgress = useCallback(() => {
    const next = createDefaultProgress();
    progressRef.current = next;
    rewardsRef.current.clear();
    setProgress(next);
    clearProgress();
  }, []);

  const value = useMemo(
    () => ({ progress, hydrated, completeRound, openProgress, resetProgress }),
    [progress, hydrated, completeRound, openProgress, resetProgress],
  );

  return (
    <GamificationContext.Provider value={value}>
      {children}
      {panelOpen && <ProgressPanel onClose={closeProgress} />}
    </GamificationContext.Provider>
  );
}
