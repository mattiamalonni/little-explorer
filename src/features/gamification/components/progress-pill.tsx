"use client";

import { Star } from "lucide-react";
import { useGamification } from "@/features/gamification/components/gamification-context";
import { levelForStars } from "@/features/gamification/lib/progress";

export function ProgressPill() {
  const { progress, openProgress } = useGamification();
  const level = levelForStars(progress.stars);
  const starLabel = progress.stars === 1 ? "stella" : "stelle";

  return (
    <button
      type="button"
      className="gami-pill"
      onClick={openProgress}
      aria-haspopup="dialog"
      aria-label={`${progress.stars} ${starLabel}, livello ${level.number}: ${level.name}. Apri i traguardi.`}
    >
      <span className="gami-pill-icon" aria-hidden="true">
        <Star size={16} fill="currentColor" />
      </span>
      <strong>{progress.stars}</strong>
      <span className="gami-pill-label">
        {starLabel}
        <span className="gami-pill-dot" aria-hidden="true">
          ·
        </span>
        <span className="gami-pill-level">{level.name}</span>
      </span>
    </button>
  );
}
