"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Dices,
  Globe2,
  Heart,
  House,
  RotateCcw,
  Sparkles,
  Sprout,
  Star,
  Volume2,
  X,
} from "lucide-react";
import {
  createRound,
  DIRECTION_LETTERS,
  games,
  scoreRound,
  type Direction,
  type Entry,
  type Game,
  type GeographyGameId,
  type Round,
} from "@/features/geography/data/games";
import { ProgressBanner } from "@/features/gamification/components/progress-banner";
import { RoundRewards } from "@/features/gamification/components/round-rewards";
import { GameSetup } from "@/features/gamification/components/game-setup";
import { useRoundReward } from "@/features/gamification/components/use-round-reward";
import { ProgressTrack } from "@/features/gamification/components/progress-track";
import { useRoundController } from "@/features/gamification/hooks/use-round-controller";
import { speakItalian, stopSpeech } from "@/features/gamification/lib/speech";
import { useSound } from "@/features/gamification/components/sound-context";

type RoundConfig = {
  selected?: readonly string[];
  roundLength?: number;
};

type PlayContext = {
  round: Round | null;
  start: (gameId: GeographyGameId, config?: RoundConfig) => void;
  answer: (selected: string) => void;
  speak: (text: string) => void;
  sound: boolean;
};

const PlayContext = createContext<PlayContext | null>(null);

function usePlay() {
  const context = useContext(PlayContext);
  if (!context) throw new Error("I giochi hanno bisogno di AppShell");
  return context;
}

function Illustration({ asset, className = "", alt = "" }: { asset: string; className?: string; alt?: string }) {
  return (
    <Image
      className={`illustration ${className}`}
      src={`/illustrations/${asset}.svg`}
      alt={alt}
      width={160}
      height={160}
      unoptimized
    />
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    round,
    start: startRound,
    answer: recordAnswer,
  } = useRoundController<Round, [GeographyGameId, RoundConfig?], [string]>({
    create: (previous, gameId, config) =>
      createRound(gameId, { entries: config?.selected, length: config?.roundLength }, previous ?? undefined),
    record: (current, selected) => {
      if (current.answers.length >= current.questions.length) return current;
      const entry = current.questions[current.answers.length].entry;
      return {
        ...current,
        answers: [...current.answers, { entry, selected, correct: selected === entry.answer }],
      };
    },
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
      rate: 0.92,
      unavailableMessage: "Audio non disponibile in questo browser. Puoi continuare con le parole scritte.",
      errorMessage: "La voce del dispositivo non risponde. Puoi continuare con le parole scritte.",
      onError: setAudioError,
    });
  }

  function start(gameId: GeographyGameId, config?: RoundConfig) {
    stopSpeech();
    startRound(gameId, config);
  }

  function answer(selected: string) {
    stopSpeech();
    recordAnswer(selected);
  }

  return (
    <PlayContext.Provider value={{ round, start, answer, speak, sound }}>
      {audioError && (
        <div className="audio-notice" role="status">
          {audioError}
          <button className="icon-button" onClick={() => setAudioError("")} aria-label="Chiudi avviso">
            <X size={18} />
          </button>
        </div>
      )}
      {children}
      <footer className="site-footer">
        <span className="footer-message">
          <Sprout size={16} /> Un passo alla volta, il mondo diventa più vicino.
        </span>
        <span>
          Fatto per imparare, con <Heart size={13} /> <span className="footer-divider">/</span>{" "}
          <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noreferrer">
            Twemoji
          </a>
          {" e "}
          {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
          <a href="/illustrations/ATTRIBUTION.md">illustrazioni originali</a>
        </span>
      </footer>
    </PlayContext.Provider>
  );
}

const COMPASS_POINTS: { direction: Direction; x: number; y: number; arm: string }[] = [
  { direction: "nord", x: 100, y: 22, arm: "100,30 112,100 88,100" },
  { direction: "est", x: 178, y: 106, arm: "170,100 100,112 100,88" },
  { direction: "sud", x: 100, y: 190, arm: "100,170 88,100 112,100" },
  { direction: "ovest", x: 22, y: 106, arm: "30,100 100,88 100,112" },
];

/** Rosa dei venti: il punto `highlight` è colorato e la sua lettera è sostituita da "?". */
export function CompassRose({ highlight, size = 190 }: { highlight?: Direction; size?: number }) {
  return (
    <svg
      className="compass-rose"
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label={highlight ? "Rosa dei venti con un punto cardinale colorato" : "Rosa dei venti"}
    >
      <circle cx="100" cy="100" r="78" className="compass-ring" />
      <circle cx="100" cy="100" r="58" className="compass-ring-inner" />
      {COMPASS_POINTS.map((point) => (
        <polygon
          key={point.direction}
          points={point.arm}
          className={point.direction === highlight ? "compass-arm is-highlight" : "compass-arm"}
        />
      ))}
      <circle cx="100" cy="100" r="7" className="compass-center" />
      {COMPASS_POINTS.map((point) => (
        <text
          key={point.direction}
          x={point.x}
          y={point.y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={point.direction === highlight ? "compass-letter is-highlight" : "compass-letter"}
        >
          {point.direction === highlight ? "?" : DIRECTION_LETTERS[point.direction]}
        </text>
      ))}
    </svg>
  );
}

function GameArt({ id }: { id: GeographyGameId }) {
  return (
    <div className={`game-art art-${id}`} aria-hidden="true">
      <span className="art-spark spark-one">
        <Sparkles />
      </span>
      <span className="art-spark spark-two">+</span>
      {id === "paesaggi" && (
        <>
          <Illustration asset="mountain" className="art-main" />
          <Illustration asset="beach" className="art-side" />
          <span className="art-sticker">mare e montagna</span>
        </>
      )}
      {id === "orientamento" && (
        <>
          <Illustration asset="ball-in-box" className="art-main" />
          <Illustration asset="point-right" className="art-side" />
          <span className="art-bubble">Dentro!</span>
          <span className="art-sticker">dentro o fuori?</span>
        </>
      )}
      {id === "punti-cardinali" && (
        <>
          <span className="art-main art-compass">
            <CompassRose size={120} />
          </span>
          <Illustration asset="compass" className="art-side" />
          <span className="art-sticker">nord, sud, est, ovest</span>
        </>
      )}
      {id === "bandiere" && (
        <>
          <Illustration asset="italy" className="art-main" />
          <Illustration asset="japan" className="art-side" />
          <span className="art-bubble">Ciao!</span>
          <span className="art-sticker">bandiere del mondo</span>
        </>
      )}
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();

  function surprise() {
    const game = games[Math.floor(Math.random() * games.length)];
    router.push(`/geography/play/${game.id}`);
  }

  return (
    <main id="main" className="dashboard page-width">
      <section className="welcome" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <span className="eyebrow">
            <span className="tiny-sun">
              <Compass size={15} />
            </span>{" "}
            UN PICCOLO MONDO DA ESPLORARE
          </span>
          <h1 id="welcome-title">
            Ciao, piccolo
            <br />
            <span>geografo!</span>
            <span className="hello-star" aria-hidden="true">
              <Globe2 />
            </span>
          </h1>
          <p>Paesaggi, punti cardinali e bandiere: il mondo è grande, scopriamolo insieme.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="welcome-bubble">Dove andiamo?</span>
          <Illustration asset="globe" className="welcome-rocket" />
          <span className="welcome-letter letter-a">N</span>
          <span className="welcome-letter letter-b">E</span>
          <span className="welcome-letter letter-c">S</span>
          <Star className="welcome-star star-one" size={24} fill="currentColor" />
          <Star className="welcome-star star-two" size={16} fill="currentColor" />
          <span className="orbit" />
        </div>
      </section>

      <ProgressBanner world="geography" />

      <section className="games-section" aria-labelledby="games-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow section-eyebrow">PRONTI A PARTIRE?</span>
            <h2 id="games-title">Dove ci porta il viaggio oggi?</h2>
          </div>
          <span className="small-note">
            <Sprout size={16} /> Bussola in tasca
          </span>
        </div>
        <div className="games-grid">
          {games.map((game, index) => (
            <Link
              key={game.id}
              className={`game-card card-${game.id}`}
              href={`/geography/play/${game.id}`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <GameArt id={game.id} />
              <div className="game-card-body">
                <span className="category-label">{game.focus}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-card-bottom">
                  <span>
                    <Clock3 size={14} /> Domande a scelta <span className="meta-dot">/</span> al tuo ritmo
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
        <div className="surprise-icon">
          <Dices size={29} strokeWidth={1.8} />
        </div>
        <div className="surprise-copy">
          <h2 id="surprise-title">Oggi mi lascio sorprendere!</h2>
          <p>Un paesaggio, una bandiera o la bussola? Scegliamo noi.</p>
        </div>
        <button className="button button-dark" onClick={surprise}>
          Scegli per me <ArrowRight size={17} />
        </button>
        <Sparkles className="surprise-spark" size={24} aria-hidden="true" />
      </section>
      <div className="encouragement">
        <Globe2 size={22} />
        <p>Ogni viaggio comincia da un piccolo passo.</p>
      </div>
    </main>
  );
}

function AudioButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const { speak, sound } = usePlay();
  return (
    <button
      className={compact ? "icon-button" : "button audio-button"}
      onClick={() => speak(text)}
      disabled={!sound}
      title={sound ? `Ascolta: ${text}` : "Attiva audio in alto per ascoltare"}
      aria-label={`Ascolta: ${text}`}
    >
      <Volume2 size={compact ? 19 : 22} />
      {!compact && "Ascolta"}
    </button>
  );
}

function EntryVisual({ entry, small = false }: { entry: Entry; small?: boolean }) {
  if (entry.compass) return <CompassRose highlight={entry.compass} size={small ? 56 : 190} />;
  if (entry.image) {
    return <Illustration asset={entry.image} className={small ? "small-word-art" : "question-image geography-image"} />;
  }
  return null;
}

export function PlayGame({ game }: { game: Game }) {
  const { round, start, answer } = usePlay();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const nextLock = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const activeRound = round?.gameId === game.id && round.answers.length < round.questions.length ? round : null;
  const questionIndex = activeRound?.answers.length ?? 0;

  useEffect(() => {
    titleRef.current?.focus();
    nextLock.current = false;
  }, [questionIndex]);

  useEffect(() => {
    if (selected) nextRef.current?.focus();
  }, [selected]);

  if (!activeRound) {
    const setupItems = game.entries.map((entry) => ({
      id: entry.id,
      label: entry.answer,
      hint: entry.prompt,
      image: entry.image,
      text: entry.compass ? DIRECTION_LETTERS[entry.compass] : undefined,
    }));
    return (
      <main id="main" className="game-page page-width">
        <Link className="back-link" href="/geography">
          <ArrowLeft size={17} /> Tutti i giochi
        </Link>
        <section className={`ready-state theme-${game.id}`}>
          <GameArt id={game.id} />
          <span className="eyebrow">{game.focus}</span>
          <h1>{game.title}</h1>
          <p>{game.intro}</p>
          <GameSetup
            key={game.id}
            world="geography"
            gameId={game.id}
            items={setupItems}
            onStart={({ selected: chosen, roundLength }) => {
              setSelected(null);
              start(game.id, { selected: chosen, roundLength });
            }}
          />
        </section>
      </main>
    );
  }

  const question = activeRound.questions[questionIndex];
  const entry = question.entry;
  const total = activeRound.questions.length;
  const correct = selected === entry.answer;

  function nextQuestion() {
    if (!selected || nextLock.current) return;
    nextLock.current = true;
    answer(selected);
    setSelected(null);
    if (questionIndex === activeRound!.questions.length - 1) router.push(`/geography/play/${game.id}/result`);
  }

  return (
    <main id="main" className={`game-page page-width theme-${game.id}`}>
      <div className="game-toolbar">
        <Link className="back-link" href="/geography" aria-label="Tutti i giochi" title="Tutti i giochi">
          <ArrowLeft size={17} /> <span>Tutti i giochi</span>
        </Link>
        <span className="game-toolbar-title">{game.title}</span>
        <span className="round-counter">
          {questionIndex + 1} <span>/ {total}</span>
        </span>
      </div>
      <ProgressTrack index={questionIndex} total={total} />
      <div className="question-heading">
        <span className="eyebrow">{game.label}</span>
        <h1 ref={titleRef} tabIndex={-1}>
          {entry.prompt}
        </h1>
      </div>
      <div className="question-stage letter-stage">
        <div className="question-visual choices-visual geography-visual">
          <EntryVisual entry={entry} />
          {entry.hint && <span className="pattern-hint">{entry.hint}</span>}
        </div>
        <AudioButton text={entry.prompt} />
      </div>
      <div className="answer-grid text-answers choices-answers" role="group" aria-label={entry.prompt}>
        {question.options.map((option, index) => {
          const isSelected = selected === option;
          const isCorrect = option === entry.answer;
          const feedbackClass = selected ? (isCorrect ? "answer-correct" : isSelected ? "answer-wrong" : "answer-muted") : "";
          return (
            <button
              key={`${entry.id}-${option}`}
              className={`answer-option ${feedbackClass}`}
              disabled={!!selected}
              aria-pressed={isSelected}
              onClick={() => setSelected(option)}
            >
              <span className="option-number">{index + 1}</span>
              <span className={option.length > 12 ? "long-answer" : undefined}>{option}</span>
              {selected && (isCorrect || isSelected) && (
                <span className="answer-indicator">{isCorrect ? <Check size={21} /> : <X size={21} />}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="feedback-space">
        {selected ? (
          <div className={`answer-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
            <div role="status">
              <strong>{correct ? "Sì! Proprio così!" : "Quasi! Guarda bene."}</strong>
              <span className="feedback-line">
                <b className="feedback-solution">{entry.answer}</b>
                <span className="feedback-note">{entry.note}</span>
                <AudioButton text={entry.note} compact />
              </span>
            </div>
            <button ref={nextRef} className="button button-primary" onClick={nextQuestion}>
              {questionIndex === total - 1 ? "Il mio risultato" : "Avanti"}
              <ArrowRight size={18} />
            </button>
          </div>
        ) : (
          <p className="game-reassurance">
            <Heart size={15} /> Prenditi il tuo tempo.
          </p>
        )}
      </div>
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
    world: "geography",
    gameId: game.id,
    correct: score,
    total: round?.questions.length ?? 6,
    enabled: completed,
  });

  if (!round || !completed) {
    return (
      <main id="main" className="empty-state page-width">
        <Illustration asset="globe" />
        <h1 ref={headingRef} tabIndex={-1}>
          Un nuovo viaggio?
        </h1>
        <p>Qui non conserviamo le partite. Le scoperte restano con te.</p>
        <Link className="button button-primary" href={`/geography/play/${game.id}`}>
          Giochiamo <ArrowRight size={18} />
        </Link>
        <Link className="back-link" href="/geography">
          Tutti i giochi
        </Link>
      </main>
    );
  }
  const review = round.answers.filter((answer) => !answer.correct);
  const visibleAnswers = filter === "review" ? review : round.answers;
  const total = round.questions.length;

  return (
    <main id="main" className="results-page page-width">
      <Link className="back-link" href="/geography">
        <ArrowLeft size={17} /> Tutti i giochi
      </Link>
      <section className="result-celebration">
        <div className="trophy-art">
          <Star className="trophy-star first" size={23} fill="currentColor" />
          <Illustration asset="trophy" />
          <Star className="trophy-star second" size={18} fill="currentColor" />
        </div>
        <span className="eyebrow">VIAGGIO COMPLETATO</span>
        <h1 ref={headingRef} tabIndex={-1}>
          {score === total
            ? "Bravissimo! Tutte giuste!"
            : score >= Math.ceil(total / 2)
              ? "Ben fatto, esploratore!"
              : "Ogni viaggio insegna qualcosa!"}
        </h1>
        <p>
          {score === total
            ? `${total} ${total === 1 ? "risposta" : "risposte"}, ${total} piccole scoperte.`
            : "Anche dagli errori nascono nuove scoperte."}
        </p>
        <div className="score-line">
          <span>
            <Check size={20} /> <strong>{score}</strong> risposte giuste
          </span>
          <span>
            <Sprout size={20} /> <strong>{total - score}</strong> da ripassare
          </span>
        </div>
      </section>
      <RoundRewards reward={reward} />
      <section className="review-section" aria-labelledby="review-title">
        <div className="review-heading">
          <h2 id="review-title">Le tue scoperte</h2>
          <div className="segmented-control" role="group" aria-label="Filtra risposte">
            <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
              Tutte ({total})
            </button>
            <button aria-pressed={filter === "review"} onClick={() => setFilter("review")}>
              Da ripassare ({review.length})
            </button>
          </div>
        </div>
        <div className="review-list">
          {visibleAnswers.length === 0 ? (
            <p className="nothing-to-review">
              <Check size={21} /> Nessuna risposta da ripassare. Ottimo lavoro!
            </p>
          ) : (
            visibleAnswers.map(({ entry, selected, correct }) => (
              <div className="review-row" key={entry.id}>
                <span className="review-geography-art">
                  <EntryVisual entry={entry} small />
                </span>
                <div className="review-word">
                  <strong>{entry.answer}</strong>
                  <span>{entry.note}</span>
                </div>
                <div className={`review-answer ${correct ? "is-correct" : "is-wrong"}`}>
                  {correct ? (
                    <>
                      <Check size={17} />
                      <span>Giusto!</span>
                    </>
                  ) : (
                    <>
                      <span>
                        La tua risposta: <s className="review-selected">{selected}</s>
                      </span>
                      <ChevronRight size={15} />
                      <strong>{entry.answer}</strong>
                    </>
                  )}
                </div>
                <AudioButton text={entry.note} compact />
              </div>
            ))
          )}
        </div>
      </section>
      <div className="result-actions">
        <button
          className="button button-primary"
          onClick={() => {
            start(game.id, { selected: round.selection, roundLength: round.roundLength });
            router.push(`/geography/play/${game.id}`);
          }}
        >
          <RotateCcw size={18} /> Giochiamo ancora
        </button>
        <Link href="/geography" className="button button-secondary">
          <House size={18} /> Un altro gioco
        </Link>
      </div>
    </main>
  );
}
