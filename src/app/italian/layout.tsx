import type { Metadata } from "next";
import "@/styles/language.css";
import { AppShell } from "@/features/italian/components/italian-app";

export const metadata: Metadata = {
  title: "Little Italiano | Suoni, lettere, scoperte",
  description:
    "Un piccolo mondo di minigiochi per scoprire GN, GLI, SC, CH, GH, CU, QU, le doppie e gli accenti dell'italiano. Crea il tuo nome e ritrova stelle e progressi su ogni dispositivo.",
};

export default function ItalianLayout({ children }: LayoutProps<"/italian">) {
  return (
    <div className="subject subject-language subject-italian">
      <AppShell>{children}</AppShell>
    </div>
  );
}
