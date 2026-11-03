import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/lib/session";
import { progressFromRecord, progressToRecordData } from "@/features/gamification/lib/db-progress";
import { createDefaultProgress, normalizeProgress } from "@/features/gamification/lib/progress";
import { prisma } from "@/lib/db";

async function saveProgress(userId: string, progress: ReturnType<typeof createDefaultProgress>) {
  const data = progressToRecordData(progress);
  return prisma.progress.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non sei ancora entrato." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object" || !("progress" in payload)) {
    return NextResponse.json({ error: "Mancano i dati dei progressi." }, { status: 400 });
  }

  try {
    const progress = normalizeProgress((payload as { progress: unknown }).progress);
    const record = await saveProgress(user.id, progress);
    return NextResponse.json({ progress: progressFromRecord(record) });
  } catch (error) {
    console.error("Errore durante il salvataggio dei progressi", error);
    return NextResponse.json({ error: "Non siamo riusciti a salvare i progressi. Riprova." }, { status: 500 });
  }
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non sei ancora entrato." }, { status: 401 });
  }

  try {
    const record = await saveProgress(user.id, createDefaultProgress());
    return NextResponse.json({ progress: progressFromRecord(record) });
  } catch (error) {
    console.error("Errore durante l'azzeramento dei progressi", error);
    return NextResponse.json({ error: "Non siamo riusciti ad azzerare i progressi. Riprova." }, { status: 500 });
  }
}
