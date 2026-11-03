export type World = "english" | "math" | "italian";

export const WORLDS: readonly World[] = ["english", "math", "italian"];

export const STORAGE_KEY = "little-explorer:progress:v1";
export const PERFECT_BONUS = 3;

export type Progress = {
  version: 1;
  stars: number;
  rounds: number;
  perfectRounds: number;
  correct: Record<World, number>;
  games: string[];
  streak: number;
  lastPlayed: string | null;
  badges: string[];
};

export type Level = {
  min: number;
  name: string;
};

export const LEVELS: readonly Level[] = [
  { min: 0, name: "Primi passi" },
  { min: 12, name: "Piccolo esploratore" },
  { min: 30, name: "Cercatore curioso" },
  { min: 55, name: "Amico delle scoperte" },
  { min: 90, name: "Grande esploratore" },
  { min: 140, name: "Capitano delle stelle" },
  { min: 200, name: "Leggenda curiosa" },
];

export type LevelInfo = {
  number: number;
  name: string;
  min: number;
  next: Level | null;
};

export type BadgeIcon =
  | "sparkles"
  | "star"
  | "trophy"
  | "compass"
  | "book"
  | "calculator"
  | "languages"
  | "flame"
  | "medal"
  | "crown";

export type Badge = {
  id: string;
  title: string;
  description: string;
  icon: BadgeIcon;
  isUnlocked: (progress: Progress) => boolean;
};

export const BADGES: readonly Badge[] = [
  {
    id: "first-round",
    title: "Prima avventura",
    description: "Completa la tua prima partita.",
    icon: "sparkles",
    isUnlocked: (progress) => progress.rounds >= 1,
  },
  {
    id: "perfect-round",
    title: "Tutto giusto!",
    description: "Finisci una partita senza sbagliare.",
    icon: "star",
    isUnlocked: (progress) => progress.perfectRounds >= 1,
  },
  {
    id: "perfect-three",
    title: "Tris perfetto",
    description: "Completa tre partite senza sbagliare.",
    icon: "trophy",
    isUnlocked: (progress) => progress.perfectRounds >= 3,
  },
  {
    id: "three-worlds",
    title: "Giro del mondo",
    description: "Gioca almeno una volta in tutti e tre i mondi.",
    icon: "compass",
    isUnlocked: (progress) => WORLDS.every((world) => progress.games.some((game) => game.startsWith(`${world}:`))),
  },
  {
    id: "english-25",
    title: "Parole in festa",
    description: "Trova 25 risposte giuste in inglese.",
    icon: "book",
    isUnlocked: (progress) => progress.correct.english >= 25,
  },
  {
    id: "math-25",
    title: "Numeri amici",
    description: "Risolvi 25 calcoli giusti.",
    icon: "calculator",
    isUnlocked: (progress) => progress.correct.math >= 25,
  },
  {
    id: "italian-25",
    title: "Suoni sicuri",
    description: "Trova 25 risposte giuste in italiano.",
    icon: "languages",
    isUnlocked: (progress) => progress.correct.italian >= 25,
  },
  {
    id: "streak-3",
    title: "Tre giorni di fila",
    description: "Torna a giocare per tre giorni di seguito.",
    icon: "flame",
    isUnlocked: (progress) => progress.streak >= 3,
  },
  {
    id: "rounds-10",
    title: "Buon viaggio",
    description: "Completa dieci partite.",
    icon: "medal",
    isUnlocked: (progress) => progress.rounds >= 10,
  },
  {
    id: "stars-50",
    title: "Cielo di stelle",
    description: "Raccogli 50 stelle.",
    icon: "crown",
    isUnlocked: (progress) => progress.stars >= 50,
  },
];

export const BADGE_COUNT = BADGES.length;

export type RoundInput = {
  roundId: string;
  world: World;
  gameId: string;
  correct: number;
  total: number;
};

export type RoundReward = {
  roundId: string;
  stars: number;
  perfect: boolean;
  newBadges: string[];
  levelBefore: number;
  levelAfter: number;
  totalStars: number;
};

export type RoundResult = {
  progress: Progress;
  reward: RoundReward;
};

export function createDefaultProgress(): Progress {
  return {
    version: 1,
    stars: 0,
    rounds: 0,
    perfectRounds: 0,
    correct: { english: 0, math: 0, italian: 0 },
    games: [],
    streak: 0,
    lastPlayed: null,
    badges: [],
  };
}

export function levelForStars(stars: number): LevelInfo {
  let index = 0;
  for (let position = 0; position < LEVELS.length; position++) {
    if (stars >= LEVELS[position].min) index = position;
  }
  return {
    number: index + 1,
    name: LEVELS[index].name,
    min: LEVELS[index].min,
    next: LEVELS[index + 1] ?? null,
  };
}

export function levelProgress(stars: number): number {
  const level = levelForStars(stars);
  if (!level.next) return 1;
  return Math.min(1, Math.max(0, (stars - level.min) / (level.next.min - level.min)));
}

export function badgeById(id: string): Badge | undefined {
  return BADGES.find((badge) => badge.id === id);
}

export function dayKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function daysBetween(from: string, to: string): number {
  const [fromYear, fromMonth, fromDay] = from.split("-").map(Number);
  const [toYear, toMonth, toDay] = to.split("-").map(Number);
  const fromTime = Date.UTC(fromYear, fromMonth - 1, fromDay);
  const toTime = Date.UTC(toYear, toMonth - 1, toDay);
  return Math.round((toTime - fromTime) / 86_400_000);
}

export function applyRound(progress: Progress, input: RoundInput, today = dayKey()): RoundResult {
  const total = Math.max(1, Math.floor(input.total));
  const correct = Math.min(total, Math.max(0, Math.floor(input.correct)));
  const perfect = correct === total;
  const earnedStars = correct + (perfect ? PERFECT_BONUS : 0);
  const gameKey = `${input.world}:${input.gameId}`;

  let streak = 1;
  if (progress.lastPlayed === today) {
    streak = Math.max(1, progress.streak);
  } else if (progress.lastPlayed && daysBetween(progress.lastPlayed, today) === 1) {
    streak = progress.streak + 1;
  }

  const next: Progress = {
    ...progress,
    stars: progress.stars + earnedStars,
    rounds: progress.rounds + 1,
    perfectRounds: progress.perfectRounds + (perfect ? 1 : 0),
    correct: {
      ...progress.correct,
      [input.world]: progress.correct[input.world] + correct,
    },
    games: progress.games.includes(gameKey) ? progress.games : [...progress.games, gameKey],
    streak,
    lastPlayed: today,
    badges: [...progress.badges],
  };

  const newBadges = BADGES.filter((badge) => !next.badges.includes(badge.id) && badge.isUnlocked(next)).map((badge) => badge.id);
  next.badges.push(...newBadges);

  const levelBefore = levelForStars(progress.stars);
  const levelAfter = levelForStars(next.stars);

  return {
    progress: next,
    reward: {
      roundId: input.roundId,
      stars: earnedStars,
      perfect,
      newBadges,
      levelBefore: levelBefore.number,
      levelAfter: levelAfter.number,
      totalStars: next.stars,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toCount(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return 0;
  return Math.floor(value);
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function normalizeProgress(value: unknown): Progress {
  const fallback = createDefaultProgress();
  if (!isRecord(value)) return fallback;
  const correct = isRecord(value.correct) ? value.correct : {};
  const knownBadges = new Set(BADGES.map((badge) => badge.id));

  return {
    version: 1,
    stars: toCount(value.stars),
    rounds: toCount(value.rounds),
    perfectRounds: toCount(value.perfectRounds),
    correct: {
      english: toCount(correct.english),
      math: toCount(correct.math),
      italian: toCount(correct.italian),
    },
    games: Array.from(new Set(toStringList(value.games))).slice(0, 200),
    streak: toCount(value.streak),
    lastPlayed: typeof value.lastPlayed === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.lastPlayed) ? value.lastPlayed : null,
    badges: Array.from(new Set(toStringList(value.badges))).filter((id) => knownBadges.has(id)),
  };
}

export function loadProgress(): Progress {
  if (typeof window === "undefined") return createDefaultProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProgress();
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return createDefaultProgress();
  }
}

export function saveProgress(progress: Progress): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Lo spazio del browser può essere pieno o disabilitato: il gioco continua comunque.
  }
}

export function clearProgress(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nessun problema: al prossimo avvio si riparte dai valori iniziali.
  }
}
