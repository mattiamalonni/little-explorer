"use client";

import { ArrowRight, Flame, Medal, Sparkles, Star, Trophy } from "lucide-react";
import { useGamification } from "@/features/gamification/components/gamification-context";
import { BADGE_COUNT, levelForStars, levelProgress, type World } from "@/features/gamification/lib/progress";

const WORLD_COPY: Record<World, (count: number) => string> = {
  english: (count) => `${count} risposte giuste in inglese`,
  math: (count) => `${count} calcoli risolti`,
  italian: (count) => `${count} risposte giuste in italiano`,
};

export function ProgressBanner({ world }: { world: World }) {
  const { progress, openProgress } = useGamification();
  const level = levelForStars(progress.stars);
  const percent = Math.round(levelProgress(progress.stars) * 100);

  return (
    <section className="gami-banner" aria-label="I tuoi progressi">
      <span className="gami-banner-mark" aria-hidden="true">
        <Star size={27} fill="currentColor" />
        <Sparkles className="gami-banner-spark" size={16} />
      </span>
      <div className="gami-banner-copy">
        <span className="gami-eyebrow">
          <Trophy size={13} /> IL TUO VIAGGIO · LIVELLO {level.number}
        </span>
        <h2>{level.name}</h2>
        <p>
          {progress.stars} stelle raccolte <span aria-hidden="true">·</span> {WORLD_COPY[world](progress.correct[world])}
        </p>
      </div>
      <div className="gami-banner-meter">
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
        <span>
          {level.next ? `${level.next.min - progress.stars} stelle al prossimo livello` : "Livello più alto raggiunto!"}
        </span>
      </div>
      <div className="gami-banner-side">
        <span className="gami-banner-stat">
          <Flame size={16} /> {progress.streak} {progress.streak === 1 ? "giorno" : "giorni"}
        </span>
        <span className="gami-banner-stat">
          <Medal size={16} /> {progress.badges.length}/{BADGE_COUNT}
        </span>
        <button type="button" className="gami-banner-button" onClick={openProgress}>
          Traguardi <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
