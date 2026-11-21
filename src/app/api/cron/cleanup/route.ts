import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/** Rimuove le sessioni scadute. Vercel Cron invia `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Cron non configurato." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Non autorizzato." }, { status: 401 });
  }

  try {
    const result = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error("Errore durante la pulizia delle sessioni", error);
    return NextResponse.json({ error: "Pulizia non riuscita." }, { status: 500 });
  }
}
