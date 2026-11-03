import { Compass } from "lucide-react";

export function AppLoading() {
  return (
    <main className="auth-shell auth-shell-loading" aria-busy="true" aria-live="polite">
      <div className="auth-loading">
        <span className="auth-brand-mark" aria-hidden="true">
          <Compass size={24} strokeWidth={2.3} />
        </span>
        <span className="auth-spinner" aria-hidden="true" />
        <span className="auth-eyebrow">LITTLE EXPLORER</span>
        <h1>Prepariamo il tuo zaino…</h1>
        <p>Un attimo e si parte per una nuova scoperta.</p>
      </div>
    </main>
  );
}
