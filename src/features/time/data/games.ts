export type TimeGameId = "read" | "set" | "quarters" | "listen" | "mixed";
export type Minute = 0 | 15 | 30 | 45;

export type Game = {
  id: TimeGameId;
  title: string;
  subtitle: string;
  description: string;
  example: string[];
};

export const ROUND_LENGTH = 6;
export const minutes: readonly Minute[] = [0, 15, 30, 45];

const hourWords = [
  "",
  "una",
  "due",
  "tre",
  "quattro",
  "cinque",
  "sei",
  "sette",
  "otto",
  "nove",
  "dieci",
  "undici",
  "dodici",
] as const;

export type Entry = {
  id: string;
  hour: number;
};

export const entries: Entry[] = Array.from({ length: 12 }, (_, index) => {
  const hour = index + 1;
  return {
    id: `h${hour}`,
    hour,
  };
});

export const games: Game[] = [
  {
    id: "read",
    title: "Che ore sono?",
    subtitle: "Leggi l'orologio",
    description: "Guarda le lancette e scegli l'ora giusta, tra in punto, e mezza e i quarti.",
    example: ["3:30"],
  },
  {
    id: "set",
    title: "Trova l'orologio",
    subtitle: "Dall'ora al quadrante",
    description: "Leggi la frase e scegli l'orologio che mostra proprio quell'ora.",
    example: ["7:15"],
  },
  {
    id: "quarters",
    title: "Quarto o mezza?",
    subtitle: "I quarti dell'ora",
    description: "Riconosci in punto, e un quarto, e mezza e meno un quarto.",
    example: ["4:45"],
  },
  {
    id: "listen",
    title: "Ascolta e scegli",
    subtitle: "Solo ascolto",
    description: "Ascolta l'ora letta dalla voce e trova il quadrante giusto.",
    example: ["9:00"],
  },
  {
    id: "mixed",
    title: "Tutto l'orologio",
    subtitle: "Un po' di tutto",
    description: "Leggi, ascolta e riconosci i quarti in un unico gioco.",
    example: ["6:30"],
  },
];

export const gameStickers: Record<TimeGameId, string> = {
  read: "Guarda le lancette",
  set: "Leggi e cerca",
  quarters: "Un quarto alla volta",
  listen: "Orecchie attente",
  mixed: "Ore e quarti",
};

export function getGame(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}

export function timePhrase(hour: number, minute: Minute): string {
  const safeHour = ((hour - 1 + 12) % 12) + 1;
  if (minute === 0) return `${hourWords[safeHour]} in punto`;
  if (minute === 15) return `${hourWords[safeHour]} e un quarto`;
  if (minute === 30) return `${hourWords[safeHour]} e mezza`;
  return `${hourWords[(safeHour % 12) + 1]} meno un quarto`;
}

export function spokenTime(hour: number, minute: Minute): string {
  const phrase = timePhrase(hour, minute);
  const one = (hour === 1 && minute !== 45) || (hour === 12 && minute === 45);
  return `${one ? "È l'" : "Sono le "}${phrase}.`;
}

export function clockKey(hour: number, minute: Minute): string {
  return `${hour}-${minute}`;
}

export function parseClockKey(key: string): { hour: number; minute: Minute } | null {
  const [rawHour, rawMinute] = key.split("-");
  const hour = Number(rawHour);
  const minute = Number(rawMinute);
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) return null;
  if (!minutes.includes(minute as Minute)) return null;
  return { hour, minute: minute as Minute };
}

export type AnswerMode = "phrase" | "clock" | "quarter";

export type Question = {
  id: string;
  gameId: TimeGameId;
  mode: AnswerMode;
  entryId: string;
  hour: number;
  minute: Minute;
  phrase: string;
  spoken: string;
  options: string[];
  answer: string;
};

export type Answer = {
  question: Question;
  selected: string;
  correct: boolean;
};

export type Round = {
  id: string;
  gameId: TimeGameId;
  questions: Question[];
  answers: Answer[];
  selection: string[];
  roundLength: number;
};

export type RoundConfig = {
  selected?: readonly string[];
  roundLength?: number;
};

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function resolveHours(selection: readonly string[] | undefined): Entry[] {
  const known = new Set(entries.map((entry) => entry.id));
  const selected = new Set((selection ?? []).filter((id) => known.has(id)));
  const chosen = entries.filter((entry) => selected.has(entry.id));
  return chosen.length >= 4 ? chosen : [...entries];
}

function timesFor(hour: number, minute: Minute, random: () => number): { hour: number; minute: Minute }[] {
  const otherMinutes = shuffle(
    minutes.filter((value) => value !== minute),
    random,
  ).slice(0, 2);
  const otherHours = Array.from({ length: 12 }, (_, index) => index + 1).filter((value) => value !== hour);
  const otherHour = otherHours[Math.floor(random() * otherHours.length)];
  return shuffle(
    [{ hour, minute }, ...otherMinutes.map((value) => ({ hour, minute: value })), { hour: otherHour, minute }],
    random,
  );
}

function createQuestion(
  gameId: TimeGameId,
  entry: Entry,
  minute: Minute,
  mode: AnswerMode,
  index: number,
  random: () => number,
): Question {
  const phrase = timePhrase(entry.hour, minute);
  let options: string[];
  let answer: string;

  if (mode === "quarter") {
    options = shuffle(
      minutes.map((value) => timePhrase(entry.hour, value)),
      random,
    );
    answer = phrase;
  } else {
    const times = timesFor(entry.hour, minute, random);
    options = times.map((time) => (mode === "clock" ? clockKey(time.hour, time.minute) : timePhrase(time.hour, time.minute)));
    answer = mode === "clock" ? clockKey(entry.hour, minute) : phrase;
  }

  return {
    id: `question-${gameId}-${index}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    mode,
    entryId: entry.id,
    hour: entry.hour,
    minute,
    phrase,
    spoken: spokenTime(entry.hour, minute),
    options,
    answer,
  };
}

const modeByGame: Record<Exclude<TimeGameId, "mixed">, AnswerMode> = {
  read: "phrase",
  set: "clock",
  quarters: "quarter",
  listen: "clock",
};

const mixedModes: AnswerMode[] = ["phrase", "clock", "quarter"];

export function createRound(
  gameId: TimeGameId,
  config: RoundConfig = {},
  previous?: Round,
  random: () => number = Math.random,
): Round {
  const game = getGame(gameId);
  if (!game) throw new Error("Gioco non valido.");

  const selection = resolveHours(config.selected);
  const length = Math.min(10, Math.max(4, Math.floor(config.roundLength ?? ROUND_LENGTH)));
  const hourCycle: Entry[] = [];
  const randomHours = shuffle(selection, random);
  while (hourCycle.length < length) hourCycle.push(...shuffle(randomHours, random));

  const minuteCycle = shuffle(minutes, random);
  const modeOffset = Math.floor(random() * mixedModes.length);

  const questions = hourCycle.slice(0, length).map((entry, index) => {
    const minute = minuteCycle[index % minuteCycle.length];
    const mode =
      gameId === "mixed"
        ? mixedModes[(index + modeOffset) % mixedModes.length]
        : modeByGame[gameId as Exclude<TimeGameId, "mixed">];
    return createQuestion(gameId, entry, minute, mode, index, random);
  });

  if (previous?.gameId === gameId && questions.length > 1 && questions[0].answer === previous.questions[0]?.answer) {
    [questions[0], questions[1]] = [questions[1], questions[0]];
  }

  return {
    id: `round-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    questions,
    answers: [],
    selection: selection.map((entry) => entry.id),
    roundLength: length,
  };
}

export function recordAnswer(round: Round, selected: string): Round {
  const question = round.questions[round.answers.length];
  if (!question || !question.options.includes(selected)) {
    throw new Error("Risposta non valida per la domanda corrente.");
  }
  return {
    ...round,
    answers: [
      ...round.answers,
      {
        question,
        selected,
        correct: selected === question.answer,
      },
    ],
  };
}

export function scoreRound(answers: readonly Answer[]): number {
  return answers.filter((answer) => answer.correct).length;
}

export function selectedLabel(question: Question, selected: string): string {
  if (question.mode !== "clock") return selected;
  const time = parseClockKey(selected);
  return time ? timePhrase(time.hour, time.minute) : selected;
}

export function explanation(question: Question): string {
  const { hour, minute } = question;
  const longHand = minute === 0 ? 12 : minute / 5;
  if (question.mode === "quarter") {
    return `La lancetta lunga è sul ${longHand}: ${question.phrase}.`;
  }
  const thisHour = hour === 1 ? "l'una" : `le ${hourWords[hour]}`;
  const nextHour = hour === 12 ? "l'una" : `le ${hourWords[hour + 1]}`;
  if (minute === 0) {
    return `La lancetta corta segna ${thisHour}, quella lunga è sul 12. ${spokenTime(hour, minute)}`;
  }
  if (minute === 15) {
    return `La lancetta corta è poco dopo ${thisHour}, quella lunga è sul 3. ${spokenTime(hour, minute)}`;
  }
  if (minute === 30) {
    return `La lancetta corta è a metà tra ${thisHour} e ${nextHour}, quella lunga è sul 6. ${spokenTime(hour, minute)}`;
  }
  return `La lancetta corta è quasi ${nextHour}, quella lunga è sul 9. ${spokenTime(hour, minute)}`;
}
