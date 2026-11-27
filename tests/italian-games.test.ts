import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import test from "node:test";
import { createRound, games, hasSound, isAnswerCorrect, pickEntries, splitWord } from "../src/features/italian/data/games.ts";

const gli = games.find((game) => game.id === "gli")!;
const sillabe = games.find((game) => game.id === "sillabe")!;

function seeded(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

test("Italiano: ogni voce ha id unici e alternative diverse dalla risposta", () => {
  for (const game of games) {
    const ids = game.entries.map((entry) => entry.id);
    assert.equal(new Set(ids).size, ids.length, `id duplicati in ${game.id}`);
    for (const entry of game.entries) {
      assert.equal(entry.options.length, game.id === "gli-li" ? 1 : 3, `${game.id}/${entry.id}`);
      assert.equal(new Set([entry.answer, ...entry.options]).size, entry.options.length + 1, `${game.id}/${entry.id}`);
    }
  }
});

test("Italiano: ogni immagine usata esiste in public/illustrations", () => {
  for (const game of games) {
    for (const entry of game.entries) {
      if (!entry.image) continue;
      assert.ok(existsSync(`public/illustrations/${entry.image}.svg`), `${game.id}/${entry.id}: ${entry.image}`);
    }
  }
});

test("Italiano: nei giochi a lettere la parola completa la traccia", () => {
  for (const game of games.filter((entry) => entry.mode === "letters")) {
    for (const entry of game.entries) {
      assert.equal(
        entry.pattern.replace("__", entry.answer).toLowerCase(),
        entry.solution.toLowerCase(),
        `${game.id}/${entry.id}`,
      );
    }
  }
});

test("Sillabe: tutte le divisioni usano le lettere della parola, ma solo una è giusta", () => {
  assert.ok(sillabe.entries.length >= 50);
  for (const entry of sillabe.entries) {
    const word = entry.pattern.toLowerCase();
    assert.equal(entry.answer.replaceAll("-", ""), word, entry.id);
    for (const option of entry.options) {
      assert.equal(option.replaceAll("-", ""), word, `${entry.id}: ${option}`);
      assert.equal(isAnswerCorrect(sillabe, entry, option), false, `${entry.id}: ${option}`);
    }
    assert.ok(isAnswerCorrect(sillabe, entry, entry.answer));
  }
});

for (const [gameId, sound] of [
  ["gn", ["GN"]],
  ["gli", ["GLI"]],
  ["sc", ["SC", "SCH"]],
  ["gli-li", ["GLI"]],
] as const) {
  test(`${gameId.toUpperCase()}: ogni round mescola parole con il suono e parole tranello`, () => {
    const game = games.find((entry) => entry.id === gameId)!;
    assert.deepEqual(game.targets, sound);
    const traps = game.entries.filter((entry) => !hasSound(game, entry));
    assert.ok(traps.length >= 10, `${gameId}: servono almeno 10 tranelli`);
    const random = seeded(7);
    for (let run = 0; run < 50; run++) {
      const round = createRound(gameId, { length: 6 }, undefined, random);
      const withSound = round.questions.filter((question) => hasSound(game, question.entry)).length;
      assert.equal(round.questions.length, 6);
      assert.equal(withSound, 3);
    }
  });
}

test("GLI: con poche voci scelte il round resta completo", () => {
  const onlyTargets = gli.entries.filter((entry) => entry.answer === "GLI").slice(0, 4);
  const oneTrap = gli.entries.find((entry) => entry.answer !== "GLI")!;
  const picked = pickEntries(gli, [...onlyTargets, oneTrap], 5, () => 0.42);
  assert.equal(picked.length, 5);
  assert.equal(picked.filter((entry) => entry.answer !== "GLI").length, 1);
});

test("Sillabe: le stanghette del bambino diventano la divisione da controllare", () => {
  assert.equal(splitWord("CASA", [1]), "ca-sa");
  assert.equal(splitWord("GATTO", [2]), "gat-to");
  assert.equal(splitWord("CASA", [1, 3]), "ca-sa");
  assert.equal(splitWord("CASA", []), "casa");
  for (const entry of sillabe.entries) {
    const cuts: number[] = [];
    let position = -1;
    for (const syllable of entry.answer.split("-").slice(0, -1)) {
      position += Array.from(syllable).length;
      cuts.push(position);
    }
    assert.ok(isAnswerCorrect(sillabe, entry, splitWord(entry.pattern, cuts)), entry.id);
  }
});

test("GLI o LI: ogni parola ha una sola alternativa, uguale tranne GLI/LI", () => {
  const game = games.find((entry) => entry.id === "gli-li")!;
  for (const entry of game.entries) {
    const [wrong] = entry.options;
    const fixed = hasSound(game, entry)
      ? wrong.replace(/li/i, (m) => (m === "LI" ? "GLI" : "gli"))
      : wrong.replace(/gli/i, (m) => m.slice(1));
    assert.equal(fixed, entry.answer, entry.id);
    assert.equal(isAnswerCorrect(game, entry, wrong), false, entry.id);
  }
});
