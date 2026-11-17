import { notFound } from "next/navigation";
import { PlayGame } from "@/features/time/components/time-app";
import { games, getGame } from "@/features/time/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export default async function TimeGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game) notFound();
  return <PlayGame key={game.id} game={game} />;
}
