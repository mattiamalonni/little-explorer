"use client";

import { useState, type FormEvent } from "react";
import { ArrowRight, Compass, KeyRound, ShieldCheck, Sparkles, Sprout, Star, UserRound } from "lucide-react";
import { useGamification } from "@/features/gamification/components/gamification-context";

type AuthMode = "login" | "register";

export function AuthScreen() {
  const { login, register, authBusy, authError, clearAuthError, hasLegacyProgress } = useGamification();
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  function switchMode(next: AuthMode) {
    if (next === mode || authBusy) return;
    setMode(next);
    setPassword("");
    clearAuthError();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (authBusy) return;

    if (mode === "login") {
      void login(name, password);
    } else {
      void register(name, password);
    }
  }

  const isLogin = mode === "login";

  return (
    <main className="auth-shell">
      <span className="auth-blob auth-blob-a" aria-hidden="true" />
      <span className="auth-blob auth-blob-b" aria-hidden="true" />
      <span className="auth-float auth-float-a" aria-hidden="true">
        A
      </span>
      <span className="auth-float auth-float-b" aria-hidden="true">
        7
      </span>
      <span className="auth-float auth-float-c" aria-hidden="true">
        gn
      </span>

      <section className="auth-card" aria-labelledby="auth-title">
        <span className="auth-card-star" aria-hidden="true">
          <Star size={22} fill="currentColor" />
        </span>

        <div className="auth-brand">
          <span className="auth-brand-mark" aria-hidden="true">
            <Sprout size={23} strokeWidth={2.4} />
          </span>
          <span>
            little<span className="auth-brand-accent">explorer</span>
            <span className="auth-brand-dot">.</span>
          </span>
        </div>

        <div className="auth-tabs" role="group" aria-label="Accesso o nuovo nome">
          <button type="button" aria-pressed={isLogin} className="auth-tab" onClick={() => switchMode("login")}>
            Entra
          </button>
          <button type="button" aria-pressed={!isLogin} className="auth-tab" onClick={() => switchMode("register")}>
            Crea il tuo nome
          </button>
        </div>

        <div id="auth-tabpanel">
          <div className="auth-heading">
            <span className="auth-eyebrow">
              {isLogin ? (
                <>
                  <Sparkles size={13} /> BENTORNATO
                </>
              ) : (
                <>
                  <Compass size={13} /> PRIMA AVVENTURA
                </>
              )}
            </span>
            <h1 id="auth-title">{isLogin ? "Riprendi la tua avventura" : "Scegli il tuo nome"}</h1>
            <p>
              {isLogin
                ? "Inserisci il nome e la password che hai scelto per ritrovare stelle e traguardi."
                : "Il nome ti rappresenta nel mondo di Little Explorer. La password protegge i tuoi progressi."}
            </p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            <label className="auth-field">
              <span>Il tuo nome</span>
              <span className="auth-input">
                <UserRound size={17} aria-hidden="true" />
                <input
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="username"
                  autoCapitalize="words"
                  spellCheck={false}
                  maxLength={24}
                  required
                  aria-required="true"
                  placeholder="es. Sofia"
                />
              </span>
            </label>

            <label className="auth-field">
              <span>La tua password</span>
              <span className="auth-input">
                <KeyRound size={17} aria-hidden="true" />
                <input
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  maxLength={100}
                  required
                  aria-required="true"
                  aria-describedby={isLogin ? undefined : "auth-password-hint"}
                  placeholder={isLogin ? "La tua password" : "Almeno 4 caratteri"}
                />
              </span>
              {!isLogin && (
                <small id="auth-password-hint" className="auth-hint">
                  Scegli qualcosa di semplice da ricordare, ma non dirlo a nessuno.
                </small>
              )}
            </label>

            {authError && (
              <p className="auth-error" role="alert">
                {authError}
              </p>
            )}

            {!isLogin && hasLegacyProgress && (
              <p className="auth-legacy">
                <Sparkles size={14} aria-hidden="true" /> Abbiamo trovato i progressi di questo browser: creando il nome li
                porteremo con te.
              </p>
            )}

            <button type="submit" className="auth-submit" disabled={authBusy}>
              {authBusy ? (
                <>
                  <span className="auth-button-spinner" aria-hidden="true" />
                  {isLogin ? "Entro…" : "Creo il nome…"}
                </>
              ) : isLogin ? (
                <>
                  Entra <ArrowRight size={18} />
                </>
              ) : (
                <>
                  Crea il tuo nome <Sparkles size={17} />
                </>
              )}
            </button>
          </form>
        </div>

        <footer className="auth-footer">
          <ShieldCheck size={15} aria-hidden="true" />
          <span>Stelle e traguardi restano nel tuo account e ti seguono su ogni dispositivo.</span>
        </footer>
      </section>
    </main>
  );
}
