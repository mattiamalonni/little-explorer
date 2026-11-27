import type { Metadata } from "next";
import "@/styles/language.css";
import "@/styles/geography.css";
import { AppShell } from "@/features/geography/components/geography-app";

export const metadata: Metadata = {
  title: "Little Geografia | Paesaggi, punti cardinali e bandiere",
  description:
    "Paesaggi da riconoscere, sopra e sotto, punti cardinali e bandiere del mondo: piccoli giochi di geografia per bambini, con illustrazioni e spiegazioni semplici.",
};

export default function GeographyLayout({ children }: LayoutProps<"/geography">) {
  return (
    <div className="subject subject-language subject-geography">
      <AppShell>{children}</AppShell>
    </div>
  );
}
