"use client";

import {
  BookOpen,
  Calculator,
  Compass,
  Crown,
  Flame,
  Languages,
  Medal,
  Sparkles,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { BadgeIcon } from "@/features/gamification/lib/progress";

const ICONS: Record<BadgeIcon, LucideIcon> = {
  sparkles: Sparkles,
  star: Star,
  trophy: Trophy,
  compass: Compass,
  book: BookOpen,
  calculator: Calculator,
  languages: Languages,
  flame: Flame,
  medal: Medal,
  crown: Crown,
};

export function BadgeGlyph({ icon, size = 22 }: { icon: BadgeIcon; size?: number }) {
  const Icon = ICONS[icon];
  return <Icon size={size} aria-hidden="true" />;
}
