import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/lib/session";
import { progressFromRecord } from "@/features/gamification/lib/db-progress";
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Non sei ancora entrato." }, { status: 401 });
  }

  return NextResponse.json({
    user: { id: user.id, name: user.name },
    progress: progressFromRecord(user.progress),
  });
}
