"use client";

import "./globals.css";
import "@/styles/gamification.css";
import "@/styles/auth.css";

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="it">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <main id="main" className="empty-state page-width">
          <h1 tabIndex={-1}>Un piccolo intoppo</h1>
          <p>Qualcosa non ha funzionato. Riprova pure.</p>
          <button className="button button-primary" onClick={retry}>
            Riprova
          </button>
        </main>
      </body>
    </html>
  );
}
