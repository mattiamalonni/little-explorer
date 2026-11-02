import { notFound } from "next/navigation";
import { PlayGame } from "@/features/english/components/english-app";
import { games } from "@/features/english/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export default async function EnglishGamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = games.find((entry) => entry.id === gameId);
  if (!game) notFound();
  return <PlayGame game={game} />;
}
