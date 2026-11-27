"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, Volume2, VolumeX } from "lucide-react";
import { ProgressPill } from "@/features/gamification/components/progress-pill";
import { useSound } from "@/features/gamification/components/sound-context";

const worlds = [
  { href: "/english", label: "English" },
  { href: "/math", label: "Math" },
  { href: "/italian", label: "Italiano" },
  { href: "/time", label: "Orologio" },
  { href: "/logic", label: "Logica" },
  { href: "/geography", label: "Geografia" },
] as const;

const audioWorlds = ["/english", "/math", "/italian", "/time", "/logic", "/geography"] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const { sound, toggleSound } = useSound();
  const showSound = audioWorlds.some((href) => isActive(pathname, href));

  return (
    <>
      <a className="app-skip" href="#main">
        Vai al contenuto
      </a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/" className="app-brand" aria-label="Little Explorer, pagina iniziale">
            <span className="app-brand-mark">
              <Sprout size={25} strokeWidth={2.4} />
            </span>
            <span>
              little<span className="app-brand-accent">explorer</span>
              <span className="app-brand-dot">.</span>
            </span>
          </Link>
          <div className="app-header-tools">
            <nav className="app-nav" aria-label="I sei mondi">
              {worlds.map((world) => (
                <Link key={world.href} href={world.href} aria-current={isActive(pathname, world.href) ? "page" : undefined}>
                  {world.label}
                </Link>
              ))}
            </nav>
            <ProgressPill />
            {showSound && (
              <button
                type="button"
                className="app-sound-toggle"
                aria-label={sound ? "Disattiva audio" : "Attiva audio"}
                title={sound ? "Disattiva audio" : "Attiva audio"}
                aria-pressed={sound}
                onClick={toggleSound}
              >
                {sound ? <Volume2 size={19} /> : <VolumeX size={19} />}
              </button>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
