"use client";

export default function Error({ retry }: { error: unknown; retry: () => void }) {
  return (
    <main id="main" className="empty-state page-width">
      <h1 tabIndex={-1}>Un piccolo intoppo</h1>
      <p>Non siamo riusciti a caricare questa pagina. I tuoi progressi sono al sicuro.</p>
      <button className="button button-primary" onClick={retry}>
        Riprova
      </button>
    </main>
  );
}
