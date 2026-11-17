import { notFound } from "next/navigation";
import { PlayGame } from "@/features/logic/components/logic-app";
import { games, getGame } from "@/features/logic/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export default async function LogicGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game) notFound();
  return <PlayGame key={game.id} game={game} />;
}
