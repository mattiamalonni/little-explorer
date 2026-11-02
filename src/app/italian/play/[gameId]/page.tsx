import { notFound } from "next/navigation";
import { PlayGame } from "@/features/italian/components/italian-app";
import { games } from "@/features/italian/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export default async function ItalianGamePage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = games.find((entry) => entry.id === gameId);
  if (!game) notFound();
  return <PlayGame game={game} />;
}
