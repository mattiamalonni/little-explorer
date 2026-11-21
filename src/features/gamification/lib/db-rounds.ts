import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { progressFromRecord, progressToRecordData } from "@/features/gamification/lib/db-progress";
import {
  applyRound,
  WORLDS,
  type Progress,
  type RoundInput,
  type RoundReward,
  type World,
} from "@/features/gamification/lib/progress";

export type RecordRoundResult = {
  progress: Progress;
  reward: RoundReward;
};

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

function errorCode(error: unknown): string | undefined {
  return error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined;
}

async function readStoredRound(userId: string, roundId: string): Promise<RecordRoundResult | null> {
  const [round, record] = await Promise.all([
    prisma.round.findUnique({ where: { userId_roundId: { userId, roundId } } }),
    prisma.progress.findUnique({ where: { userId } }),
  ]);
  if (!round) return null;
  return {
    progress: progressFromRecord(record),
    reward: round.reward as unknown as RoundReward,
  };
}

/**
 * Registra una partita in modo atomico e idempotente.
 *
 * - la chiave `@@unique([userId, roundId])` rende sicuro il doppio invio (ricarica della pagina risultato);
 * - la transazione `Serializable` evita che due partite concurrenti si sovrascrivano;
 * - il progresso è sempre ricalcolato sul server con `applyRound`, mai fidato del client.
 */
export async function recordRound(userId: string, input: RoundInput): Promise<RecordRoundResult> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await prisma.$transaction(
        async (tx) => {
          const existing = await tx.round.findUnique({
            where: { userId_roundId: { userId, roundId: input.roundId } },
          });
          if (existing) {
            const record = await tx.progress.findUnique({ where: { userId } });
            return { progress: progressFromRecord(record), reward: existing.reward as unknown as RoundReward };
          }

          const record = await tx.progress.findUnique({ where: { userId } });
          const result = applyRound(progressFromRecord(record), input);
          const data = progressToRecordData(result.progress);

          await tx.progress.upsert({
            where: { userId },
            create: { userId, ...data },
            update: data,
          });
          await tx.round.create({
            data: {
              userId,
              roundId: input.roundId,
              reward: result.reward as unknown as Prisma.InputJsonValue,
            },
          });

          return { progress: result.progress, reward: result.reward };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      const code = errorCode(error);
      // Un'altra richiesta ha già registrato la stessa partita: restituiamo il suo esito.
      if (code === "P2002") {
        const stored = await readStoredRound(userId, input.roundId);
        if (stored) return stored;
      }
      // Conflitto di serializzazione o deadlock: ripetiamo la transazione su dati aggiornati.
      if ((code === "P2034" || code === "P2002") && attempt < 2) continue;
      throw error;
    }
  }

  throw new Error("Impossibile registrare la partita dopo più tentativi.");
}
