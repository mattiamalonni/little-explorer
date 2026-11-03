import { NextResponse } from "next/server";
import { createSession } from "@/features/auth/lib/session";
import { verifyPassword } from "@/features/auth/lib/password";
import { nameKey, parseCredentials } from "@/features/auth/lib/validation";
import { progressFromRecord, progressToRecordData } from "@/features/gamification/lib/db-progress";
import { createDefaultProgress } from "@/features/gamification/lib/progress";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = parseCredentials(payload);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const { name, password } = parsed.credentials;

  try {
    const user = await prisma.user.findUnique({
      where: { nameKey: nameKey(name) },
      include: { progress: true },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Nome o password non sono giusti. Riprova." }, { status: 401 });
    }

    let progress = user.progress;
    if (!progress) {
      progress = await prisma.progress.create({
        data: {
          userId: user.id,
          ...progressToRecordData(createDefaultProgress()),
        },
      });
    }

    await prisma.session.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    });
    await createSession(user.id);

    return NextResponse.json({
      user: { id: user.id, name: user.name },
      progress: progressFromRecord(progress),
    });
  } catch (error) {
    console.error("Errore durante l'accesso", error);
    return NextResponse.json({ error: "Non siamo riusciti a farti entrare. Riprova tra poco." }, { status: 500 });
  }
}
