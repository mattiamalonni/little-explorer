"use client";

import { ArrowRight, Medal, Sparkles, Star, Trophy } from "lucide-react";
import { BadgeGlyph } from "@/features/gamification/components/badge-glyph";
import { useGamification } from "@/features/gamification/components/gamification-context";
import { badgeById, levelForStars, type RoundReward } from "@/features/gamification/lib/progress";

export function RoundRewards({ reward }: { reward: RoundReward | null }) {
  const { openProgress } = useGamification();
  if (!reward) return null;

  const newBadges = reward.newBadges.flatMap((id) => {
    const badge = badgeById(id);
    return badge ? [badge] : [];
  });
  const level = levelForStars(reward.totalStars);
  const levelledUp = reward.levelAfter > reward.levelBefore;

  return (
    <section className="gami-reward" aria-live="polite" aria-label="Ricompense della partita">
      <div className="gami-reward-stars">
        <span className="gami-reward-star" aria-hidden="true">
          <Star size={25} fill="currentColor" />
          <Sparkles className="gami-reward-spark" size={15} />
        </span>
        <div>
          <span className="gami-eyebrow">STELLE GUADAGNATE</span>
          <strong>+{reward.stars}</strong>
          <small>{reward.stars === 1 ? "stella" : "stelle"}</small>
        </div>
      </div>

      <div className="gami-reward-body">
        {reward.perfect ? (
          <p className="gami-reward-bonus">
            <Sparkles size={16} /> <strong>Bonus perfezione!</strong> Tre stelle in più per una partita senza errori.
          </p>
        ) : reward.stars > 0 ? (
          <p>Ogni risposta giusta è una stella. Continua così, un passo alla volta.</p>
        ) : (
          <p>Anche sbagliando si impara: la prossima partita porterà nuove stelle.</p>
        )}

        {levelledUp && (
          <p className="gami-levelup">
            <Trophy size={17} /> <strong>Nuovo livello {level.number}:</strong> {level.name}!
          </p>
        )}

        {newBadges.length > 0 && (
          <div className="gami-new-badges">
            <span className="gami-new-badges-label">
              <Medal size={16} /> {newBadges.length === 1 ? "Nuovo traguardo" : "Nuovi traguardi"}
            </span>
            <ul>
              {newBadges.map((badge) => (
                <li key={badge.id}>
                  <span className="gami-badge-icon">
                    <BadgeGlyph icon={badge.icon} size={19} />
                  </span>
                  <span>
                    <strong>{badge.title}</strong>
                    <small>{badge.description}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button type="button" className="gami-reward-button" onClick={openProgress}>
        Tutti i traguardi <ArrowRight size={16} />
      </button>
    </section>
  );
}
