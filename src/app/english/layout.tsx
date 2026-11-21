import type { Metadata } from "next";
import "@/styles/language.css";
import { AppShell } from "@/features/english/components/english-app";

export const metadata: Metadata = {
  title: "Little English | Piccole parole, grandi scoperte",
  description:
    "Un piccolo mondo di minigiochi per scoprire colori, animali, corpo, famiglia, classe, frasi, preposizioni, contrari, giorni, mesi, emozioni e il verbo essere (I am, you are, con not e aren't) in inglese. Crea il tuo nome e ritrova stelle e progressi su ogni dispositivo.",
};

export default function EnglishLayout({ children }: LayoutProps<"/english">) {
  return (
    <div className="subject subject-language subject-english">
      <AppShell>{children}</AppShell>
    </div>
  );
}
