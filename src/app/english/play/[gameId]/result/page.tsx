import { notFound, redirect } from "next/navigation";
import { Results } from "@/features/english/components/english-app";
import { games, wordCategories } from "@/features/english/data/games";

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export default async function EnglishResultPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  // I vecchi giochi di parole singole ora sono categorie di "Indovina la parola".
  if (wordCategories.some((category) => category.id === gameId)) redirect("/english/play/words");
  const game = games.find((entry) => entry.id === gameId);
  if (!game) notFound();
  return <Results game={game} />;
}
