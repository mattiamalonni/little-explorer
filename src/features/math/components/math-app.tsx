"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { ProgressBanner } from "@/features/gamification/components/progress-banner";
import { RoundRewards } from "@/features/gamification/components/round-rewards";
import { GameSetup } from "@/features/gamification/components/game-setup";
import { useRoundReward } from "@/features/gamification/components/use-round-reward";
import { ProgressTrack } from "@/features/gamification/components/progress-track";
import { useRoundController } from "@/features/gamification/hooks/use-round-controller";
import { speakItalian, stopSpeech } from "@/features/gamification/lib/speech";
import { useSound } from "@/features/gamification/components/sound-context";
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
  "doubles-halves": "Doppio o metà!",
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
  start: (id: GameId, limit: Limit, options?: { length?: number }) => void;
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
  const { round, start, answer } = useRoundController<Round, [GameId, Limit, { length?: number }?], [string, number]>({
    create: (previous, id, nextLimit, options) => createRound(id, nextLimit, { length: options?.length }, previous ?? undefined),
    record: (current, questionId, selected) => recordAnswer(current, questionId, selected),
  });
  const { sound } = useSound();
  const [audioError, setAudioError] = useState("");
  const pathname = usePathname();

  useEffect(() => stopSpeech, [pathname]);

  useEffect(() => {
    if (!sound) stopSpeech();
  }, [sound]);

  function speak(text: string) {
    if (!sound) return;
    setAudioError("");
    speakItalian(text, {
      rate: 0.85,
      unavailableMessage: "Audio non disponibile in questo browser. Puoi continuare con i numeri scritti.",
      errorMessage: "La voce non risponde. Puoi continuare con i numeri scritti.",
      onError: setAudioError,
    });
  }

  return (
    <PlayContext.Provider value={{ round, start, answer, speak, sound }}>
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

export function Dashboard() {
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
        <div className="games-grid">
          {games.map((game) => (
            <Link key={game.id} className="game-card" href={`/math/play/${game.id}`}>
              <GameArt game={game} />
              <div className="game-card-body">
                <span className={`category-label label-${game.id}`}>{game.subtitle}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-card-bottom">
                  <span>
                    <Clock3 size={15} /> Domande a scelta <span>/</span> al tuo ritmo
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
  const total = round.questions.length;
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
    if (index === total - 1) router.push(`/math/play/${game.id}/result`);
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
          {index + 1} <span>/ {total}</span>
        </span>
      </div>
      <ProgressTrack index={index} total={total} />
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
              {index === total - 1 ? "Il mio risultato" : "Avanti"} <ArrowRight size={18} />
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
            <p>Scegli quanto grandi i numeri e quante domande.</p>
            <GameSetup
              key={game.id}
              world="math"
              gameId={game.id}
              limits={limits.map((value) => ({ value, label: `Entro ${value}` }))}
              onStart={({ roundLength, limit: chosenLimit }) => {
                const nextLimit = limits.includes(chosenLimit as Limit) ? (chosenLimit as Limit) : 10;
                start(game.id, nextLimit, { length: roundLength });
              }}
            />
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
  const completed = Boolean(round && round.gameId === game.id && round.answers.length === round.questions.length);
  const score = round && completed ? scoreRound(round.answers) : 0;
  const reward = useRoundReward({
    roundId: round?.id ?? "",
    world: "math",
    gameId: game.id,
    correct: score,
    total: round?.questions.length ?? 6,
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
  const total = round.questions.length;
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
          {score === total
            ? "Evviva! Tutte giuste!"
            : score >= Math.ceil(total / 2)
              ? "Ben fatto, esploratore!"
              : "Ogni tentativo ti fa crescere!"}
        </h1>
        <p>
          {score === total
            ? `${total} ${total === 1 ? "calcolo" : "calcoli"}, ${total} piccole conquiste.`
            : "Anche dagli errori nascono nuove scoperte."}
        </p>
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
              Tutti ({total})
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
            start(game.id, round.limit, { length: total });
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
