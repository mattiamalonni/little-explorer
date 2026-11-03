export type Operation = "addition" | "subtraction" | "multiplication" | "division";
export type GameId = Operation | "mixed" | "all";
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
export const OPERATIONS: Operation[] = ["addition", "subtraction", "multiplication", "division"];
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
    id: "multiplication",
    title: "Quante volte?",
    subtitle: "Moltiplicazioni",
    description: "Raggruppa i numeri e scopri quanti sono in tutto.",
    example: ["3", "\u00d7", "4"],
  },
  {
    id: "division",
    title: "In parti uguali",
    subtitle: "Divisioni",
    description: "Distribuisci gli oggetti e scopri quanto tocca a ciascuno.",
    example: ["12", "\u00f7", "3"],
  },
  {
    id: "mixed",
    title: "Un po\u2019 pi\u00f9, un po\u2019 meno!",
    subtitle: "Modalit\u00e0 mista",
    description: "Tre addizioni e tre sottrazioni, tutte mescolate.",
    example: ["+", "?", "\u2212"],
  },
  {
    id: "all",
    title: "Tutti insieme!",
    subtitle: "Tutte le operazioni",
    description: "Addizioni, sottrazioni, moltiplicazioni e divisioni in un unico gioco.",
    example: ["+", "\u00d7", "\u00f7"],
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
  id: string;
  gameId: GameId;
  limit: Limit;
  questions: Question[];
  answers: Answer[];
};

const operationsByGame: Record<GameId, readonly Operation[]> = {
  addition: ["addition"],
  subtraction: ["subtraction"],
  multiplication: ["multiplication"],
  division: ["division"],
  mixed: ["addition", "subtraction"],
  all: OPERATIONS,
};

const operationSigns: Record<Operation, string> = {
  addition: "+",
  subtraction: "\u2212",
  multiplication: "\u00d7",
  division: "\u00f7",
};

const operationWords: Record<Operation, string> = {
  addition: "pi\u00f9",
  subtraction: "meno",
  multiplication: "per",
  division: "diviso",
};

export function getGame(id: string) {
  return games.find((game) => game.id === id);
}

export function operationSign(operation: Operation): string {
  return operationSigns[operation];
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pick<T>(values: readonly T[], count: number, random: () => number): T[] {
  return shuffle(values, random).slice(0, count);
}

function pickRoundProblems(
  problems: readonly Problem[],
  count: number,
  random: () => number,
  preferNonTrivial = false,
): Problem[] {
  if (!preferNonTrivial) return pick(problems, count, random);

  const preferred = problems.filter((problem) => problem.a > 1 && problem.b > 1 && problem.result > 1);
  const selected = pick(preferred, Math.min(count, preferred.length), random);
  const selectedIds = new Set(selected.map((problem) => problem.id));
  return shuffle(
    [
      ...selected,
      ...pick(
        problems.filter((problem) => !selectedIds.has(problem.id)),
        count - selected.length,
        random,
      ),
    ],
    random,
  );
}

function createOperationProblems(operation: Operation, limit: Limit): Problem[] {
  const problems: Problem[] = [];

  if (operation === "multiplication" || operation === "division") {
    const maxFactor = Math.min(limit, 10);
    for (let first = 1; first <= maxFactor; first++) {
      const secondLimit = operation === "multiplication" ? first : maxFactor;
      for (let second = 1; second <= secondLimit; second++) {
        if (operation === "multiplication") {
          const result = first * second;
          if (result <= limit) {
            problems.push({
              id: `multiplication-${first}-${second}`,
              a: first,
              b: second,
              gameId: operation,
              result,
            });
          }
        } else {
          const dividend = first * second;
          if (dividend <= limit) {
            problems.push({
              id: `division-${dividend}-${first}`,
              a: dividend,
              b: first,
              gameId: operation,
              result: second,
            });
          }
        }
      }
    }
    return problems;
  }

  for (let a = 1; a <= limit; a++) {
    for (let b = 1; b <= a; b++) {
      const result = operation === "addition" ? a + b : a - b;
      if (result <= limit) {
        problems.push({ id: `${operation}-${a}-${b}`, a, b, gameId: operation, result });
      }
    }
  }
  return problems;
}

export function createProblems(gameId: GameId, limit: Limit): Problem[] {
  if (!getGame(gameId) || !limits.includes(limit)) {
    throw new Error("Gioco o livello non valido.");
  }
  return operationsByGame[gameId].flatMap((operation) => createOperationProblems(operation, limit));
}

export function createRound(gameId: GameId, limit: Limit, previous?: Round, random: () => number = Math.random): Round {
  const problems = createProblems(gameId, limit);
  let pool: Problem[];

  if (gameId === "mixed") {
    pool = shuffle(
      [
        ...pick(
          problems.filter((problem) => problem.gameId === "addition"),
          ROUND_LENGTH / 2,
          random,
        ),
        ...pick(
          problems.filter((problem) => problem.gameId === "subtraction"),
          ROUND_LENGTH / 2,
          random,
        ),
      ],
      random,
    );
  } else if (gameId === "all") {
    const picks = OPERATIONS.flatMap((operation) =>
      pickRoundProblems(
        problems.filter((problem) => problem.gameId === operation),
        1,
        random,
        operation === "multiplication" || operation === "division",
      ),
    );
    const pickedIds = new Set(picks.map((problem) => problem.id));
    pool = shuffle(
      [
        ...picks,
        ...pick(
          problems.filter((problem) => !pickedIds.has(problem.id)),
          ROUND_LENGTH - picks.length,
          random,
        ),
      ],
      random,
    );
  } else {
    pool = pickRoundProblems(problems, ROUND_LENGTH, random, gameId === "multiplication" || gameId === "division");
  }

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
  return {
    id: `round-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    limit,
    questions,
    answers: [],
  };
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
  return `${problem.a} ${operationSign(problem.gameId)} ${problem.b}`;
}

export function spokenProblem(problem: Problem): string {
  return `${problem.a} ${operationWords[problem.gameId]} ${problem.b}. Quanto fa?`;
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

function repeatedAddition(groups: number, value: number): string {
  return Array.from({ length: groups }, () => value).join(" + ");
}

export function explain(problem: Problem, reveal = false): string {
  if (problem.gameId === "multiplication") {
    const groupLabel = problem.a === 1 ? "gruppo" : "gruppi";
    const repeated = repeatedAddition(problem.a, problem.b);
    return reveal
      ? `${problem.a} ${groupLabel} da ${problem.b}. ${repeated} = ${problem.result}.`
      : `${problem.a} ${groupLabel} da ${problem.b}. Somma un gruppo alla volta: quanti oggetti in tutto?`;
  }

  if (problem.gameId === "division") {
    const groupsLabel = problem.b === 1 ? "gruppo uguale" : "gruppi uguali";
    const items = problem.a === 1 ? "oggetto" : "oggetti";
    return reveal
      ? `Hai ${problem.a} ${items}. Dividi in ${problem.b} ${groupsLabel}: ${problem.result} per gruppo. Infatti ${problem.b} \u00d7 ${problem.result} = ${problem.a}.`
      : `Hai ${problem.a} ${items}. Dividi in ${problem.b} ${groupsLabel}. Quanti in ogni gruppo? Cerca il numero che moltiplicato per ${problem.b} d\u00e0 ${problem.a}.`;
  }

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
