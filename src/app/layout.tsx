import type { Metadata, Viewport } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense } from "react";
import { getSessionUser } from "@/features/auth/lib/session";
import { AppLoading } from "@/features/gamification/components/app-loading";
import { GamificationProvider } from "@/features/gamification/components/gamification-provider";
import type { InitialSession } from "@/features/gamification/components/gamification-context";
import { SoundProvider } from "@/features/gamification/components/sound-context";
import { gameSettingsFromRecords } from "@/features/gamification/lib/db-settings";
import { progressFromRecord } from "@/features/gamification/lib/db-progress";
import "./globals.css";
import "@/styles/gamification.css";
import "@/styles/auth.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Little Explorer | Cinque mondi di piccole scoperte",
    template: "%s | Little Explorer",
  },
  description:
    "Un solo posto per imparare giocando: inglese, matematica e italiano con minigiochi per bambini. Crea il tuo nome: stelle e progressi ti seguono su ogni dispositivo.",
};

export const viewport: Viewport = {
  // Nessun blocco dello zoom: il testo deve poter essere ingrandito (WCAG 1.4.4).
  width: "device-width",
  initialScale: 1,
};

/** La sessione viene letta sul server, dietro un confine Suspense, e passata al provider client. */
async function SessionGate({ children }: { children: React.ReactNode }) {
  let initialSession: InitialSession;
  try {
    const user = await getSessionUser();
    initialSession = user
      ? {
          status: "ready",
          payload: {
            user: { id: user.id, name: user.name },
            progress: progressFromRecord(user.progress),
            settings: gameSettingsFromRecords(user.settings),
          },
        }
      : { status: "auth" };
  } catch (error) {
    console.error("Errore durante la lettura della sessione nel layout", error);
    // Errore transiente: il client riprova con GET /api/me invece di mostrare un logout falso.
    initialSession = { status: "unknown" };
  }

  return <GamificationProvider initialSession={initialSession}>{children}</GamificationProvider>;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${nunito.variable} ${jakarta.variable}`} data-scroll-behavior="smooth">
      <body>
        <SoundProvider>
          <Suspense fallback={<AppLoading />}>
            <SessionGate>{children}</SessionGate>
          </Suspense>
        </SoundProvider>
      </body>
    </html>
  );
}
