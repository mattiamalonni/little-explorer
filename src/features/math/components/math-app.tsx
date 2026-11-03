"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ProgressBanner } from "@/features/gamification/components/progress-banner";
import { ProgressPill } from "@/features/gamification/components/progress-pill";
import { RoundRewards } from "@/features/gamification/components/round-rewards";
import { useRoundReward } from "@/features/gamification/components/use-round-reward";
import { CalculationHelp } from "@/features/math/components/calculation-help";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Dices,
  Flower2,
  Heart,
  House,
  Lightbulb,
  RotateCcw,
  Sparkles,
  Sprout,
  Star,
  Trophy,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  createRound,
  equation,
  explain,
  games,
  limits,
  operationSign,
  recordAnswer,
  ROUND_LENGTH,
  scoreRound,
  spokenProblem,
  type Game,
  type GameId,
  type Limit,
  type Problem,
  type Round,
} from "@/features/math/data/games";

const gameStickers: Record<GameId, string> = {
  addition: "Insieme si cresce!",
  subtraction: "Una piccola scoperta!",
  multiplication: "Quante volte insieme!",
  division: "Tutto in parti uguali!",
  mixed: "Occhio al segno!",
  all: "Un po' di tutto!",
};

const operationPrompts: Record<Problem["gameId"], string> = {
  addition: "METTI INSIEME E SCOPRI",
  subtraction: "TOGLI E SCOPRI",
  multiplication: "RAGGRUPPA E SCOPRI",
  division: "DIVIDI E SCOPRI",
};

type PlayContext = {
  round: Round | null;
  limit: Limit;
  setLimit: (limit: Limit) => void;
  start: (id: GameId, limit?: Limit) => void;
  answer: (questionId: string, selected: number) => void;
  speak: (text: string) => void;
  sound: boolean;
};
const PlayContext = createContext<PlayContext | null>(null);

function usePlay() {
  const context = useContext(PlayContext);
  if (!context) throw new Error("Game components require AppShell");
  return context;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [round, setRound] = useState<Round | null>(null);
  const [limit, setLimit] = useState<Limit>(100);
  const [sound, setSound] = useState(true);
  const [audioError, setAudioError] = useState("");
  const pathname = usePathname();
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel();
    },
    [pathname],
  );

  function speak(text: string) {
    if (!sound) return;
    if (!("speechSynthesis" in window)) {
      setAudioError("Audio non disponibile in questo browser. Puoi continuare con i numeri scritti.");
      return;
    }
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.voice = window.speechSynthesis.getVoices().find((voice) => voice.lang.startsWith("it")) ?? null;
    speech.lang = "it-IT";
    speech.rate = 0.85;
    speech.onerror = (event) => {
      if (event.error !== "interrupted" && event.error !== "canceled") {
        setAudioError("La voce non risponde. Puoi continuare con i numeri scritti.");
      }
    };
    utterance.current = speech;
    setAudioError("");
    window.speechSynthesis.speak(speech);
  }

  function start(id: GameId, nextLimit = limit) {
    setLimit(nextLimit);
    setRound((previous) => createRound(id, nextLimit, previous ?? undefined));
  }

  function answer(questionId: string, selected: number) {
    setRound((current) => {
      if (!current) throw new Error("Nessuna partita in corso.");
      return recordAnswer(current, questionId, selected);
    });
  }

  return (
    <PlayContext.Provider value={{ round, limit, setLimit, start, answer, speak, sound }}>
      <a className="skip-link" href="#main">
        Vai al contenuto
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Little Explorer, tutti i mondi">
            <span className="brand-mark">
              <Sprout size={25} />
            </span>
            <span>
              little<span className="brand-sub">math</span>
              <span className="brand-dot">.</span>
            </span>
          </Link>
          <nav aria-label="Navigazione principale">
            <Link href="/math" aria-label="Tutti i minigiochi" className={`nav-home ${pathname === "/math" ? "active" : ""}`}>
              <House size={17} />
              <span>I minigiochi</span>
            </Link>
          </nav>
          <div className="header-right">
            <span className="header-note">Piccoli passi, grandi scoperte.</span>
            <ProgressPill />
            <button
              className="icon-button"
              aria-label={sound ? "Disattiva audio" : "Attiva audio"}
              aria-pressed={sound}
              onClick={() => {
                window.speechSynthesis?.cancel();
                setSound(!sound);
              }}
            >
              {sound ? <Volume2 size={21} /> : <VolumeX size={21} />}
            </button>
          </div>
        </div>
      </header>
      {audioError && (
        <div className="audio-notice" role="status">
          {audioError}
          <button className="icon-button" aria-label="Chiudi avviso" onClick={() => setAudioError("")}>
            <X size={18} />
          </button>
        </div>
      )}
      {children}
      <footer className="site-footer">
        <span>
          <Sprout size={16} /> Piccoli numeri, grandi scoperte.
        </span>
        <span>
          Fatto per imparare, con <Heart size={13} />
        </span>
      </footer>
    </PlayContext.Provider>
  );
}

function GameArt({ game }: { game: Game }) {
  return (
    <div className={`game-art art-${game.id}`} aria-hidden="true">
      <Sparkles className="art-spark" size={22} />
      <div className="number-blocks">
        {game.example.map((value, i) => (
          <span key={i}>{value}</span>
        ))}
      </div>
      <span className="art-sticker">{gameStickers[game.id]}</span>
      <Star className="art-star" size={23} />
    </div>
  );
}

function LevelPicker() {
  const { limit, setLimit } = usePlay();
  return (
    <fieldset className="level-picker">
      <legend>Quanto grandi, questi numeri?</legend>
      <div className="segmented-control">
        {limits.map((value) => (
          <button key={value} aria-pressed={limit === value} onClick={() => setLimit(value)}>
            Entro {value}
          </button>
        ))}
      </div>
      <p>Parti da 10, oppure fai un piccolo salto in avanti.</p>
    </fieldset>
  );
}

export function Dashboard() {
  const { start } = usePlay();
  const router = useRouter();
  return (
    <main id="main" className="dashboard page-width">
      <section className="welcome" aria-labelledby="welcome-title">
        <div>
          <span className="eyebrow">
            <Sparkles size={15} /> UN PICCOLO MONDO DA CONTARE
          </span>
          <h1 id="welcome-title">
            Ciao, piccolo
            <br />
            <span>esploratore!</span>
            <Flower2 className="hello-flower" aria-hidden="true" />
          </h1>
          <p>Le grandi scoperte iniziano dai piccoli numeri.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="welcome-bubble">Contiamo insieme?</span>
          <span className="hero-number">12</span>
          <span className="hero-plus">+</span>
          <span className="hero-small">3</span>
          <Star className="hero-star" size={30} fill="currentColor" />
          <span className="hero-caption">Un passo alla volta.</span>
        </div>
      </section>
      <ProgressBanner world="math" />
      <section aria-labelledby="games-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PRONTI A PARTIRE?</span>
            <h2 id="games-title">Con cosa giochiamo oggi?</h2>
          </div>
          <span className="small-note">
            <Sprout size={16} /> Nessuna fretta, solo curiosit&agrave;
          </span>
        </div>
        <LevelPicker />
        <div className="games-grid">
          {games.map((game) => (
            <Link key={game.id} className="game-card" href={`/math/play/${game.id}`} onClick={() => start(game.id)}>
              <GameArt game={game} />
              <div className="game-card-body">
                <span className={`category-label label-${game.id}`}>{game.subtitle}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-card-bottom">
                  <span>
                    <Clock3 size={15} /> 6 domande <span>/</span> al tuo ritmo
                  </span>
                  <span className="play-arrow">
                    <ArrowRight size={20} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="surprise-section" aria-labelledby="surprise-title">
        <span className="surprise-icon">
          <Dices size={29} />
        </span>
        <div>
          <h2 id="surprise-title">Oggi mi lascio sorprendere!</h2>
          <p>Pi&ugrave;, meno, per o diviso? Scegliamo un gioco per te.</p>
        </div>
        <button
          className="button button-primary"
          onClick={() => {
            const game = games[Math.floor(Math.random() * games.length)];
            start(game.id);
            router.push(`/math/play/${game.id}`);
          }}
        >
          Scegli per me <ArrowRight size={17} />
        </button>
      </section>
      <p className="encouragement">
        <Flower2 size={21} /> Non serve sapere tutto. Basta provare, un numero alla volta.
      </p>
    </main>
  );
}

function AudioButton({ problem }: { problem: Problem }) {
  const { speak, sound } = usePlay();
  return (
    <button
      className="button button-secondary"
      disabled={!sound}
      title={!sound ? "Attiva audio in alto per ascoltare" : undefined}
      onClick={() => speak(spokenProblem(problem))}
      aria-label={`Ascolta ${equation(problem)}`}
    >
      <Volume2 size={19} /> Ascolta
    </button>
  );
}

function QuestionCard({ round, game }: { round: Round; game: Game }) {
  const { answer } = usePlay();
  const router = useRouter();
  const index = round.answers.length;
  const question = round.questions[index];
  const [selected, setSelected] = useState<number | null>(null);
  const [help, setHelp] = useState(false);
  const lock = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const correct = selected === question.result;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  useEffect(() => {
    if (selected !== null) nextRef.current?.focus();
  }, [selected]);

  function next() {
    if (selected === null || lock.current) return;
    lock.current = true;
    answer(question.id, selected);
    if (index === ROUND_LENGTH - 1) router.push(`/math/play/${game.id}/result`);
  }

  return (
    <>
      <div className="game-toolbar">
        <Link className="back-link" href="/math">
          <ArrowLeft size={17} /> Tutti i giochi
        </Link>
        <span className="toolbar-title">
          {game.subtitle} <span>&middot; Entro {round.limit}</span>
        </span>
        <span className="round-counter">
          {index + 1} <span>/ {ROUND_LENGTH}</span>
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Domande completate"
        aria-valuemin={0}
        aria-valuemax={ROUND_LENGTH}
        aria-valuenow={index}
      >
        <span style={{ width: `${(index / ROUND_LENGTH) * 100}%` }} />
      </div>
      <div className="question-heading">
        <span className="eyebrow">{operationPrompts[question.gameId]}</span>
        <h1 tabIndex={-1} ref={titleRef}>
          Quanto fa?
        </h1>
      </div>
      <section className={`question-stage art-${question.gameId}`} aria-label="Operazione da risolvere">
        <p className="equation" aria-label={spokenProblem(question)}>
          {question.a} <span>{operationSign(question.gameId)}</span> {question.b} <span>=</span> ?
        </p>
        <AudioButton problem={question} />
      </section>
      <div className="help-toggle">
        <button className="text-button" aria-expanded={help} aria-controls="math-help" onClick={() => setHelp(!help)}>
          <Lightbulb size={18} /> {help ? "Nascondi l\u2019aiuto" : "Mi dai un aiutino?"}
        </button>
      </div>
      {help && (
        <aside className="math-help" id="math-help" aria-label="Aiuto per contare">
          <CalculationHelp problem={question} reveal={selected !== null} />
        </aside>
      )}
      <div className="answer-grid" role="group" aria-label="Scegli una risposta">
        {question.options.map((option, i) => {
          const isCorrect = option === question.result;
          const isSelected = selected === option;
          const feedback = selected === null ? "" : isCorrect ? "answer-correct" : isSelected ? "answer-wrong" : "answer-muted";
          return (
            <button
              key={option}
              className={`answer-option ${feedback}`}
              disabled={selected !== null}
              aria-pressed={isSelected}
              aria-label={`${option}${selected !== null && isCorrect ? ", risposta corretta" : ""}`}
              onClick={() => setSelected(option)}
            >
              <span className="option-number" aria-hidden="true">
                {i + 1}
              </span>
              <span>{option}</span>
              {selected !== null && (isCorrect || isSelected) && (
                <span className="answer-indicator" aria-hidden="true">
                  {isCorrect ? <Check size={23} /> : <X size={23} />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="feedback-space">
        {selected === null ? (
          <p className="game-reassurance">
            <Heart size={15} /> Prenditi il tuo tempo. Qui si impara provando.
          </p>
        ) : (
          <div className={`answer-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
            <div role="status">
              <strong>{correct ? "Proprio cos\u00ec! Ben fatto!" : "Un piccolo errore, una nuova scoperta!"}</strong>
              <p className="feedback-equation">
                {equation(question)} = {question.result}
              </p>
              <p>{explain(question, true)}</p>
            </div>
            <button ref={nextRef} className="button button-primary" onClick={next}>
              {index === ROUND_LENGTH - 1 ? "Il mio risultato" : "Avanti"} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export function PlayGame({ game }: { game: Game }) {
  const { round, start } = usePlay();
  const active = round?.gameId === game.id && round.answers.length < round.questions.length ? round : null;
  return (
    <main id="main" className="game-page page-width">
      {active ? (
        <QuestionCard key={`${active.questions[0].id}-${active.answers.length}`} round={active} game={game} />
      ) : (
        <>
          <Link className="back-link" href="/math">
            <ArrowLeft size={17} /> Tutti i giochi
          </Link>
          <section className="ready-state">
            <GameArt game={game} />
            <span className="eyebrow">{game.subtitle}</span>
            <h1>{game.title}</h1>
            <p>Sei piccoli calcoli, tutto il tempo che vuoi.</p>
            <LevelPicker />
            <button className="button button-primary" onClick={() => start(game.id)}>
              Cominciamo <ArrowRight size={18} />
            </button>
          </section>
        </>
      )}
    </main>
  );
}

export function Results({ game }: { game: Game }) {
  const { round, start } = usePlay();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "review">("all");
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  const completed = Boolean(round && round.gameId === game.id && round.answers.length === ROUND_LENGTH);
  const score = round && completed ? scoreRound(round.answers) : 0;
  const reward = useRoundReward({
    roundId: round?.id ?? "",
    world: "math",
    gameId: game.id,
    correct: score,
    total: ROUND_LENGTH,
    enabled: completed,
  });

  if (!round || !completed) {
    return (
      <main id="main" className="empty-state page-width">
        <Sprout size={65} />
        <h1 ref={headingRef} tabIndex={-1}>
          Una nuova avventura?
        </h1>
        <p>Qui non conserviamo le partite. Facciamo altri piccoli passi insieme!</p>
        <Link className="button button-primary" href={`/math/play/${game.id}`}>
          Giochiamo <ArrowRight size={18} />
        </Link>
        <Link className="back-link" href="/math">
          Tutti i giochi
        </Link>
      </main>
    );
  }
  const review = round.answers.filter(({ question, selected }) => question.result !== selected);
  const visible = filter === "review" ? review : round.answers;
  return (
    <main id="main" className="results-page page-width">
      <Link className="back-link" href="/math">
        <ArrowLeft size={17} /> Tutti i giochi
      </Link>
      <section className="result-celebration">
        <div className="trophy-art" aria-hidden="true">
          <Star size={23} />
          <Trophy size={80} strokeWidth={1.5} />
          <Sparkles size={25} />
        </div>
        <span className="eyebrow">AVVENTURA COMPLETATA &middot; ENTRO {round.limit}</span>
        <h1 ref={headingRef} tabIndex={-1}>
          {score === ROUND_LENGTH
            ? "Evviva! Tutte giuste!"
            : score >= 3
              ? "Ben fatto, esploratore!"
              : "Ogni tentativo ti fa crescere!"}
        </h1>
        <p>{score === ROUND_LENGTH ? "Sei calcoli, sei piccole conquiste." : "Anche dagli errori nascono nuove scoperte."}</p>
        <div className="score-line">
          <span>
            <Check size={20} />
            <strong>{score}</strong> risposte giuste
          </span>
          <span>
            <Sprout size={20} />
            <strong>{review.length}</strong> da ripassare
          </span>
        </div>
      </section>
      <RoundRewards reward={reward} />
      <section className="review-section" aria-labelledby="review-title">
        <div className="review-heading">
          <h2 id="review-title">I tuoi calcoli</h2>
          <div className="segmented-control" role="group" aria-label="Filtra risposte">
            <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
              Tutti ({ROUND_LENGTH})
            </button>
            <button aria-pressed={filter === "review"} onClick={() => setFilter("review")}>
              Da ripassare ({review.length})
            </button>
          </div>
        </div>
        <div className="review-list">
          {visible.length === 0 ? (
            <p className="nothing-to-review">
              <Check size={21} /> Nessun calcolo da ripassare. Ottimo lavoro!
            </p>
          ) : (
            visible.map(({ question, selected }) => {
              const correct = question.result === selected;
              return (
                <div className="review-row" key={question.id}>
                  <span
                    className={`review-icon ${correct ? "is-correct" : "is-wrong"}`}
                    aria-label={correct ? "Risposta corretta" : "Da ripassare"}
                  >
                    {correct ? <Check size={22} /> : <Sprout size={22} />}
                  </span>
                  <div className="review-calculation">
                    <strong>
                      {equation(question)} = {question.result}
                    </strong>
                    {!correct && (
                      <span>
                        La tua risposta: <s>{selected}</s>
                      </span>
                    )}
                    <details>
                      <summary>Scopri i passaggi</summary>
                      <CalculationHelp problem={question} reveal />
                    </details>
                  </div>
                  <AudioButton problem={question} />
                </div>
              );
            })
          )}
        </div>
      </section>
      <div className="result-actions">
        <button
          className="button button-primary"
          onClick={() => {
            start(game.id, round.limit);
            router.push(`/math/play/${game.id}`);
          }}
        >
          <RotateCcw size={18} /> Giochiamo ancora
        </button>
        <Link href="/math" className="button button-secondary">
          <House size={18} /> Un altro gioco
        </Link>
      </div>
      <p className="encouragement">
        <Heart size={17} /> Il bello &egrave; scoprire, non correre.
      </p>
    </main>
  );
}
