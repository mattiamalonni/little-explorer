import { WORLDS, type RoundInput, type World } from "./progress.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Accetta solo il delta di una partita: il client non può inviare valori di progresso arbitrari. */
export function parseRoundInput(value: unknown): RoundInput | null {
  if (!isRecord(value)) return null;
  const { roundId, world, gameId, correct, total } = value;
  if (typeof roundId !== "string" || roundId.length < 1 || roundId.length > 100) return null;
  if (typeof world !== "string" || !WORLDS.includes(world as World)) return null;
  if (typeof gameId !== "string" || gameId.length < 1 || gameId.length > 100) return null;
  if (typeof total !== "number" || !Number.isInteger(total) || total < 1 || total > 1000) return null;
  if (typeof correct !== "number" || !Number.isInteger(correct) || correct < 0 || correct > total) return null;
  return { roundId, world: world as World, gameId, correct, total };
}
