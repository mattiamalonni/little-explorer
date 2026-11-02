import { notFound } from "next/navigation";
import { Results } from "@/features/math/components/math-app";
import { games, getGame } from "@/features/math/data/games";

export function generateStaticParams() {
  return games.map(({ id }) => ({ gameId: id }));
}

export default async function MathResultPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const game = getGame(gameId);
  if (!game) notFound();
  return <Results key={game.id} game={game} />;
}
