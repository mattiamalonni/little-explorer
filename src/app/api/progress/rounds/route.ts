import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/lib/session";
import { parseRoundInput, recordRound } from "@/features/gamification/lib/db-rounds";

export async function POST(request: Request) {
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

  const payload = await request.json().catch(() => null);
  const input = parseRoundInput(payload);
  if (!input) {
    return NextResponse.json({ error: "Dati della partita non validi." }, { status: 400 });
  }

  try {
    const result = await recordRound(user.id, input);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Errore durante la registrazione della partita", error);
    return NextResponse.json({ error: "Non siamo riusciti a salvare la partita. Riprova." }, { status: 500 });
  }
}
