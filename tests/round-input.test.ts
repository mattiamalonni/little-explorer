import assert from "node:assert/strict";
import test from "node:test";
import { parseRoundInput } from "../src/features/gamification/lib/round-input.ts";

const valid = {
  roundId: "round-123",
  world: "english",
  gameId: "colors",
  correct: 3,
  total: 4,
};

test("accetta un delta valido e non trascina altri campi", () => {
  const result = parseRoundInput({ ...valid, stars: 999999, badges: ["crown"] });
  assert.deepEqual(result, valid);
});

test("accetta tutti i mondi conosciuti", () => {
  for (const world of ["english", "math", "italian", "time", "logic"]) {
    assert.equal(parseRoundInput({ ...valid, world })?.world, world);
  }
});

test("rigetta payload non oggetto o mancanti", () => {
  for (const value of [null, undefined, [], 42, "round", {}, { ...valid, world: undefined }]) {
    assert.equal(parseRoundInput(value), null);
  }
});

test("rigetta identificativi vuoti, troppo lunghi o con tipo sbagliato", () => {
  assert.equal(parseRoundInput({ ...valid, roundId: "" }), null);
  assert.equal(parseRoundInput({ ...valid, roundId: "x".repeat(101) }), null);
  assert.equal(parseRoundInput({ ...valid, roundId: 7 }), null);
  assert.equal(parseRoundInput({ ...valid, gameId: "" }), null);
  assert.equal(parseRoundInput({ ...valid, gameId: "c".repeat(101) }), null);
});

test("rigetta mondo sconosciuto", () => {
  assert.equal(parseRoundInput({ ...valid, world: "francese" }), null);
  assert.equal(parseRoundInput({ ...valid, world: 1 }), null);
});

test("rigetta totali e punteggi non interi o fuori intervallo", () => {
  assert.equal(parseRoundInput({ ...valid, total: 0 }), null);
  assert.equal(parseRoundInput({ ...valid, total: 1001 }), null);
  assert.equal(parseRoundInput({ ...valid, total: 4.5 }), null);
  assert.equal(parseRoundInput({ ...valid, total: Number.NaN }), null);
  assert.equal(parseRoundInput({ ...valid, correct: -1 }), null);
  assert.equal(parseRoundInput({ ...valid, correct: 5 }), null);
  assert.equal(parseRoundInput({ ...valid, correct: 2.5 }), null);
  assert.equal(parseRoundInput({ ...valid, correct: Infinity }), null);
});
