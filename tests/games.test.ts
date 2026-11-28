import assert from "node:assert/strict";
import test from "node:test";
import { audioFilename, wordAudioPath } from "../src/features/english/lib/audio.ts";
import {
  WORD_CATEGORY_IDS,
  categoryOf,
  createRound as createEnglishRound,
  games as englishGames,
  scoreRound as scoreEnglishRound,
  wordCategories,
  wordKey,
} from "../src/features/english/data/games.ts";
import { createRound as createMathRound, recordAnswer, scoreRound as scoreMathRound } from "../src/features/math/data/games.ts";

const fixedRandom = () => 0.42;

test("English: createRound produce il numero richiesto di domande con quattro opzioni", () => {
  const round = createEnglishRound("words", { length: 5 }, undefined, fixedRandom);
  assert.equal(round.questions.length, 5);
  assert.equal(round.roundLength, 5);
  for (const question of round.questions) {
    assert.equal(question.options.length, 4);
    assert.ok(question.options.some((option) => option.english === question.word.english));
  }
});

test("English: la prima domanda non si ripete rispetto al round precedente", () => {
  const first = createEnglishRound("words", { length: 6 }, undefined, fixedRandom);
  const second = createEnglishRound("words", { length: 6 }, first, fixedRandom);
  assert.notEqual(second.questions[0].word.english, first.questions[0].word.english);
});

test("English: scoreRound conta solo le risposte giuste", () => {
  const round = createEnglishRound("words", { length: 4 }, undefined, fixedRandom);
  const answers = round.questions.map((question, index) => ({
    word: question.word,
    selected: index === 0 ? question.options.find((option) => option.english !== question.word.english)! : question.word,
  }));
  assert.equal(scoreEnglishRound(answers), 3);
  assert.equal(scoreEnglishRound([]), 0);
});

test("English: Indovina la parola raccoglie tutte le categorie di parole singole", () => {
  const words = englishGames.find((game) => game.id === "words")!;
  assert.equal(wordCategories.length, WORD_CATEGORY_IDS.length);
  for (const category of wordCategories) {
    assert.ok(!englishGames.some((game) => game.id === category.id), `${category.id} non è più un gioco a parte`);
    const own = words.words.filter((word) => word.category === category.id);
    assert.equal(own.length, category.words.length, category.id);
  }
  const keys = words.words.map(wordKey);
  assert.equal(new Set(keys).size, keys.length, "chiavi uniche anche per Book in oggetti e classe");
});

test("English: nel gioco misto le alternative vengono dalla stessa categoria", () => {
  for (let seed = 0; seed < 30; seed++) {
    let state = seed + 1;
    const random = () => ((state = (state * 16807) % 2147483647) - 1) / 2147483646;
    const round = createEnglishRound("words", { length: 10 }, undefined, random);
    const english = round.questions.map((question) => question.word.english);
    assert.equal(new Set(english).size, english.length, "nessuna parola ripetuta nel round");
    for (const question of round.questions) {
      assert.equal(question.options.length, 4);
      assert.equal(new Set(question.options.map((option) => option.english)).size, 4);
      for (const option of question.options) assert.equal(option.category, question.word.category);
      assert.ok(categoryOf(question.word));
    }
  }
});

test("English: con una sola parola scelta per categoria le alternative si completano dalla categoria", () => {
  const words = englishGames.find((game) => game.id === "words")!;
  const picked = ["colors", "animals", "food", "numbers"].map((id) => wordKey(words.words.find((word) => word.category === id)!));
  const round = createEnglishRound("words", { words: picked, length: 4 }, undefined, fixedRandom);
  assert.deepEqual([...round.selection].sort(), [...picked].sort());
  for (const question of round.questions) {
    assert.equal(question.options.length, 4);
    for (const option of question.options) assert.equal(option.category, question.word.category);
  }
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
