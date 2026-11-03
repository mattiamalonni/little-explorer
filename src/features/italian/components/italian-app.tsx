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
  Dices,
  Flower2,
  Heart,
  House,
  RotateCcw,
  Sparkles,
  Sprout,
  Star,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  createRound,
  expectedAnswer,
  games,
  isAnswerCorrect,
  scoreRound,
  type Entry,
  type Game,
  type GameId,
  type Round,
} from "@/features/italian/data/games";
import { audioPath } from "@/features/italian/lib/audio";
import { ProgressBanner } from "@/features/gamification/components/progress-banner";
import { ProgressPill } from "@/features/gamification/components/progress-pill";
import { RoundRewards } from "@/features/gamification/components/round-rewards";
import { useRoundReward } from "@/features/gamification/components/use-round-reward";

type PlayContext = {
  round: Round | null;
  start: (gameId: GameId) => void;
  answer: (selected: string) => void;
  speak: (text: string) => void;
  sound: boolean;
};

const PlayContext = createContext<PlayContext | null>(null);

function usePlay() {
  const context = useContext(PlayContext);
  if (!context) throw new Error("Game components require AppShell");
  return context;
}

export function Illustration({ asset, className = "", alt = "" }: { asset: string; className?: string; alt?: string }) {
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

function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [round, setRound] = useState<Round | null>(null);
  const [sound, setSound] = useState(true);
  const [audioError, setAudioError] = useState("");
  const pathname = usePathname();
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      const current = audio.current;
      audio.current = null;
      if (current) {
        current.onerror = null;
        current.pause();
        current.removeAttribute("src");
        current.load();
      }
      stopSpeech();
    };
  }, [pathname]);

  function stopAudio() {
    const current = audio.current;
    audio.current = null;
    if (current) {
      current.onerror = null;
      current.pause();
      current.removeAttribute("src");
      current.load();
    }
    stopSpeech();
  }

  function speak(text: string) {
    if (!sound) return;
    stopAudio();
    const clip = new Audio(audioPath(text));
    audio.current = clip;
    setAudioError("");

    function fallbackToDevice() {
      if (audio.current !== clip) return;
      audio.current = null;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "it-IT";
        utterance.rate = 0.92;
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      } else {
        setAudioError("Audio non disponibile. Riprova premendo Ascolta oppure continua con le parole scritte.");
      }
    }

    clip.onerror = fallbackToDevice;
    void clip.play().catch(fallbackToDevice);
  }

  function start(gameId: GameId) {
    stopAudio();
    setRound((previous) => createRound(gameId, previous ?? undefined));
  }

  function answer(selected: string) {
    stopAudio();
    setRound((current) => {
      if (!current || current.answers.length >= current.questions.length) return current;
      const game = games.find((entry) => entry.id === current.gameId);
      const entry = current.questions[current.answers.length].entry;
      if (!game) return current;
      return {
        ...current,
        answers: [
          ...current.answers,
          {
            entry,
            selected,
            expected: expectedAnswer(game, entry),
            correct: isAnswerCorrect(game, entry, selected),
          },
        ],
      };
    });
  }

  return (
    <PlayContext.Provider value={{ round, start, answer, speak, sound }}>
      <a className="skip-link" href="#main">
        Vai al contenuto
      </a>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="Little Explorer, tutti i mondi">
            <span className="brand-mark">
              <Sprout size={25} strokeWidth={2.4} />
            </span>
            <span>
              little<span className="brand-language">italiano</span>
              <span className="brand-dot">.</span>
            </span>
          </Link>
          <nav aria-label="Navigazione principale">
            <Link
              href="/italian"
              aria-label="Tutti i minigiochi"
              title="Tutti i minigiochi"
              className={`nav-home ${pathname === "/italian" ? "active" : ""}`}
            >
              <House size={17} /> <span>I minigiochi</span>
            </Link>
          </nav>
          <div className="header-right">
            <span className="header-note">Suoni, lettere, meraviglie.</span>
            <ProgressPill />
            <button
              className="icon-button sound-toggle"
              title={sound ? "Disattiva audio" : "Attiva audio"}
              aria-label={sound ? "Disattiva audio" : "Attiva audio"}
              aria-pressed={sound}
              onClick={() => {
                stopAudio();
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
          <button className="icon-button" onClick={() => setAudioError("")} aria-label="Chiudi avviso">
            <X size={18} />
          </button>
        </div>
      )}
      {children}
      <footer className="site-footer">
        <span className="footer-message">
          <Sprout size={16} /> Un po&apos; di italiano, un mondo di scoperte.
        </span>
        <span>
          Fatto per imparare, con <Heart size={13} /> <span className="footer-divider">/</span>{" "}
          <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noreferrer">
            Twemoji
          </a>
          {" e "}
          {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
          <a href="/illustrations/ATTRIBUTION.md">illustrazioni originali</a> <span className="footer-divider">/</span>{" "}
          <span title="Gli MP3 locali sono opzionali; in loro assenza viene usata la voce italiana del dispositivo.">
            Audio: voce del dispositivo o elevenlabs.io
          </span>
        </span>
      </footer>
    </PlayContext.Provider>
  );
}

function GameArt({ id }: { id: GameId }) {
  return (
    <div className={`game-art art-${id}`} aria-hidden="true">
      <span className="art-spark spark-one">
        <Sparkles />
      </span>
      <span className="art-spark spark-two">+</span>
      {id === "gn" && (
        <>
          <Illustration asset="spider" className="art-main" />
          <Illustration asset="mountain" className="art-side" />
          <span className="art-sticker">gn come gnomo</span>
        </>
      )}
      {id === "gli" && (
        <>
          <Illustration asset="rabbit" className="art-main" />
          <Illustration asset="leaf" className="art-side" />
          <span className="art-bubble">Gli!</span>
          <span className="art-sticker">coniglio e foglia</span>
        </>
      )}
      {id === "sc" && (
        <>
          <Illustration asset="fish" className="art-main" />
          <Illustration asset="monkey" className="art-side" />
          <span className="art-bubble">Sc!</span>
          <span className="art-sticker">pesce e scimmia</span>
        </>
      )}
      {id === "ch" && (
        <>
          <Illustration asset="key" className="art-main" />
          <Illustration asset="mushroom" className="art-side" />
          <span className="art-sticker">chiave e funghi</span>
        </>
      )}
      {id === "cu" && (
        <>
          <Illustration asset="water" className="art-main" />
          <Illustration asset="spoon" className="art-side" />
          <span className="art-bubble">Qu!</span>
          <span className="art-sticker">acqua e cucchiaio</span>
        </>
      )}
      {id === "double-consonants" && (
        <>
          <Illustration asset="ball" className="art-main" />
          <Illustration asset="cat" className="art-side" />
          <span className="art-sticker">palla e gatto</span>
        </>
      )}
      {id === "accents" && (
        <>
          <Illustration asset="cup" className="art-main" />
          <Illustration asset="calendar" className="art-side" />
          <span className="letter-tile">À</span>
          <span className="art-sticker">caffè e lunedì</span>
        </>
      )}
      {id === "h" && (
        <>
          <Illustration asset="book" className="art-main" />
          <Illustration asset="pencil" className="art-side" />
          <span className="letter-tile">H</span>
          <span className="art-sticker">l&apos;acca magica</span>
        </>
      )}
    </div>
  );
}

export function Dashboard() {
  const { start } = usePlay();
  const router = useRouter();

  function surprise() {
    const game = games[Math.floor(Math.random() * games.length)];
    start(game.id);
    router.push(`/italian/play/${game.id}`);
  }

  return (
    <main id="main" className="dashboard page-width">
      <section className="welcome" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <span className="eyebrow">
            <span className="tiny-sun">
              <Sparkles size={15} />
            </span>{" "}
            UN PICCOLO MONDO DI SUONI
          </span>
          <h1 id="welcome-title">
            Ciao, piccolo
            <br />
            <span>esploratore!</span>
            <span className="hello-star" aria-hidden="true">
              <Flower2 />
            </span>
          </h1>
          <p>Ogni parola è un&apos;avventura da scoprire.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="welcome-bubble">Ciao!</span>
          <Illustration asset="rocket" className="welcome-rocket" />
          <span className="welcome-letter letter-a">gn</span>
          <span className="welcome-letter letter-b">gl</span>
          <span className="welcome-letter letter-c">sc</span>
          <Star className="welcome-star star-one" size={24} fill="currentColor" />
          <Star className="welcome-star star-two" size={16} fill="currentColor" />
          <span className="orbit" />
        </div>
      </section>

      <ProgressBanner world="italian" />

      <section className="games-section" aria-labelledby="games-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow section-eyebrow">PRONTI A PARTIRE?</span>
            <h2 id="games-title">Che cosa scopriamo oggi?</h2>
          </div>
          <span className="small-note">
            <Sprout size={16} /> Si parte dalle piccole lettere
          </span>
        </div>
        <div className="games-grid">
          {games.map((game, index) => (
            <Link
              key={game.id}
              className={`game-card card-${game.id}`}
              href={`/italian/play/${game.id}`}
              onClick={() => start(game.id)}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <GameArt id={game.id} />
              <div className="game-card-body">
                <span className="category-label">{game.focus}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-card-bottom">
                  <span>
                    <Clock3 size={14} /> 6 domande <span className="meta-dot">/</span> 2 min
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
          <p>La prossima avventura? Una sorpresa.</p>
        </div>
        <button className="button button-dark" onClick={surprise}>
          Scegli per me <ArrowRight size={17} />
        </button>
        <Sparkles className="surprise-spark" size={24} aria-hidden="true" />
      </section>
      <div className="encouragement">
        <Flower2 size={22} />
        <p>Non serve sapere tutto. Basta un po&apos; di curiosità.</p>
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
      title={sound ? `Ascolta ${text}` : "Attiva audio in alto per ascoltare"}
      aria-label={`Ascolta ${text}`}
    >
      <Volume2 size={compact ? 19 : 22} />
      {!compact && "Ascolta"}
    </button>
  );
}

function PatternText({ text }: { text: string }) {
  const parts = text.split("__");
  return (
    <span className="pattern-text-inner">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && (
            <span className="pattern-gap" aria-label="lettere mancanti">
              ?
            </span>
          )}
        </span>
      ))}
    </span>
  );
}

function QuestionVisual({ entry, game }: { entry: Entry; game: Game }) {
  return (
    <div className={`question-visual ${game.mode === "words" ? "words-visual" : "letters-visual"}`}>
      {entry.image && <Illustration asset={entry.image} className="question-image" />}
      {entry.color && (
        <span className="color-swatch" style={{ backgroundColor: entry.color }} role="img" aria-label={entry.solution} />
      )}
      {entry.number !== undefined && (
        <span className="number-pill" role="img" aria-label={String(entry.number)}>
          {entry.number}
        </span>
      )}
      <span className={`pattern-text ${game.mode === "words" ? "sentence-pattern" : "word-pattern"}`}>
        <PatternText text={entry.pattern} />
      </span>
      {entry.hint && <span className="pattern-hint">{entry.hint}</span>}
    </div>
  );
}

export function PlayGame({ game }: { game: Game }) {
  const { round, start, answer } = usePlay();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const nextLock = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const activeRound = round?.gameId === game.id && round.answers.length < round.questions.length ? round : null;
  const questionIndex = activeRound?.answers.length ?? 0;

  useEffect(() => {
    titleRef.current?.focus();
    nextLock.current = false;
  }, [questionIndex]);

  if (!activeRound) {
    return (
      <main id="main" className="game-page page-width">
        <Link className="back-link" href="/italian">
          <ArrowLeft size={17} /> Tutti i giochi
        </Link>
        <section className={`ready-state theme-${game.id}`}>
          <GameArt id={game.id} />
          <span className="eyebrow">{game.focus}</span>
          <h1>{game.title}</h1>
          <p>{game.intro}</p>
          <button
            className="button button-primary"
            onClick={() => {
              setSelected(null);
              setTyped("");
              start(game.id);
            }}
          >
            Cominciamo <ArrowRight size={18} />
          </button>
        </section>
      </main>
    );
  }

  const question = activeRound.questions[questionIndex];
  const correct = selected ? isAnswerCorrect(game, question.entry, selected) : false;

  function nextQuestion() {
    if (!selected || nextLock.current) return;
    nextLock.current = true;
    answer(selected);
    setSelected(null);
    setTyped("");
    if (questionIndex === activeRound!.questions.length - 1) router.push(`/italian/play/${game.id}/result`);
  }

  return (
    <main id="main" className={`game-page page-width theme-${game.id}`}>
      <div className="game-toolbar">
        <Link className="back-link" href="/italian" aria-label="Tutti i giochi" title="Tutti i giochi">
          <ArrowLeft size={17} /> <span>Tutti i giochi</span>
        </Link>
        <span className="game-toolbar-title">{game.title}</span>
        <span className="round-counter">
          {questionIndex + 1} <span>/ 6</span>
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Domande completate"
        aria-valuemin={0}
        aria-valuemax={6}
        aria-valuenow={questionIndex}
      >
        <span style={{ width: `${(questionIndex / 6) * 100}%` }} />
      </div>
      <div className="question-heading">
        <span className="eyebrow">{game.label}</span>
        <h1 ref={titleRef} tabIndex={-1}>
          {game.prompt}
        </h1>
      </div>
      <div className={`question-stage ${game.mode === "words" ? "sentence-stage" : "letter-stage"}`}>
        <QuestionVisual entry={question.entry} game={game} />
        <AudioButton text={question.entry.spoken} />
      </div>
      <form
        className="write-answer"
        onSubmit={(event) => {
          event.preventDefault();
          if (selected) return;
          const value = typed.trim();
          if (!value) return;
          setSelected(value);
        }}
      >
        <label className="write-answer-label" htmlFor="word-answer">
          La tua risposta
        </label>
        <div className="write-answer-row">
          <input
            id="word-answer"
            name="answer"
            className={`write-answer-input ${selected ? (correct ? "input-correct" : "input-wrong") : ""}`}
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
            disabled={!!selected}
            lang="it"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            placeholder="Scrivi qui…"
            aria-describedby="word-answer-help"
          />
          <button type="submit" className="button button-primary write-answer-submit" disabled={!!selected || !typed.trim()}>
            <Check size={18} /> Controlla
          </button>
        </div>
        <p className="write-answer-help" id="word-answer-help">
          {game.mode === "words"
            ? "Scrivi solo la parola che manca, con le lettere giuste."
            : "Guarda le lettere mancanti e scrivi tutta la parola."}
        </p>
      </form>
      <div className="feedback-space">
        {selected ? (
          <div className={`answer-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
            <div role="status">
              <strong>{correct ? "Sì! Proprio così!" : "Quasi! Guarda come si scrive."}</strong>
              <span className="feedback-line">
                <b className="feedback-solution">{question.entry.solution}</b>
                <span className="feedback-note">{question.entry.note}</span>
                <AudioButton text={question.entry.spoken} compact />
              </span>
            </div>
            <button className="button button-primary" onClick={nextQuestion}>
              {questionIndex === 5 ? "Il mio risultato" : "Avanti"}
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
  const completed = Boolean(round && round.gameId === game.id && round.answers.length === round.questions.length);
  const score = round && completed ? scoreRound(round.answers) : 0;
  const reward = useRoundReward({
    roundId: round?.id ?? "",
    world: "italian",
    gameId: game.id,
    correct: score,
    total: round?.questions.length ?? 6,
    enabled: completed,
  });

  if (!round || !completed) {
    return (
      <main id="main" className="empty-state page-width">
        <Illustration asset="seedling" />
        <h1>Una nuova avventura?</h1>
        <p>Qui non conserviamo le partite. Le parole imparate restano con te.</p>
        <Link className="button button-primary" href={`/italian/play/${game.id}`} onClick={() => start(game.id)}>
          Giochiamo <ArrowRight size={18} />
        </Link>
        <Link className="back-link" href="/italian">
          Tutti i giochi
        </Link>
      </main>
    );
  }
  const review = round.answers.filter((entry) => !entry.correct);
  const visibleAnswers = filter === "review" ? review : round.answers;

  return (
    <main id="main" className="results-page page-width">
      <Link className="back-link" href="/italian">
        <ArrowLeft size={17} /> Tutti i giochi
      </Link>
      <section className="result-celebration">
        <div className="trophy-art">
          <Star className="trophy-star first" size={23} fill="currentColor" />
          <Illustration asset="trophy" />
          <Star className="trophy-star second" size={18} fill="currentColor" />
        </div>
        <span className="eyebrow">AVVENTURA COMPLETATA</span>
        <h1>
          {score === 6 ? "Bravissimo! Tutte giuste!" : score >= 3 ? "Ben fatto, esploratore!" : "Ogni parola è un nuovo inizio!"}
        </h1>
        <p>{score === 6 ? "Sei parole, sei piccole conquiste." : "Anche dagli errori nascono nuove scoperte."}</p>
        <div className="score-line">
          <span>
            <Check size={20} /> <strong>{score}</strong> risposte giuste
          </span>
          <span>
            <Sprout size={20} /> <strong>{6 - score}</strong> da ripassare
          </span>
        </div>
      </section>
      <RoundRewards reward={reward} />
      <section className="review-section" aria-labelledby="review-title">
        <div className="review-heading">
          <h2 id="review-title">Le tue parole</h2>
          <div className="segmented-control" role="group" aria-label="Filtra risposte">
            <button aria-pressed={filter === "all"} onClick={() => setFilter("all")}>
              Tutte (6)
            </button>
            <button aria-pressed={filter === "review"} onClick={() => setFilter("review")}>
              Da ripassare ({review.length})
            </button>
          </div>
        </div>
        <div className="review-list">
          {visibleAnswers.length === 0 ? (
            <p className="nothing-to-review">
              <Check size={21} /> Nessuna parola da ripassare. Ottimo lavoro!
            </p>
          ) : (
            visibleAnswers.map((entry) => {
              const isCorrect = entry.correct;
              return (
                <div className="review-row" key={entry.entry.id}>
                  {entry.entry.image ? (
                    <Illustration asset={entry.entry.image} className="small-word-art" />
                  ) : (
                    <span className="review-badge" aria-hidden="true">
                      {entry.entry.answer}
                    </span>
                  )}
                  <div className="review-word">
                    <strong>{entry.entry.solution}</strong>
                    <span>{entry.entry.note}</span>
                  </div>
                  <div className={`review-answer ${isCorrect ? "is-correct" : "is-wrong"}`}>
                    {isCorrect ? (
                      <>
                        <Check size={17} />
                        <span>Giusto!</span>
                      </>
                    ) : (
                      <>
                        <span>
                          La tua risposta: <s className="review-selected">{entry.selected}</s>
                        </span>
                        <ChevronRight size={15} />
                        <strong>{entry.expected}</strong>
                      </>
                    )}
                  </div>
                  <AudioButton text={entry.entry.spoken} compact />
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
            start(game.id);
            router.push(`/italian/play/${game.id}`);
          }}
        >
          <RotateCcw size={18} /> Giochiamo ancora
        </button>
        <Link href="/italian" className="button button-secondary">
          <House size={18} /> Un altro gioco
        </Link>
      </div>
    </main>
  );
}
