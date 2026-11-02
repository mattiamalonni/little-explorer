export type Operation = "addition" | "subtraction";
export type GameId = Operation | "mixed";
export type Limit = 10 | 20 | 100;
export type Game = {
  id: GameId;
  title: string;
  subtitle: string;
  description: string;
  example: string[];
};

export const ROUND_LENGTH = 6;
export const limits: Limit[] = [10, 20, 100];
export const games: Game[] = [
  {
    id: "addition",
    title: "Mettiamo insieme!",
    subtitle: "Addizioni",
    description: "Unisci i numeri e scopri quanto fanno.",
    example: ["3", "+", "2"],
  },
  {
    id: "subtraction",
    title: "Quanto rimane?",
    subtitle: "Sottrazioni",
    description: "Togli un pezzetto, trova quello che resta.",
    example: ["8", "\u2212", "3"],
  },
  {
    id: "mixed",
    title: "Un po\u2019 pi\u00f9, un po\u2019 meno!",
    subtitle: "Modalit\u00e0 mista",
    description: "Tre addizioni e tre sottrazioni, tutte mescolate.",
    example: ["+", "?", "\u2212"],
  },
];

export type Problem = {
  id: string;
  a: number;
  b: number;
  gameId: Operation;
  result: number;
};
export type Question = Problem & { options: number[] };
export type Answer = { question: Question; selected: number };
export type Round = {
  gameId: GameId;
  limit: Limit;
  questions: Question[];
  answers: Answer[];
};

export function getGame(id: string) {
  return games.find((game) => game.id === id);
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createProblems(gameId: GameId, limit: Limit): Problem[] {
  if (!getGame(gameId) || !limits.includes(limit)) {
    throw new Error("Gioco o livello non valido.");
  }
  if (gameId === "mixed") {
    return [...createProblems("addition", limit), ...createProblems("subtraction", limit)];
  }
  const problems: Problem[] = [];
  for (let a = 1; a <= limit; a++) {
    for (let b = 1; b <= a; b++) {
      const result = gameId === "addition" ? a + b : a - b;
      if (result <= limit) {
        problems.push({ id: `${gameId}-${a}-${b}`, a, b, gameId, result });
      }
    }
  }
  return problems;
}

export function createRound(gameId: GameId, limit: Limit, previous?: Round, random: () => number = Math.random): Round {
  const problems = createProblems(gameId, limit);
  const pool =
    gameId === "mixed"
      ? shuffle(
          [
            ...shuffle(
              problems.filter((problem) => problem.gameId === "addition"),
              random,
            ).slice(0, ROUND_LENGTH / 2),
            ...shuffle(
              problems.filter((problem) => problem.gameId === "subtraction"),
              random,
            ).slice(0, ROUND_LENGTH / 2),
          ],
          random,
        )
      : shuffle(problems, random);
  if (previous?.gameId === gameId && previous.limit === limit && pool[0].id === previous.questions[0]?.id) {
    [pool[0], pool[1]] = [pool[1], pool[0]];
  }
  const questions = pool.slice(0, ROUND_LENGTH).map((problem) => {
    const nearby = Array.from({ length: limit + 1 }, (_, index) => index).filter(
      (value) => value !== problem.result && Math.abs(value - problem.result) <= 10,
    );
    const distractors = shuffle(nearby, random).slice(0, 3);
    return {
      ...problem,
      options: shuffle([problem.result, ...distractors], random),
    };
  });
  return { gameId, limit, questions, answers: [] };
}

export function recordAnswer(round: Round, questionId: string, selected: number): Round {
  const question = round.questions[round.answers.length];
  if (!question || question.id !== questionId || !question.options.includes(selected)) {
    throw new Error("Risposta non valida per la domanda corrente.");
  }
  return { ...round, answers: [...round.answers, { question, selected }] };
}

export function scoreRound(answers: readonly Answer[]): number {
  return answers.filter(({ question, selected }) => question.result === selected).length;
}

export function equation(problem: Problem): string {
  return `${problem.a} ${problem.gameId === "addition" ? "+" : "\u2212"} ${problem.b}`;
}

export function spokenProblem(problem: Problem): string {
  return `${problem.a} ${problem.gameId === "addition" ? "pi\u00f9" : "meno"} ${problem.b}. Quanto fa?`;
}

export function calculationModel(problem: Problem) {
  const aTens = Math.floor(problem.a / 10);
  const aUnits = problem.a % 10;
  const bTens = Math.floor(problem.b / 10);
  const bUnits = problem.b % 10;
  const adding = problem.gameId === "addition";
  const exchange = !adding && aUnits < bUnits;
  const carry = adding && aUnits + bUnits >= 10;
  const workingTens = aTens - Number(exchange);
  const workingUnits = aUnits + (exchange ? 10 : 0);
  const resultTens = adding ? aTens + bTens + Number(carry) : workingTens - bTens;
  const resultUnits = adding ? (aUnits + bUnits) % 10 : workingUnits - bUnits;
  return {
    adding,
    aTens,
    aUnits,
    bTens,
    bUnits,
    exchange,
    carry,
    workingTens,
    workingUnits,
    resultTens,
    resultUnits,
  };
}

export function explain(problem: Problem, reveal = false): string {
  const adding = problem.gameId === "addition";
  const verb = adding ? "Aggiungi" : "Togli";
  const tens = Math.floor(problem.b / 10) * 10;
  const units = problem.b % 10;
  let text = `Parti da ${problem.a}. `;
  if (tens && units) {
    const intermediate = adding ? problem.a + tens : problem.a - tens;
    text += `${verb} prima ${tens}: arrivi a ${intermediate}. Poi ${adding ? "aggiungi" : "togli"} ${units}.`;
  } else {
    text += `${verb} ${problem.b}, ${adding ? "contando in avanti" : "contando indietro"}${tens ? " a passi di 10" : ""}.`;
  }
  return reveal ? `${text} Il risultato \u00e8 ${problem.result}.` : text;
}
