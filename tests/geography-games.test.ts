import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { createRound, distractors, games, scoreRound } from "../src/features/geography/data/games.ts";

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

test("Geografia: quattro giochi, ognuno con almeno dieci voci e id unici", () => {
  assert.equal(games.length, 4);
  for (const game of games) {
    assert.ok(game.entries.length >= 10, `${game.id}: ${game.entries.length}`);
    const ids = game.entries.map((entry) => entry.id);
    assert.equal(new Set(ids).size, ids.length, game.id);
  }
});

test("Geografia: ogni voce ha un'immagine esistente o la rosa dei venti", () => {
  for (const game of games) {
    for (const entry of game.entries) {
      assert.ok(entry.image || entry.compass, `${game.id}/${entry.id}`);
      if (entry.image) assert.ok(existsSync(`public/illustrations/${entry.image}.svg`), `${game.id}/${entry.id}: ${entry.image}`);
    }
  }
});

test("Geografia: tre alternative diverse tra loro e dalla risposta", () => {
  const random = seeded(11);
  for (const game of games) {
    for (const entry of game.entries) {
      const wrong = distractors(game, entry, random);
      assert.equal(wrong.length, 3, `${game.id}/${entry.id}`);
      assert.equal(new Set([entry.answer, ...wrong]).size, 4, `${game.id}/${entry.id}`);
    }
  }
});

test("Geografia: createRound rispetta lunghezza e voci scelte", () => {
  const round = createRound("bandiere", { length: 6 }, undefined, seeded(3));
  assert.equal(round.questions.length, 6);
  for (const question of round.questions) {
    assert.equal(question.options.length, 4);
    assert.ok(question.options.includes(question.entry.answer));
  }
  const chosen = createRound("paesaggi", { entries: ["mare", "lago", "fiume", "isola"], length: 10 }, undefined, seeded(5));
  assert.equal(chosen.questions.length, 4);
  assert.ok(chosen.questions.every((question) => ["mare", "lago", "fiume", "isola"].includes(question.entry.id)));
  const answers = chosen.questions.map((question, index) => ({
    entry: question.entry,
    selected: question.entry.answer,
    correct: index > 0,
  }));
  assert.equal(scoreRound(answers), 3);
});
