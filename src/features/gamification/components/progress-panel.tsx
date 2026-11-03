"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Calculator,
  Check,
  Cloud,
  CloudOff,
  Flame,
  Languages,
  Lock,
  LogOut,
  Medal,
  RefreshCw,
  Sparkles,
  Star,
  Trophy,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { BadgeGlyph } from "@/features/gamification/components/badge-glyph";
import { useGamification } from "@/features/gamification/components/gamification-context";
import { BADGES, BADGE_COUNT, levelForStars, levelProgress, type World } from "@/features/gamification/lib/progress";

const WORLD_STATS: { world: World; label: string; icon: LucideIcon }[] = [
  { world: "english", label: "Inglese", icon: BookOpen },
  { world: "math", label: "Matematica", icon: Calculator },
  { world: "italian", label: "Italiano", icon: Languages },
];

export function ProgressPanel({ onClose }: { onClose: () => void }) {
  const { progress, resetProgress, user, logout, syncState, retrySave } = useGamification();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const level = levelForStars(progress.stars);
  const percent = Math.round(levelProgress(progress.stars) * 100);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="gami-overlay">
      <button type="button" className="gami-backdrop" aria-label="Chiudi i traguardi" onClick={onClose} />
      <div
        className="gami-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gami-panel-title"
        aria-describedby="gami-panel-description"
      >
        <header className="gami-panel-header">
          <div>
            <span className="gami-eyebrow">IL TUO PASSAPORTO</span>
            <h2 id="gami-panel-title">Stelle e traguardi</h2>
            <p id="gami-panel-description">Ogni partita lascia una piccola traccia del tuo viaggio.</p>
          </div>
          <button ref={closeRef} type="button" className="gami-close" onClick={onClose} aria-label="Chiudi">
            <X size={21} />
          </button>
        </header>

        <section className="gami-account" aria-label="Il tuo account">
          <span className="gami-account-avatar" aria-hidden="true">
            <UserRound size={20} />
          </span>
          <div className="gami-account-copy">
            <span className="gami-eyebrow">IL TUO NOME</span>
            <strong>{user?.name ?? "Esploratore"}</strong>
          </div>
          <div className="gami-account-actions">
            <span className={`gami-sync is-${syncState}`} role="status">
              {syncState === "error" ? (
                <>
                  <CloudOff size={14} /> Progressi da salvare
                </>
              ) : syncState === "saving" ? (
                <>
                  <Cloud size={14} /> Salvataggio…
                </>
              ) : (
                <>
                  <Cloud size={14} /> Progressi salvati
                </>
              )}
            </span>
            {syncState === "error" && (
              <button type="button" className="gami-retry" onClick={retrySave}>
                <RefreshCw size={13} /> Riprova
              </button>
            )}
            <button type="button" className="gami-logout" onClick={() => void logout()}>
              <LogOut size={14} /> Esci
            </button>
          </div>
        </section>

        <section className="gami-level" aria-label={`Livello ${level.number}: ${level.name}`}>
          <span className="gami-level-mark" aria-hidden="true">
            <Star size={26} fill="currentColor" />
          </span>
          <div className="gami-level-copy">
            <span className="gami-eyebrow">LIVELLO {level.number}</span>
            <h3>{level.name}</h3>
          </div>
          <span className="gami-level-total">
            <strong>{progress.stars}</strong> stelle
          </span>
        </section>

        <div
          className="gami-bar"
          role="progressbar"
          aria-label="Stelle verso il prossimo livello"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <span style={{ width: `${percent}%` }} />
        </div>
        <p className="gami-level-next">
          {level.next
            ? `${level.next.min - progress.stars} stelle per diventare “${level.next.name}”.`
            : "Hai raggiunto il livello più alto. Continua a curiosare!"}
        </p>

        <div className="gami-quick-stats">
          <span>
            <Trophy size={17} /> <strong>{progress.rounds}</strong> partite
          </span>
          <span>
            <Flame size={17} /> <strong>{progress.streak}</strong> giorni di fila
          </span>
          <span>
            <Star size={17} /> <strong>{progress.stars}</strong> stelle
          </span>
          <span>
            <Medal size={17} /> <strong>{progress.badges.length}</strong>/{BADGE_COUNT} traguardi
          </span>
        </div>

        <section className="gami-world-stats" aria-label="Risposte giuste per mondo">
          {WORLD_STATS.map(({ world, label, icon: Icon }) => (
            <span key={world}>
              <Icon size={18} aria-hidden="true" />
              <span>{label}</span>
              <strong>{progress.correct[world]}</strong>
            </span>
          ))}
        </section>

        <section className="gami-badges-section" aria-labelledby="gami-badges-title">
          <div className="gami-section-heading">
            <h3 id="gami-badges-title">I traguardi</h3>
            <span>
              {progress.badges.length} di {BADGE_COUNT} sbloccati
            </span>
          </div>
          <ul className="gami-badges">
            {BADGES.map((badge) => {
              const unlocked = progress.badges.includes(badge.id);
              return (
                <li key={badge.id} className={`gami-badge ${unlocked ? "is-unlocked" : "is-locked"}`}>
                  <span className="gami-badge-icon">
                    <BadgeGlyph icon={badge.icon} />
                  </span>
                  <span className="gami-badge-copy">
                    <strong>{badge.title}</strong>
                    <small>{badge.description}</small>
                  </span>
                  <span className="gami-badge-state" role="img" aria-label={unlocked ? "Sbloccato" : "Da sbloccare"}>
                    {unlocked ? <Check size={17} /> : <Lock size={15} />}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <footer className="gami-panel-footer">
          <p>
            <Sparkles size={15} /> Stelle e traguardi sono nel tuo account: li ritrovi su ogni dispositivo.
          </p>
          <div className="gami-reset">
            {confirmingReset ? (
              <>
                <button
                  type="button"
                  className="gami-reset-confirm"
                  onClick={() => {
                    resetProgress();
                    setConfirmingReset(false);
                  }}
                >
                  Sì, azzera tutto
                </button>
                <button type="button" className="gami-reset-cancel" onClick={() => setConfirmingReset(false)}>
                  Annulla
                </button>
              </>
            ) : (
              <button type="button" className="gami-reset-button" onClick={() => setConfirmingReset(true)}>
                Azzera i progressi
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
