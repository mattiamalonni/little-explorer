import type { Metadata } from "next";
import "@/styles/language.css";
import { AppShell } from "@/features/english/components/english-app";

export const metadata: Metadata = {
  title: "Little English | Piccole parole, grandi scoperte",
  description:
    "Un piccolo mondo di minigiochi per scoprire colori, animali, oggetti, verbi, cibi e numeri in inglese. Senza account e senza salvataggi.",
};

export default function EnglishLayout({ children }: LayoutProps<"/english">) {
  return (
    <div className="subject subject-language subject-english">
      <AppShell>{children}</AppShell>
    </div>
  );
}
