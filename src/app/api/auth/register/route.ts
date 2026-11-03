import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { createSession } from "@/features/auth/lib/session";
import { hashPassword } from "@/features/auth/lib/password";
import { nameKey, parseCredentials } from "@/features/auth/lib/validation";
import { progressFromRecord, progressToRecordData } from "@/features/gamification/lib/db-progress";
import { createDefaultProgress, normalizeProgress, type Progress } from "@/features/gamification/lib/progress";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = parseCredentials(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { name, password } = parsed.credentials;
  const record = payload as Record<string, unknown>;
  const initialProgress: Progress =
    record.initialProgress && typeof record.initialProgress === "object"
      ? normalizeProgress(record.initialProgress)
      : createDefaultProgress();

  try {
    const user = await prisma.user.create({
      data: {
        name,
        nameKey: nameKey(name),
        passwordHash: hashPassword(password),
        progress: {
          create: progressToRecordData(initialProgress),
        },
      },
      include: { progress: true },
    });

    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name },
      progress: progressFromRecord(user.progress),
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Questo nome è già stato scelto. Provane un altro." }, { status: 409 });
    }
    console.error("Errore durante la registrazione", error);
    return NextResponse.json({ error: "Non siamo riusciti a creare il tuo nome. Riprova tra poco." }, { status: 500 });
  }
}
