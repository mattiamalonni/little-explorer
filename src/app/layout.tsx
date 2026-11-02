import type { Metadata } from "next";
import { Nunito, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

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
    "Un solo posto per imparare giocando: inglese, matematica e italiano con minigiochi per bambini. Senza account e senza salvataggi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="it" className={`${nunito.variable} ${jakarta.variable}`}>
      <body>{children}</body>
    </html>
  );
}
