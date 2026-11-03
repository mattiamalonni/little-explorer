"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthScreen } from "@/features/auth/components/auth-screen";
import { AppLoading } from "@/features/gamification/components/app-loading";
import { GamificationContext, type SessionUser, type SyncState } from "@/features/gamification/components/gamification-context";
import { ProgressPanel } from "@/features/gamification/components/progress-panel";
import {
  applyRound,
  clearProgress,
  createDefaultProgress,
  loadProgress,
  normalizeProgress,
  type Progress,
  type RoundReward,
} from "@/features/gamification/lib/progress";

type SessionPayload = {
  user: SessionUser;
  progress: unknown;
};

function hasMeaningfulProgress(progress: Progress): boolean {
  return (
    progress.stars > 0 ||
    progress.rounds > 0 ||
    progress.games.length > 0 ||
    progress.badges.length > 0 ||
    progress.correct.english + progress.correct.math + progress.correct.italian > 0
  );
}

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Progress>(createDefaultProgress);
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
  const pendingSaveRef = useRef<Progress | null>(null);
  const savingRef = useRef(false);

  const applySession = useCallback((payload: SessionPayload) => {
    const next = normalizeProgress(payload.progress);
    progressRef.current = next;
    rewardsRef.current.clear();
    pendingSaveRef.current = null;
    setProgress(next);
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

  const flushSave = useCallback(async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSyncState("saving");

    try {
      while (pendingSaveRef.current) {
        const next = pendingSaveRef.current;
        pendingSaveRef.current = null;

        try {
          const response = await fetch("/api/progress", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ progress: next }),
          });

          if (response.status === 401) {
            pendingSaveRef.current = null;
            setUser(null);
            setHydrated(false);
            setStatus("auth");
            setSyncState("idle");
            setAuthError("La sessione è scaduta. Entra di nuovo per ritrovare i tuoi progressi.");
            return;
          }

          if (!response.ok) {
            if (!pendingSaveRef.current) pendingSaveRef.current = next;
            setSyncState("error");
            return;
          }
        } catch {
          if (!pendingSaveRef.current) pendingSaveRef.current = next;
          setSyncState("error");
          return;
        }
      }

      setSyncState("saved");
    } finally {
      savingRef.current = false;
    }
  }, []);

  const queueSave = useCallback(
    (next: Progress) => {
      pendingSaveRef.current = next;
      void flushSave();
    },
    [flushSave],
  );

  const retrySave = useCallback(() => {
    if (!pendingSaveRef.current) pendingSaveRef.current = progressRef.current;
    void flushSave();
  }, [flushSave]);

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

    pendingSaveRef.current = null;
    const empty = createDefaultProgress();
    progressRef.current = empty;
    rewardsRef.current.clear();
    setProgress(empty);
    setUser(null);
    setHydrated(false);
    setStatus("auth");
    setPanelOpen(false);
    setSyncState("idle");
    setAuthError(null);
    setHasLegacyProgress(hasMeaningfulProgress(loadProgress()));
  }, []);

  const completeRound = useCallback(
    (input: Parameters<typeof applyRound>[1]) => {
      const cached = rewardsRef.current.get(input.roundId);
      if (cached) return cached;

      const result = applyRound(progressRef.current, input);
      progressRef.current = result.progress;
      rewardsRef.current.set(input.roundId, result.reward);
      setProgress(result.progress);
      queueSave(result.progress);
      return result.reward;
    },
    [queueSave],
  );

  const openProgress = useCallback(() => setPanelOpen(true), []);
  const closeProgress = useCallback(() => setPanelOpen(false), []);

  const resetProgress = useCallback(() => {
    const next = createDefaultProgress();
    progressRef.current = next;
    rewardsRef.current.clear();
    clearProgress();
    setProgress(next);
    queueSave(next);
  }, [queueSave]);

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
          {children}
          {panelOpen && <ProgressPanel onClose={closeProgress} />}
        </>
      )}
    </GamificationContext.Provider>
  );
}
