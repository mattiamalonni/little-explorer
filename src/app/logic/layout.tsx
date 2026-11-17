import type { Metadata } from "next";
import "@/styles/math.css";
import "@/styles/logic.css";
import { AppShell } from "@/features/logic/components/logic-app";

export const metadata: Metadata = {
  title: "Little Logica | Guarda, pensa, scopri",
  description:
    "Sequenze, intrusi, dimensioni e percorsi: piccoli giochi di logica per bambini, con forme colorate da osservare e scelte da fare al proprio ritmo.",
};

export default function LogicLayout({ children }: LayoutProps<"/logic">) {
  return (
    <div className="subject subject-math subject-logic">
      <AppShell>{children}</AppShell>
    </div>
  );
}
