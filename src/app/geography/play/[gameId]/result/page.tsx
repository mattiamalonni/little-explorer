import { notFound } from "next/navigation";
import { Results } from "@/features/geography/components/geography-app";
import { games, getGame } from "@/features/geography/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export default async function GeographyResultPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game) notFound();
  return <Results game={game} />;
}
