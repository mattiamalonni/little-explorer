"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { AppLoading } from "@/features/gamification/components/app-loading";
import { GamificationContext, type SessionUser, type SyncState } from "@/features/gamification/components/gamification-context";
import { ProgressPanel } from "@/features/gamification/components/progress-panel";
import { SiteHeader } from "@/features/gamification/components/site-header";
import {
  normalizeGameSettings,
  normalizeGameSetting,
  settingKey,
  type GameSetting,
  type GameSettings,
} from "@/features/gamification/lib/game-settings";
import {
  applyRound,
  clearProgress,
  createDefaultProgress,
  loadProgress,
  normalizeProgress,
  WORLDS,
  type Progress,
  type RoundInput,
  type RoundReward,
  type World,
} from "@/features/gamification/lib/progress";
type SessionPayload = {
  user: SessionUser;
  progress: unknown;
  settings?: unknown;
};

function hasMeaningfulProgress(progress: Progress): boolean {
  return (
    progress.stars > 0 ||
    progress.rounds > 0 ||
    progress.games.length > 0 ||
    progress.badges.length > 0 ||
    WORLDS.some((world) => progress.correct[world] > 0)
  );
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(createDefaultProgress);
  const [settings, setSettings] = useState<GameSettings>({});
  const [hydrated, setHydrated] = useState(false);
  const [status, setStatus] = useState<"loading" | "auth" | "ready">("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>("idle");
  const [hasLegacyProgress, setHasLegacyProgress] = useState(() => hasMeaningfulProgress(loadProgress()));
  const [panelOpen, setPanelOpen] = useState(false);
  const progressRef = useRef(progress);
  const rewardsRef = useRef(new Map<string, RoundReward>());
  const pendingRoundsRef = useRef(new Map<string, RoundInput>());
  const savingRoundsRef = useRef(false);
  const pendingSettingsRef = useRef(new Map<string, { world: World; gameId: string; setting: GameSetting }>());
  const savingSettingsRef = useRef(false);

  const applySession = useCallback((payload: SessionPayload) => {
    const next = normalizeProgress(payload.progress);
    progressRef.current = next;
    rewardsRef.current.clear();
    pendingRoundsRef.current.clear();
    pendingSettingsRef.current.clear();
    setProgress(next);
    setSettings(normalizeGameSettings(payload.settings));
    setUser(payload.user);
    setStatus("ready");
    setHydrated(true);
    setSyncState("idle");
    setAuthError(null);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        const response = await fetch("/api/me", { cache: "no-store" });
        if (cancelled) return;

        if (response.ok) {
          applySession((await response.json()) as SessionPayload);
          return;
        }

        setStatus("auth");
      } catch {
        if (cancelled) return;
        setStatus("auth");
        setAuthError("Non riusciamo a collegarci. Controlla la connessione e ricarica la pagina.");
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [applySession]);

  const handleSessionExpired = useCallback(() => {
    pendingRoundsRef.current.clear();
    pendingSettingsRef.current.clear();
    setUser(null);
    setHydrated(false);
    setStatus("auth");
    setSyncState("idle");
    setAuthError("La sessione è scaduta. Entra di nuovo per ritrovare i tuoi progressi.");
  }, []);

  // Invia solo il delta della partita: il server ricalcola e restituisce il progresso autorevole.
  const flushRounds = useCallback(async () => {
    if (savingRoundsRef.current) return;
    savingRoundsRef.current = true;
    setSyncState("saving");

    try {
      while (pendingRoundsRef.current.size > 0) {
        const entry = pendingRoundsRef.current.entries().next().value;
        if (!entry) break;
        const [roundId, input] = entry;
        pendingRoundsRef.current.delete(roundId);

        try {
          const response = await fetch("/api/progress/rounds", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          });

          if (response.status === 401) {
            handleSessionExpired();
            return;
          }

          if (!response.ok) {
            pendingRoundsRef.current.set(roundId, input);
            setSyncState("error");
            return;
          }

          const result = (await response.json()) as { progress: Progress; reward: RoundReward };
          progressRef.current = result.progress;
          setProgress(result.progress);
          rewardsRef.current.set(roundId, result.reward);
        } catch {
          pendingRoundsRef.current.set(roundId, input);
          setSyncState("error");
          return;
        }
      }

      setSyncState("saved");
    } finally {
      savingRoundsRef.current = false;
    }
  }, [handleSessionExpired]);

  const retrySave = useCallback(() => {
    void flushRounds();
  }, [flushRounds]);

  const flushSettings = useCallback(async () => {
    if (savingSettingsRef.current) return;
    savingSettingsRef.current = true;

    try {
      while (pendingSettingsRef.current.size > 0) {
        const entry = pendingSettingsRef.current.entries().next().value;
        if (!entry) break;
        const [key, update] = entry;
        pendingSettingsRef.current.delete(key);

        try {
          const response = await fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ world: update.world, gameId: update.gameId, setting: update.setting }),
          });
          if (response.status === 401) {
            handleSessionExpired();
            return;
          }
        } catch {
          // La scelta resta in memoria: al prossimo cambio riproveremo a salvarla.
        }
      }
    } finally {
      savingSettingsRef.current = false;
    }
  }, [handleSessionExpired]);

  const updateGameSetting = useCallback(
    (world: World, gameId: string, setting: GameSetting) => {
      const normalized = normalizeGameSetting(setting);
      setSettings((current) => ({ ...current, [settingKey(world, gameId)]: normalized }));
      pendingSettingsRef.current.set(settingKey(world, gameId), { world, gameId, setting: normalized });
      void flushSettings();
    },
    [flushSettings],
  );

  const clearAuthError = useCallback(() => setAuthError(null), []);

  const login = useCallback(
    async (name: string, password: string) => {
      setAuthBusy(true);
      setAuthError(null);

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, password }),
        });
        const data = (await response.json().catch(() => null)) as (SessionPayload & { error?: string }) | null;

        if (!response.ok || !data?.user || data.progress === undefined) {
          setAuthError(data?.error ?? "Non siamo riusciti a farti entrare. Riprova.");
          return;
        }

        applySession(data);
      } catch {
        setAuthError("Non riusciamo a collegarci. Controlla la connessione e riprova.");
      } finally {
        setAuthBusy(false);
      }
    },
    [applySession],
  );

  const register = useCallback(
    async (name: string, password: string) => {
      setAuthBusy(true);
      setAuthError(null);

      const legacy = loadProgress();
      const shouldMigrate = hasMeaningfulProgress(legacy);

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            password,
            ...(shouldMigrate ? { initialProgress: legacy } : {}),
          }),
        });
        const data = (await response.json().catch(() => null)) as (SessionPayload & { error?: string }) | null;

        if (!response.ok || !data?.user || data.progress === undefined) {
          setAuthError(data?.error ?? "Non siamo riusciti a creare il tuo nome. Riprova.");
          return;
        }

        clearProgress();
        setHasLegacyProgress(false);
        applySession(data);
      } catch {
        setAuthError("Non riusciamo a collegarci. Controlla la connessione e riprova.");
      } finally {
        setAuthBusy(false);
      }
    },
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Anche senza rete, l'interfaccia torna alla schermata di accesso.
    }

    pendingRoundsRef.current.clear();
    pendingSettingsRef.current.clear();
    const empty = createDefaultProgress();
    progressRef.current = empty;
    rewardsRef.current.clear();
    setProgress(empty);
    setSettings({});
    setUser(null);
    setHydrated(false);
    setStatus("auth");
    setPanelOpen(false);
    setSyncState("idle");
    setAuthError(null);
    setHasLegacyProgress(hasMeaningfulProgress(loadProgress()));
  }, []);

  const completeRound = useCallback(
    (input: RoundInput) => {
      const cached = rewardsRef.current.get(input.roundId);
      if (cached) return cached;

      // Feedback immediato; il server conferma (o corregge) il risultato in modo asincrono.
      const result = applyRound(progressRef.current, input);
      progressRef.current = result.progress;
      rewardsRef.current.set(input.roundId, result.reward);
      setProgress(result.progress);
      pendingRoundsRef.current.set(input.roundId, input);
      void flushRounds();
      return result.reward;
    },
    [flushRounds],
  );

  const openProgress = useCallback(() => setPanelOpen(true), []);
  const closeProgress = useCallback(() => setPanelOpen(false), []);

  const resetProgress = useCallback(async () => {
    const next = createDefaultProgress();
    progressRef.current = next;
    rewardsRef.current.clear();
    pendingRoundsRef.current.clear();
    clearProgress();
    setProgress(next);
    setSyncState("saving");

    try {
      const response = await fetch("/api/progress", { method: "DELETE" });
      if (response.status === 401) {
        handleSessionExpired();
        return;
      }
      setSyncState(response.ok ? "saved" : "error");
    } catch {
      setSyncState("error");
    }
  }, [handleSessionExpired]);

  const value = useMemo(
    () => ({
      progress,
      hydrated,
      status,
      user,
      authBusy,
      authError,
      syncState,
      hasLegacyProgress,
      settings,
      updateGameSetting,
      login,
      register,
      clearAuthError,
      logout,
      retrySave,
      completeRound,
      openProgress,
      resetProgress,
    }),
    [
      progress,
      hydrated,
      status,
      user,
      authBusy,
      authError,
      syncState,
      hasLegacyProgress,
      settings,
      updateGameSetting,
      login,
      register,
      clearAuthError,
      logout,
      retrySave,
      completeRound,
      openProgress,
      resetProgress,
    ],
  );

  return (
    <GamificationContext.Provider value={value}>
      {status === "loading" ? (
        <AppLoading />
      ) : status === "auth" ? (
        <AuthScreen />
      ) : (
        <>
          <SiteHeader />
          {children}
          {panelOpen && <ProgressPanel onClose={closeProgress} />}
        </>
      )}
    </GamificationContext.Provider>
  );
}
