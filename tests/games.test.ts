import assert from "node:assert/strict";
import test from "node:test";
import { audioFilename, wordAudioPath } from "../src/features/english/lib/audio.ts";
import { createRound as createEnglishRound, scoreRound as scoreEnglishRound } from "../src/features/english/data/games.ts";
import { createRound as createMathRound, recordAnswer, scoreRound as scoreMathRound } from "../src/features/math/data/games.ts";

const fixedRandom = () => 0.42;

test("English: createRound produce il numero richiesto di domande con quattro opzioni", () => {
  const round = createEnglishRound("colors", { length: 5 }, undefined, fixedRandom);
  assert.equal(round.questions.length, 5);
  assert.equal(round.roundLength, 5);
  for (const question of round.questions) {
    assert.equal(question.options.length, 4);
    assert.ok(question.options.some((option) => option.english === question.word.english));
  }
});

test("English: la prima domanda non si ripete rispetto al round precedente", () => {
  const first = createEnglishRound("colors", { length: 6 }, undefined, fixedRandom);
  const second = createEnglishRound("colors", { length: 6 }, first, fixedRandom);
  assert.notEqual(second.questions[0].word.english, first.questions[0].word.english);
});

test("English: scoreRound conta solo le risposte giuste", () => {
  const round = createEnglishRound("colors", { length: 4 }, undefined, fixedRandom);
  const answers = round.questions.map((question, index) => ({
    word: question.word,
    selected: index === 0 ? question.options.find((option) => option.english !== question.word.english)! : question.word,
  }));
  assert.equal(scoreEnglishRound(answers), 3);
  assert.equal(scoreEnglishRound([]), 0);
});

test("English: audioFilename produce slug coerenti con gli MP3", () => {
  assert.equal(audioFilename("I'm happy"), "i-m-happy.mp3");
  assert.equal(audioFilename("You aren't sad"), "you-aren-t-sad.mp3");
  assert.equal(wordAudioPath("Red"), "/audio/english/red.mp3");
});

test("Math: limiti e lunghezza del round vengono rispettati", () => {
  const round = createMathRound("addition", 10, { length: 6 }, undefined, fixedRandom);
  assert.equal(round.questions.length, 6);
  for (const question of round.questions) {
    assert.ok(question.a + question.b >= 0);
    assert.ok(Math.max(question.a, question.b) <= 10);
    assert.ok(question.options.includes(question.result));
  }
});

test("Math: recordAnswer rifiuta domande fuori ordine e calcola il punteggio", () => {
  const round = createMathRound("addition", 10, { length: 4 }, undefined, fixedRandom);
  const firstQuestion = round.questions[0];
  const answered = recordAnswer(round, firstQuestion.id, firstQuestion.result);
  assert.equal(answered.answers.length, 1);
  assert.equal(answered.answers[0].selected, firstQuestion.result);

  const wrong = recordAnswer(
    round,
    firstQuestion.id,
    firstQuestion.options.find((value) => value !== firstQuestion.result)!,
  );
  assert.equal(scoreMathRound(wrong.answers), 0);
  assert.equal(scoreMathRound(answered.answers), 1);
  assert.throws(() => recordAnswer(round, "id-inesistente", 1));
});
