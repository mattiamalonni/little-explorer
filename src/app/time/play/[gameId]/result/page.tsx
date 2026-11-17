import { notFound } from "next/navigation";
import { Results } from "@/features/time/components/time-app";
import { games } from "@/features/time/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export default async function TimeResultPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = games.find((entry) => entry.id === gameId);
  if (!game) notFound();
  return <Results game={game} />;
}
