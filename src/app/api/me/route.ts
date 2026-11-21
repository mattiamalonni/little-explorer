import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/lib/session";
import { gameSettingsFromRecords } from "@/features/gamification/lib/db-settings";
import { progressFromRecord } from "@/features/gamification/lib/db-progress";
import { dayKey } from "@/features/gamification/lib/progress";

export async function GET() {
  let user;
  try {
    user = await getSessionUser();
  } catch (error) {
    console.error("Errore durante la lettura della sessione", error);
    return NextResponse.json({ error: "Non siamo riusciti a verificare la sessione. Riprova." }, { status: 500 });
  }
  if (!user) {
    return NextResponse.json({ error: "Non sei ancora entrato." }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name },
    progress: progressFromRecord(user.progress),
    settings: gameSettingsFromRecords(user.settings),
    today: dayKey(),
  });
}
