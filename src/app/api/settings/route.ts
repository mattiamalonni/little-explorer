import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/lib/session";
import { gameSettingToRecordData, gameSettingsFromRecords } from "@/features/gamification/lib/db-settings";
import { normalizeGameSetting } from "@/features/gamification/lib/game-settings";
import type { World } from "@/features/gamification/lib/progress";
import { prisma } from "@/lib/db";

const WORLDS: readonly World[] = ["english", "math", "italian"];

function parseWorld(value: unknown): World | null {
  return typeof value === "string" && WORLDS.includes(value as World) ? (value as World) : null;
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non sei ancora entrato." }, { status: 401 });
  }

  try {
    const records = await prisma.gameSetting.findMany({ where: { userId: user.id } });
    return NextResponse.json({ settings: gameSettingsFromRecords(records) });
  } catch (error) {
    console.error("Errore durante la lettura delle preferenze", error);
    return NextResponse.json({ error: "Non siamo riusciti a leggere le preferenze." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non sei ancora entrato." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Mancano le preferenze del gioco." }, { status: 400 });
  }

  const record = payload as Record<string, unknown>;
  const world = parseWorld(record.world);
  const gameId = typeof record.gameId === "string" ? record.gameId : "";
  if (!world || !/^[a-z0-9-]{1,40}$/.test(gameId)) {
    return NextResponse.json({ error: "Gioco non valido." }, { status: 400 });
  }

  const setting = normalizeGameSetting(record.setting);

  try {
    const data = gameSettingToRecordData(setting);
    const saved = await prisma.gameSetting.upsert({
      where: { userId_world_gameId: { userId: user.id, world, gameId } },
      create: { userId: user.id, world, gameId, ...data },
      update: data,
    });
    return NextResponse.json({ setting: gameSettingToRecordData(saved) });
  } catch (error) {
    console.error("Errore durante il salvataggio delle preferenze", error);
    return NextResponse.json({ error: "Non siamo riusciti a salvare le preferenze. Riprova." }, { status: 500 });
  }
}
