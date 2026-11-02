import type { Metadata } from "next";
import "@/styles/math.css";
import { AppShell } from "@/features/math/components/math-app";

export const metadata: Metadata = {
  title: "Little Math | Piccoli numeri, grandi scoperte",
  description:
    "Addizioni, sottrazioni, moltiplicazioni e divisioni fino a 100, un piccolo passo alla volta. Minigiochi per bambini, senza account e senza fretta.",
};

export default function MathLayout({ children }: LayoutProps<"/math">) {
  return (
    <div className="subject subject-math">
      <AppShell>{children}</AppShell>
    </div>
  );
}
