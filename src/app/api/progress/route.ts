import { NextResponse } from "next/server";
import { getSessionUserId } from "@/features/auth/lib/session";
import { progressFromRecord, progressToRecordData } from "@/features/gamification/lib/db-progress";
import { createDefaultProgress } from "@/features/gamification/lib/progress";
import { prisma } from "@/lib/db";

// Il salvataggio delle partite usa POST /api/progress/rounds: il server ricalcola il
// progresso in modo atomico e idempotente. Qui resta solo l'azzeramento esplicito.
export async function DELETE() {
  let userId;
  try {
    userId = await getSessionUserId();
  } catch (error) {
    console.error("Errore durante la lettura della sessione", error);
    return NextResponse.json({ error: "Non siamo riusciti a verificare la sessione. Riprova." }, { status: 500 });
  }
  if (!userId) {
    return NextResponse.json({ error: "Non sei ancora entrato." }, { status: 401 });
  }

  try {
    const data = progressToRecordData(createDefaultProgress());
    const record = await prisma.progress.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return NextResponse.json({ progress: progressFromRecord(record) });
  } catch (error) {
    console.error("Errore durante l'azzeramento dei progressi", error);
    return NextResponse.json({ error: "Non siamo riusciti ad azzerare i progressi. Riprova." }, { status: 500 });
  }
}
