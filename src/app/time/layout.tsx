import type { Metadata } from "next";
import "@/styles/math.css";
import "@/styles/time.css";
import { AppShell } from "@/features/time/components/time-app";

export const metadata: Metadata = {
  title: "Little Orologio | Che ore sono?",
  description:
    "Impara a leggere l'orologio con le ore in punto, e un quarto, e mezza e meno un quarto: lancette da guardare, orologi da scegliere e ore da ascoltare, un piccolo passo alla volta.",
};

export default function TimeLayout({ children }: LayoutProps<"/time">) {
  return (
    <div className="subject subject-math subject-time">
      <AppShell>{children}</AppShell>
    </div>
  );
}
