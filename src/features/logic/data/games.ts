export type LogicGameId = "patterns" | "odd-one-out" | "sizes" | "directions" | "mixed";
export type LogicKind = "patterns" | "odd-one-out" | "sizes" | "directions";

export type ShapeKind = "circle" | "square" | "triangle" | "star" | "diamond" | "heart";
export type ShapeColor = "coral" | "sun" | "sky" | "green" | "violet";
export type ShapeSize = "small" | "medium" | "large" | "xlarge";
export type Direction = "up" | "down" | "left" | "right";

export type ShapeToken = {
  kind: ShapeKind;
  color: ShapeColor;
  size: ShapeSize;
};

export type Option = {
  id: string;
  label: string;
  shape?: ShapeToken;
  arrow?: Direction;
  path?: Direction[];
};

export type Grid = {
  cols: number;
  rows: number;
  start: number;
  target: number;
};

export type Game = {
  id: LogicGameId;
  title: string;
  subtitle: string;
  description: string;
};

export type Question = {
  id: string;
  gameId: LogicGameId;
  kind: LogicKind;
  prompt: string;
  instruction: string;
  sequence: ShapeToken[];
  blankIndex?: number;
  grid?: Grid;
  options: Option[];
  answer: string;
  explanation: string;
};

export type Answer = {
  question: Question;
  selected: string;
  correct: boolean;
};

export type Round = {
  id: string;
  gameId: LogicGameId;
  questions: Question[];
  answers: Answer[];
  roundLength: number;
};

export type RoundConfig = {
  roundLength?: number;
};

export const ROUND_LENGTH = 6;

export const SHAPES: readonly ShapeKind[] = ["circle", "square", "triangle", "star", "diamond", "heart"];
export const COLORS: readonly ShapeColor[] = ["coral", "sun", "sky", "green", "violet"];
export const SIZES: readonly ShapeSize[] = ["small", "medium", "large", "xlarge"];
export const DIRECTIONS: readonly Direction[] = ["up", "right", "down", "left"];

export const shapeColors: Record<ShapeColor, string> = {
  coral: "#e88f77",
  sun: "#e3b34a",
  sky: "#5b8ba8",
  green: "#5f9a68",
  violet: "#8b6bb1",
};

const shapeNames: Record<ShapeKind, string> = {
  circle: "cerchio",
  square: "quadrato",
  triangle: "triangolo",
  star: "stella",
  diamond: "rombo",
  heart: "cuore",
};

const shapePluralNames: Record<ShapeKind, string> = {
  circle: "cerchi",
  square: "quadrati",
  triangle: "triangoli",
  star: "stelle",
  diamond: "rombi",
  heart: "cuori",
};

const colorNames: Record<ShapeColor, string> = {
  coral: "corallo",
  sun: "giallo",
  sky: "azzurro",
  green: "verde",
  violet: "viola",
};

const sizeNames: Record<ShapeSize, string> = {
  small: "piccolo",
  medium: "medio",
  large: "grande",
  xlarge: "grandissimo",
};

const directionNames: Record<Direction, { label: string; where: string }> = {
  up: { label: "Su", where: "in alto" },
  right: { label: "Destra", where: "a destra" },
  down: { label: "Giù", where: "in basso" },
  left: { label: "Sinistra", where: "a sinistra" },
};

export const games: Game[] = [
  {
    id: "patterns",
    title: "Cosa viene dopo?",
    subtitle: "Sequenze",
    description: "Guarda le forme che si ripetono: scopri quale arriva dopo o quale manca nel mezzo.",
  },
  {
    id: "odd-one-out",
    title: "Trova l'intruso",
    subtitle: "Uno è diverso",
    description: "Tra forme, colori e dimensioni ce n'è uno che non c'entra: riesci a trovarlo?",
  },
  {
    id: "sizes",
    title: "Grande o piccolo?",
    subtitle: "Dimensioni",
    description: "Confronta le forme: non solo la più grande e la più piccola, ma anche quella di mezzo.",
  },
  {
    id: "directions",
    title: "Dove si va?",
    subtitle: "Frecce e percorsi",
    description: "Guarda la griglia e scegli le frecce giuste per portare l'esploratore fino alla stella.",
  },
  {
    id: "mixed",
    title: "Mente svelta",
    subtitle: "Un po' di tutto",
    description: "Sequenze, intrusi, dimensioni e percorsi in un unico gioco, con sfide sempre nuove.",
  },
];

export const gameStickers: Record<LogicGameId, string> = {
  patterns: "Occhio alla regola",
  "odd-one-out": "Uno non c'entra",
  sizes: "Metti in fila",
  directions: "Un passo alla volta",
  mixed: "Pensa e scopri",
};

export function getGame(id: string): Game | undefined {
  return games.find((game) => game.id === id);
}

export function shapeLabel(token: ShapeToken): string {
  return `${shapeNames[token.kind]} ${colorNames[token.color]} ${sizeNames[token.size]}`;
}

export function directionLabel(direction: Direction): string {
  return directionNames[direction].label;
}

function token(kind: ShapeKind, color: ShapeColor, size: ShapeSize = "medium"): ShapeToken {
  return { kind, color, size };
}

function shuffle<T>(values: readonly T[], random: () => number): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pick<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)];
}

function pickMany<T>(values: readonly T[], count: number, random: () => number): T[] {
  return shuffle(values, random).slice(0, count);
}

function sameShape(a: ShapeToken, b: ShapeToken): boolean {
  return a.kind === b.kind && a.color === b.color && a.size === b.size;
}

function shapeOptions(tokens: ShapeToken[], correct: ShapeToken, random: () => number): { options: Option[]; answer: string } {
  const options = shuffle(tokens, random).map((shape, index) => ({
    id: `o${index + 1}`,
    label: shapeLabel(shape),
    shape,
  }));
  const answer = options.find((option) => option.shape && sameShape(option.shape, correct))?.id ?? options[0].id;
  return { options, answer };
}

type PatternRule = "shape" | "shape-cycle" | "shape-double" | "color" | "color-cycle" | "size-grow" | "size-shrink" | "two-beat";

function createPattern(gameId: LogicGameId, index: number, random: () => number): Question {
  const rule = pick(
    ["shape", "shape-cycle", "shape-double", "color", "color-cycle", "size-grow", "size-shrink", "two-beat"] as PatternRule[],
    random,
  );
  const baseColor = pick(COLORS, random);
  let sequence: ShapeToken[];
  let correct: ShapeToken;
  let options: Option[];
  let answer: string;
  let explanation: string;

  if (rule === "shape" || rule === "shape-cycle" || rule === "shape-double") {
    const needed = rule === "shape" ? 2 : rule === "shape-cycle" ? 3 : 2;
    const kinds = pickMany(SHAPES, Math.max(4, needed), random);
    const chosen = kinds.slice(0, needed);
    const pattern = rule === "shape-double" ? [chosen[0], chosen[0], chosen[1]] : chosen;
    const repeat = rule === "shape-double" ? [pattern[0], pattern[1], pattern[2], pattern[0], pattern[1]] : null;
    sequence = (repeat ?? [...pattern, ...pattern, ...(rule === "shape-cycle" ? [] : [pattern[0]])]).map((kind) =>
      token(kind, baseColor),
    );
    const nextIndex = rule === "shape-double" ? 5 : sequence.length;
    const nextKind = pattern[nextIndex % pattern.length];
    correct = token(nextKind, baseColor);
    const distractors = shuffle(
      SHAPES.filter((kind) => !pattern.includes(kind)),
      random,
    ).slice(0, 3);
    const result = shapeOptions([correct, ...distractors.map((kind) => token(kind, baseColor))], correct, random);
    options = result.options;
    answer = result.answer;
    explanation =
      rule === "shape-double"
        ? `Le forme vanno a coppie: due ${shapePluralNames[chosen[0]]}, due ${shapePluralNames[chosen[1]]}. Ora ricominciano: tocca al ${shapeNames[nextKind]}.`
        : `La sequenza ripete sempre lo stesso giro di forme. La prossima è il ${shapeNames[nextKind]}.`;
  } else if (rule === "color" || rule === "color-cycle") {
    const kind = pick(SHAPES, random);
    const chosen = pickMany(COLORS, rule === "color" ? 2 : 3, random);
    sequence =
      rule === "color"
        ? [chosen[0], chosen[1], chosen[0], chosen[1]].map((color) => token(kind, color))
        : [chosen[0], chosen[1], chosen[2], chosen[0], chosen[1]].map((color) => token(kind, color));
    correct = token(kind, chosen[sequence.length % chosen.length]);
    const otherColors = shuffle(
      COLORS.filter((color) => color !== correct.color),
      random,
    ).slice(0, 3);
    const result = shapeOptions([correct, ...otherColors.map((color) => token(kind, color))], correct, random);
    options = result.options;
    answer = result.answer;
    explanation = `I colori si ripetono sempre nello stesso ordine. Adesso tocca al ${colorNames[correct.color]}.`;
  } else if (rule === "two-beat") {
    const [firstKind, secondKind] = pickMany(SHAPES, 2, random);
    const [firstColor, secondColor] = pickMany(COLORS, 2, random);
    sequence = [
      token(firstKind, firstColor),
      token(secondKind, firstColor),
      token(firstKind, secondColor),
      token(secondKind, secondColor),
      token(firstKind, firstColor),
    ];
    correct = token(secondKind, firstColor);
    const combos = [correct, token(firstKind, secondColor), token(secondKind, secondColor), token(firstKind, firstColor)];
    const result = shapeOptions(combos, correct, random);
    options = result.options;
    answer = result.answer;
    explanation = `Le forme fanno sempre uno, due, uno, due. Il colore cambia ogni due forme: prima due di colore ${colorNames[firstColor]}, poi due di colore ${colorNames[secondColor]}, e poi di nuovo il primo. Quindi arriva un ${shapeNames[secondKind]} ${colorNames[firstColor]}.`;
  } else {
    const kind = pick(SHAPES, random);
    const grow = rule === "size-grow";
    const order = grow ? SIZES : [...SIZES].reverse();
    sequence = order.slice(0, 3).map((size) => token(kind, baseColor, size));
    correct = token(kind, baseColor, order[3]);
    const result = shapeOptions(
      SIZES.map((size) => token(kind, baseColor, size)),
      correct,
      random,
    );
    options = result.options;
    answer = result.answer;
    explanation = grow
      ? "Le forme crescono un po' alla volta: piccola, media, grande... e poi ancora più grande."
      : "Le forme rimpiccioliscono un po' alla volta: grandissima, grande, media... e poi piccola.";
  }

  const ruleExplanation = explanation;
  let blankIndex: number | undefined;
  let prompt = "Cosa viene dopo?";
  let instruction = "Guarda la sequenza e scegli la forma che continua.";
  if (sequence.length >= 4 && random() < 0.4) {
    blankIndex = 1 + Math.floor(random() * (sequence.length - 2));
    correct = sequence[blankIndex];
    prompt = "Quale forma manca?";
    instruction = "Nel riquadro con il punto di domanda manca una forma: scegli tu quale.";
    const distractors = options
      .filter((option) => !option.shape || !sameShape(option.shape, correct))
      .slice(0, 3)
      .map((option) => option.shape!)
      .filter(Boolean);
    const filled = shapeOptions([correct, ...distractors], correct, random);
    options = filled.options;
    answer = filled.answer;
    explanation = `${ruleExplanation} In questo punto della sequenza manca il ${shapeLabel(correct)}.`;
  }

  return {
    id: `logic-patterns-${index}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    kind: "patterns",
    prompt,
    instruction,
    sequence,
    blankIndex,
    options,
    answer,
    explanation,
  };
}

function createOddOneOut(gameId: LogicGameId, index: number, random: () => number): Question {
  const rule = pick(["color", "size", "shape"] as const, random);
  const kinds = pickMany(SHAPES, 4, random);
  const oddIndex = Math.floor(random() * 4);
  const baseColor = pick(COLORS, random);
  const oddColor = pick(
    COLORS.filter((color) => color !== baseColor),
    random,
  );
  const size: ShapeSize = "medium";

  let sequence: ShapeToken[];
  let explanation: string;

  if (rule === "shape") {
    const commonKind = pick(SHAPES, random);
    const otherKind = pick(
      SHAPES.filter((kind) => kind !== commonKind),
      random,
    );
    const colors = pickMany(COLORS, 3, random);
    sequence = kinds.map((_, position) =>
      position === oddIndex
        ? token(otherKind, colors[0], size)
        : token(commonKind, colors[position > oddIndex ? position - 1 : position], size),
    );
    explanation = `Tre forme sono tutte dello stesso tipo: ${shapeNames[commonKind]} di colori diversi. L'intruso è il ${shapeNames[otherKind]}: è l'unico diverso.`;
  } else {
    sequence = kinds.map((kind, position) =>
      rule === "color"
        ? token(kind, position === oddIndex ? oddColor : baseColor, size)
        : token(kind, baseColor, position === oddIndex ? "xlarge" : size),
    );
    explanation =
      rule === "color"
        ? `Il ${shapeNames[sequence[oddIndex].kind]} è ${colorNames[oddColor]}, mentre gli altri sono tutti ${colorNames[baseColor]}.`
        : `Il ${shapeNames[sequence[oddIndex].kind]} è più grande degli altri: per questo è l'intruso.`;
  }

  const odd = sequence[oddIndex];
  const result = shapeOptions(sequence, odd, random);

  return {
    id: `logic-odd-${index}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    kind: "odd-one-out",
    prompt: "Quale non c'entra?",
    instruction: "Uno è diverso dagli altri: scegli l'intruso.",
    sequence,
    options: result.options,
    answer: result.answer,
    explanation,
  };
}

function createSizes(gameId: LogicGameId, index: number, random: () => number): Question {
  const kind = pick(SHAPES, random);
  const color = pick(COLORS, random);
  const tokens = SIZES.map((size) => token(kind, color, size));
  const middle = random() < 0.5;
  const correct = middle ? tokens[1 + Math.floor(random() * 2)] : tokens[random() < 0.5 ? 0 : tokens.length - 1];
  const result = shapeOptions(tokens, correct, random);
  const position = SIZES.indexOf(correct.size) + 1;
  const explanation = middle
    ? `Se mettiamo le forme in fila dalla più piccola, quella giusta è al numero ${position}: ${sizeNames[correct.size]}.`
    : correct.size === "small"
      ? `Il ${shapeNames[kind]} piccolo è il più piccolo di tutti.`
      : `Il ${shapeNames[kind]} grandissimo è il più grande di tutti.`;

  let prompt: string;
  if (middle) {
    prompt = correct.size === "medium" ? "Qual è il secondo più piccolo?" : "Qual è il secondo più grande?";
  } else {
    prompt = correct.size === "small" ? "Qual è il più piccolo?" : "Qual è il più grande?";
  }

  return {
    id: `logic-sizes-${index}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    kind: "sizes",
    prompt,
    instruction: "Guarda bene le dimensioni prima di scegliere.",
    sequence: [],
    options: result.options,
    answer: result.answer,
    explanation,
  };
}

function neighbor(start: number, direction: Direction, cols: number, rows: number): number | null {
  const row = Math.floor(start / cols);
  const col = start % cols;
  if (direction === "up") return row > 0 ? start - cols : null;
  if (direction === "down") return row < rows - 1 ? start + cols : null;
  if (direction === "left") return col > 0 ? start - 1 : null;
  return col < cols - 1 ? start + 1 : null;
}

function opposite(direction: Direction): Direction {
  if (direction === "up") return "down";
  if (direction === "down") return "up";
  if (direction === "left") return "right";
  return "left";
}

function walk(start: number, path: readonly Direction[], cols: number, rows: number): number | null {
  let current = start;
  for (const direction of path) {
    const next = neighbor(current, direction, cols, rows);
    if (next === null) return null;
    current = next;
  }
  return current;
}

type PathOption = { path: Direction[]; end: number };

function buildPaths(start: number, cols: number, rows: number, steps: number): PathOption[] {
  const result: PathOption[] = [];
  const queue: Direction[][] = [[]];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.length === steps) {
      const end = walk(start, current, cols, rows);
      if (end !== null && end !== start) result.push({ path: current, end });
      continue;
    }
    const last = current[current.length - 1];
    for (const direction of DIRECTIONS) {
      if (last && opposite(last) === direction) continue;
      const candidate = [...current, direction];
      if (walk(start, candidate, cols, rows) !== null) queue.push(candidate);
    }
  }
  return result;
}

function pathLabel(path: readonly Direction[]): string {
  return path.map((direction) => directionLabel(direction)).join(", poi ");
}

function createDirections(gameId: LogicGameId, index: number, random: () => number): Question {
  const cols = 4;
  const rows = 3;
  const steps = 2 + (index % 2);
  const goodStarts = [1, 2, 4, 5, 6, 7, 9, 10];
  let start = pick(goodStarts, random);
  let paths = buildPaths(start, cols, rows, steps);
  for (let attempt = 0; attempt < 6 && paths.length < 4; attempt++) {
    start = pick(goodStarts, random);
    paths = buildPaths(start, cols, rows, steps);
  }

  if (paths.length < 4) {
    const valid = DIRECTIONS.filter((direction) => neighbor(start, direction, cols, rows) !== null);
    const answerDirection = pick(valid, random);
    const target = neighbor(start, answerDirection, cols, rows) ?? start;
    const options = shuffle(
      DIRECTIONS.map((direction) => ({ id: direction, label: directionLabel(direction), arrow: direction })),
      random,
    );
    return {
      id: `logic-directions-${index}-${Math.random().toString(36).slice(2, 8)}`,
      gameId,
      kind: "directions",
      prompt: "Dove andiamo?",
      instruction: "Scegli la freccia che porta l'esploratore fino alla stella.",
      sequence: [],
      grid: { cols, rows, start, target },
      options,
      answer: answerDirection,
      explanation: `La stella è ${directionNames[answerDirection].where}: basta una freccia verso ${directionNames[answerDirection].where}.`,
    };
  }

  const chosen = pick(paths, random);
  const distractors = shuffle(
    paths.filter((option) => option.end !== chosen.end && option.path.join() !== chosen.path.join()),
    random,
  ).slice(0, 3);
  const candidates = shuffle(
    [chosen, ...distractors].map((option) => ({
      id: "",
      label: pathLabel(option.path),
      path: option.path,
    })),
    random,
  ).map((option, position) => ({ ...option, id: `o${position + 1}` }));
  const answer = candidates.find((option) => option.path.join() === chosen.path.join())?.id ?? candidates[0].id;

  return {
    id: `logic-directions-${index}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    kind: "directions",
    prompt: "Qual è la strada?",
    instruction: "Scegli le frecce, una dopo l'altra, per portare l'esploratore alla stella.",
    sequence: [],
    grid: { cols, rows, start, target: chosen.end },
    options: candidates,
    answer,
    explanation: `Vai ${chosen.path.map((direction) => directionNames[direction].where).join(", poi ")}: così arrivi alla stella.`,
  };
}

const creators: Record<LogicKind, (gameId: LogicGameId, index: number, random: () => number) => Question> = {
  patterns: createPattern,
  "odd-one-out": createOddOneOut,
  sizes: createSizes,
  directions: createDirections,
};

export function createRound(
  gameId: LogicGameId,
  config: RoundConfig = {},
  previous?: Round,
  random: () => number = Math.random,
): Round {
  const game = getGame(gameId);
  if (!game) throw new Error("Gioco non valido.");

  const length = Math.min(10, Math.max(4, Math.floor(config.roundLength ?? ROUND_LENGTH)));
  const base = shuffle(["patterns", "odd-one-out", "sizes", "directions"] as LogicKind[], random);
  const kinds: LogicKind[] = Array.from({ length }, (_, index) =>
    gameId === "mixed" ? base[index % base.length] : (gameId as LogicKind),
  );
  const questions = kinds.map((kind, index) => creators[kind](gameId, index, random));

  if (previous?.gameId === gameId && questions.length > 1 && questions[0].answer === previous.questions[0]?.answer) {
    [questions[0], questions[1]] = [questions[1], questions[0]];
  }

  return {
    id: `round-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    gameId,
    questions,
    answers: [],
    roundLength: length,
  };
}

export function recordAnswer(round: Round, selected: string): Round {
  const question = round.questions[round.answers.length];
  if (!question || !question.options.some((option) => option.id === selected)) {
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

export function optionById(question: Question, id: string): Option | undefined {
  return question.options.find((option) => option.id === id);
}

export function selectedOptionLabel(question: Question, selected: string): string {
  return optionById(question, selected)?.label ?? selected;
}
