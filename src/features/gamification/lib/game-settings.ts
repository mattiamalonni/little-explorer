import { WORLDS, type World } from "@/features/gamification/lib/progress";

export type GameSetting = {
  /** Voci scelte per il gioco. `null` significa tutte quelle disponibili. */
  selected: string[] | null;
  roundLength: number;
  /** Limite numerico per Little Math; `null` per gli altri mondi. */
  limit: number | null;
};

export type GameSettings = Record<string, GameSetting>;

export const ROUND_LENGTH_OPTIONS = [4, 6, 8, 10] as const;
export const DEFAULT_ROUND_LENGTH = 6;
export const DEFAULT_MATH_LIMITS = [10, 20, 100] as const;

const MAX_SELECTED = 500;

export function settingKey(world: World, gameId: string): string {
  return `${world}:${gameId}`;
}

export function createDefaultGameSetting(): GameSetting {
  return {
    selected: null,
    roundLength: DEFAULT_ROUND_LENGTH,
    limit: null,
  };
}

function normalizeSelected(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const selected = Array.from(
    new Set(
      value
        .filter((entry): entry is string => typeof entry === "string")
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0 && entry.length <= 80),
    ),
  ).slice(0, MAX_SELECTED);
  return selected.length > 0 ? selected : null;
}

function normalizeRoundLength(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return DEFAULT_ROUND_LENGTH;
  return Math.min(20, Math.max(1, Math.floor(value)));
}

function normalizeLimit(value: unknown): number | null {
  return DEFAULT_MATH_LIMITS.includes(value as (typeof DEFAULT_MATH_LIMITS)[number])
    ? (value as (typeof DEFAULT_MATH_LIMITS)[number])
    : null;
}

export function normalizeGameSetting(value: unknown): GameSetting {
  if (typeof value !== "object" || value === null) return createDefaultGameSetting();
  const record = value as Record<string, unknown>;
  return {
    selected: normalizeSelected(record.selected),
    roundLength: normalizeRoundLength(record.roundLength),
    limit: normalizeLimit(record.limit),
  };
}

export function normalizeGameSettings(value: unknown): GameSettings {
  if (typeof value !== "object" || value === null) return {};
  const settings: GameSettings = {};
  for (const [key, setting] of Object.entries(value as Record<string, unknown>)) {
    const separator = key.indexOf(":");
    if (separator <= 0) continue;
    const world = key.slice(0, separator) as World;
    const gameId = key.slice(separator + 1);
    if (!WORLDS.includes(world) || !/^[a-z0-9-]{1,40}$/.test(gameId)) continue;
    settings[key] = normalizeGameSetting(setting);
  }
  return settings;
}

export function settingFor(settings: GameSettings, world: World, gameId: string): GameSetting {
  return settings[settingKey(world, gameId)] ?? createDefaultGameSetting();
}
