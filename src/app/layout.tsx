import type { Metadata, Viewport } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import { GamificationProvider } from "@/features/gamification/components/gamification-provider";
import "./globals.css";
import "@/styles/gamification.css";

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
    default: "Little Explorer | Tre mondi di piccole scoperte",
    template: "%s | Little Explorer",
  },
  description:
    "Un solo posto per imparare giocando: inglese, matematica e italiano con minigiochi per bambini. Senza account: stelle e progressi restano nel browser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${nunito.variable} ${jakarta.variable}`} data-scroll-behavior="smooth">
      <body>
        <GamificationProvider>{children}</GamificationProvider>
      </body>
    </html>
  );
}
