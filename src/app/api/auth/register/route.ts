import { Prisma } from "@/generated/prisma/client";
import { NextResponse } from "next/server";
import { createSession } from "@/features/auth/lib/session";
import { hashPassword } from "@/features/auth/lib/password";
import { checkAuthRateLimit } from "@/features/auth/lib/rate-limit";
import { nameKey, parseCredentials } from "@/features/auth/lib/validation";
import { progressFromRecord, progressToRecordData } from "@/features/gamification/lib/db-progress";
import { createDefaultProgress, dayKey, reconcileMigration, type Progress } from "@/features/gamification/lib/progress";
import { prisma } from "@/lib/db";

const REGISTER_MESSAGE = "Non siamo riusciti a creare il tuo nome. Controlla i dati e riprova tra poco.";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = parseCredentials(payload, { minPasswordLength: 8 });
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const limit = checkAuthRateLimit(request, parsed.credentials.name);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Troppi tentativi ravvicinati. Aspetta un momento e riprova." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const { name, password } = parsed.credentials;
  const record = payload as Record<string, unknown>;
  const initialProgress: Progress =
    record.initialProgress && typeof record.initialProgress === "object"
      ? reconcileMigration(record.initialProgress)
      : createDefaultProgress();

  try {
    const user = await prisma.user.create({
      data: {
        name,
        nameKey: nameKey(name),
        passwordHash: await hashPassword(password),
        progress: {
          create: progressToRecordData(initialProgress),
        },
      },
      include: { progress: true, settings: true },
    });

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name },
      progress: progressFromRecord(user.progress),
      settings: {},
      today: dayKey(),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Risposta generica: non rivelare quali nomi sono già occupati.
      return NextResponse.json({ error: REGISTER_MESSAGE }, { status: 409 });
    }
    console.error("Errore durante la registrazione", error);
    return NextResponse.json({ error: REGISTER_MESSAGE }, { status: 500 });
  }
}
