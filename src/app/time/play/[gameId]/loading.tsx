import Link from "next/link";

export default function TimeGameLoading() {
  return (
    <main id="main" className="game-page page-width" aria-busy="true">
      <section className="ready-state">
        <h1>Un momento, piccolo esploratore!</h1>
        <p role="status">Prepariamo le lancette...</p>
        <Link className="back-link" href="/time">
          Tutti i giochi
        </Link>
      </section>
    </main>
  );
}
