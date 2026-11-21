import assert from "node:assert/strict";
import test from "node:test";
import {
  applyRound,
  createDefaultProgress,
  dayKey,
  levelForStars,
  levelProgress,
  normalizeProgress,
  PERFECT_BONUS,
  type RoundInput,
} from "../src/features/gamification/lib/progress.ts";

function input(overrides: Partial<RoundInput> = {}): RoundInput {
  return { roundId: "r1", world: "english", gameId: "colors", correct: 4, total: 4, ...overrides };
}

test("partita perfetta: una stella per risposta più il bonus", () => {
  const { progress, reward } = applyRound(createDefaultProgress(), input());
  assert.equal(reward.stars, 4 + PERFECT_BONUS);
  assert.equal(progress.stars, 4 + PERFECT_BONUS);
  assert.equal(progress.rounds, 1);
  assert.equal(progress.perfectRounds, 1);
  assert.equal(progress.correct.english, 4);
  assert.deepEqual(progress.games, ["english:colors"]);
  assert.ok(reward.newBadges.includes("first-round"));
  assert.ok(reward.newBadges.includes("perfect-round"));
  assert.equal(reward.levelBefore, 1);
});

test("partita non perfetta non assegna bonus né badge della perfezione", () => {
  const { progress, reward } = applyRound(createDefaultProgress(), input({ correct: 2, total: 4 }));
  assert.equal(reward.stars, 2);
  assert.equal(progress.perfectRounds, 0);
  assert.ok(!reward.newBadges.includes("perfect-round"));
});

test("valori fuori intervallo vengono clampati senza falsare il conteggio dei round", () => {
  const tooMany = applyRound(createDefaultProgress(), input({ correct: 99, total: 3 }));
  assert.equal(tooMany.progress.correct.english, 3);
  assert.equal(tooMany.progress.rounds, 1);

  const zeroTotal = applyRound(createDefaultProgress(), input({ correct: 0, total: 0 }));
  assert.equal(zeroTotal.reward.perfect, false);
  assert.equal(zeroTotal.progress.stars, 0);

  const negative = applyRound(createDefaultProgress(), input({ correct: -5, total: 3 }));
  assert.equal(negative.progress.correct.english, 0);
});

test("badge e livelli non vengono assegnati due volte", () => {
  const first = applyRound(createDefaultProgress(), input()).progress;
  const second = applyRound(first, input({ roundId: "r2" }));
  assert.ok(!second.reward.newBadges.includes("first-round"));
  assert.equal(second.progress.badges.filter((id) => id === "first-round").length, 1);
  assert.ok(second.reward.levelAfter >= second.reward.levelBefore);
});

test("il mondo del round è quello corretto e i giochi restano unici", () => {
  const first = applyRound(createDefaultProgress(), input({ world: "math", gameId: "addition" })).progress;
  const second = applyRound(first, input({ roundId: "r2", world: "math", gameId: "addition" })).progress;
  assert.deepEqual(second.games, ["math:addition"]);
  assert.equal(second.correct.english, 0);
  assert.equal(second.correct.math, 8);
});

test("serie di giorni: consecutivi++, stesso giorno invariato, salto azzera", () => {
  const first = applyRound(createDefaultProgress(), input(), "2026-01-01").progress;
  assert.equal(first.streak, 1);

  const sameDay = applyRound(first, input({ roundId: "r2" }), "2026-01-01").progress;
  assert.equal(sameDay.streak, 1);

  const nextDay = applyRound(sameDay, input({ roundId: "r3" }), "2026-01-02").progress;
  assert.equal(nextDay.streak, 2);

  const gap = applyRound(nextDay, input({ roundId: "r4" }), "2026-01-04").progress;
  assert.equal(gap.streak, 1);
  assert.ok(!gap.badges.includes("streak-3"));
});

test("tre giorni consecutivi sbloccano il badge della serie", () => {
  const d1 = applyRound(createDefaultProgress(), input(), "2026-02-01").progress;
  const d2 = applyRound(d1, input({ roundId: "r2" }), "2026-02-02").progress;
  const d3 = applyRound(d2, input({ roundId: "r3" }), "2026-02-03");
  assert.equal(d3.progress.streak, 3);
  assert.ok(d3.reward.newBadges.includes("streak-3"));
});

test("levelForStars ai confini e levelProgress resta tra 0 e 1", () => {
  assert.equal(levelForStars(0).number, 1);
  assert.equal(levelForStars(11).number, 1);
  assert.equal(levelForStars(12).number, 2);
  assert.equal(levelForStars(200).next, null);
  assert.equal(levelProgress(0), 0);
  assert.equal(levelProgress(500), 1);
});

test("normalizeProgress scarta valori sporchi e badge sconosciuti", () => {
  const clean = normalizeProgress({
    stars: -10,
    rounds: 1.9,
    correct: { english: 3, math: "x", italian: null },
    games: ["english:colors", "english:colors", "bad", "math:addition"],
    badges: ["first-round", "first-round", "invented"],
    lastPlayed: "2026-01-01",
    extra: "ignorato",
  });
  assert.equal(clean.stars, 0);
  assert.equal(clean.rounds, 1);
  assert.equal(clean.correct.english, 3);
  assert.equal(clean.correct.math, 0);
  assert.deepEqual(clean.games, ["english:colors", "bad", "math:addition"]);
  assert.deepEqual(clean.badges, ["first-round"]);
  assert.equal(clean.lastPlayed, "2026-01-01");
  assert.equal(normalizeProgress(null).stars, 0);
  assert.equal(normalizeProgress({ lastPlayed: "01/01/2026" }).lastPlayed, null);
});

test("dayKey produce sempre una data yyyy-mm-dd", () => {
  assert.match(dayKey(new Date(2026, 0, 5)), /^2026-01-05$/);
});
