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
  games,
  scoreRound,
  type Game,
  type GameId,
  type Round,
  type Word,
} from "@/features/english/data/games";
import { wordAudioPath } from "@/features/english/lib/audio";

type PlayContext = {
  round: Round | null;
  start: (gameId: GameId) => void;
  answer: (word: Word) => void;
  speak: (text: string) => void;
  sound: boolean;
};

const PlayContext = createContext<PlayContext | null>(null);

function usePlay() {
  const context = useContext(PlayContext);
  if (!context) throw new Error("Game components require AppShell");
  return context;
}

export function Illustration({
  asset,
  className = "",
  alt = "",
}: {
  asset: string;
  className?: string;
  alt?: string;
}) {
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
  }

  function speak(text: string) {
    if (!sound) return;
    stopAudio();
    const clip = new Audio(wordAudioPath(text));
    audio.current = clip;
    setAudioError("");
    function reportError() {
      if (audio.current !== clip) return;
      setAudioError(
        "Audio non disponibile. Riprova premendo Ascolta oppure continua con le parole scritte.",
      );
    }
    clip.onerror = reportError;
    void clip.play().catch(reportError);
  }

  function start(gameId: GameId) {
    stopAudio();
    setRound((previous) => createRound(gameId, previous ?? undefined));
  }

  function answer(selected: Word) {
    stopAudio();
    setRound((current) => {
      if (!current || current.answers.length >= current.questions.length)
        return current;
      return {
        ...current,
        answers: [
          ...current.answers,
          { word: current.questions[current.answers.length].word, selected },
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
          <Link
            href="/"
            className="brand"
            aria-label="Little Explorer, tutti i mondi"
          >
            <span className="brand-mark">
              <Sprout size={25} strokeWidth={2.4} />
            </span>
            <span>
              little<span className="brand-language">english</span>
              <span className="brand-dot">.</span>
            </span>
          </Link>
          <nav aria-label="Navigazione principale">
            <Link
              href="/english"
              aria-label="Tutti i minigiochi"
              title="Tutti i minigiochi"
              className={`nav-home ${pathname === "/english" ? "active" : ""}`}
            >
              <House size={17} /> <span>I minigiochi</span>
            </Link>
          </nav>
          <div className="header-right">
            <span className="header-note">Piccoli passi, grandi scoperte.</span>
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
          <button
            className="icon-button"
            onClick={() => setAudioError("")}
            aria-label="Chiudi avviso"
          >
            <X size={18} />
          </button>
        </div>
      )}
      {children}
      <footer className="site-footer">
        <span className="footer-message">
          <Sprout size={16} /> Un po&apos; di inglese, un mondo di scoperte.
        </span>
        <span>
          Fatto per imparare, con <Heart size={13} />{" "}
          <span className="footer-divider">/</span>{" "}
          <a
            href="https://github.com/jdecked/twemoji"
            target="_blank"
            rel="noreferrer"
          >
            Twemoji
          </a>
          {" e "}
          <a href="/illustrations/ATTRIBUTION.md">illustrazioni originali</a>
          {" "}
          <span className="footer-divider">/</span>{" "}
          <a
            href="https://elevenlabs.io"
            target="_blank"
            rel="noreferrer"
            title="Audio generato con Alice — elevenlabs.io"
          >
            Audio: elevenlabs.io
          </a>
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
      {id === "colors" && (
        <>
          <span className="paint-dot paint-red" />
          <span className="paint-dot paint-yellow" />
          <span className="paint-dot paint-blue" />
          <Illustration asset="paint" className="art-main" />
          <span className="art-sticker">red, blue, you!</span>
        </>
      )}
      {id === "animals" && (
        <>
          <Illustration asset="lion" className="art-main" />
          <Illustration asset="rabbit" className="art-side" />
          <span className="art-bubble">Hello!</span>
          <span className="art-grass grass-one" />
          <span className="art-grass grass-two" />
        </>
      )}
      {id === "objects" && (
        <>
          <Illustration asset="book" className="art-main" />
          <Illustration asset="pencil" className="art-side" />
          <span className="letter-tile">Aa</span>
          <span className="art-sticker">my little world</span>
        </>
      )}
      {id === "verbs" && (
        <>
          <Illustration asset="run" className="art-main" />
          <span className="motion-line line-one" />
          <span className="motion-line line-two" />
          <span className="art-bubble">Let&apos;s go!</span>
          <span className="art-sticker">ready, set, play!</span>
        </>
      )}
      {id === "food" && (
        <>
          <Illustration asset="strawberry" className="art-main" />
          <Illustration asset="bread" className="art-side" />
          <span className="art-bubble">Yummy!</span>
          <span className="art-sticker">a taste of English</span>
        </>
      )}
      {id === "numbers" && (
        <>
          <div className="number-blocks">
            <span>1</span><span>2</span><span>3</span>
          </div>
          <span className="art-sticker">one, two, three!</span>
        </>
      )}
      {id === "weather" && (
        <>
          <Illustration asset="sunny" className="art-main" />
          <Illustration asset="rainy" className="art-side" />
          <span className="art-sticker">look at the sky!</span>
        </>
      )}
      {id === "nature" && (
        <>
          <Illustration asset="tree" className="art-main" />
          <Illustration asset="flower" className="art-side" />
          <span className="art-sticker">out in nature</span>
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
    router.push(`/english/play/${game.id}`);
  }

  return (
    <main id="main" className="dashboard page-width">
      <section className="welcome" aria-labelledby="welcome-title">
        <div className="welcome-copy">
          <span className="eyebrow">
            <span className="tiny-sun">
              <Sparkles size={15} />
            </span>{" "}
            UN PICCOLO MONDO DA SCOPRIRE
          </span>
          <h1 id="welcome-title">
            Hello, piccolo
            <br />
            <span>esploratore!</span>
            <span className="hello-star" aria-hidden="true">
              <Flower2 />
            </span>
          </h1>
          <p>Una nuova avventura inizia con una parola.</p>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="welcome-bubble">Oh, hello!</span>
          <Illustration asset="rocket" className="welcome-rocket" />
          <span className="welcome-letter letter-a">a</span>
          <span className="welcome-letter letter-b">b</span>
          <span className="welcome-letter letter-c">c</span>
          <Star
            className="welcome-star star-one"
            size={24}
            fill="currentColor"
          />
          <Star
            className="welcome-star star-two"
            size={16}
            fill="currentColor"
          />
          <span className="orbit" />
        </div>
      </section>

      <section className="games-section" aria-labelledby="games-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow section-eyebrow">PRONTI A PARTIRE?</span>
            <h2 id="games-title">Che cosa scopriamo oggi?</h2>
          </div>
          <span className="small-note">
            <Sprout size={16} /> Si parte dalle piccole cose
          </span>
        </div>
        <div className="games-grid">
          {games.map((game, index) => (
            <Link
              key={game.id}
              className={`game-card card-${game.id}`}
              href={`/english/play/${game.id}`}
              onClick={() => start(game.id)}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <GameArt id={game.id} />
              <div className="game-card-body">
                <span className="category-label">{game.english}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-card-bottom">
                  <span>
                    <Clock3 size={14} /> 6 domande{" "}
                    <span className="meta-dot">/</span> 2 min
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
        <p>Non serve sapere tutto. Basta un po&apos; di curiosit&agrave;.</p>
      </div>
    </main>
  );
}

function AudioButton({
  word,
  compact = false,
}: {
  word: string;
  compact?: boolean;
}) {
  const { speak, sound } = usePlay();
  return (
    <button
      className={compact ? "icon-button" : "button audio-button"}
      onClick={() => speak(word)}
      disabled={!sound}
      title={sound ? `Ascolta ${word}` : "Attiva audio in alto per ascoltare"}
      aria-label={`Ascolta ${word}`}
    >
      <Volume2 size={compact ? 19 : 22} />
      {!compact && "Ascolta"}
    </button>
  );
}

function WordArt({ word, small = false }: { word: Word; small?: boolean }) {
  if (word.number !== undefined)
    return (
      <span
        className={`number-art ${small ? "small-number-art" : ""}`}
        role="img"
        aria-label={word.italian}
      >
        <span className="number-glyph" aria-hidden="true">{word.number}</span>
        {!small && (
          <span className="counting-dots" aria-hidden="true">
            {Array.from({ length: word.number }, (_, index) => (
              <span className="counting-dot" key={index} />
            ))}
          </span>
        )}
      </span>
    );
  if (word.color)
    return (
      <span
        className={`color-swatch ${small ? "small-swatch" : ""}`}
        style={{ backgroundColor: word.color }}
        role="img"
        aria-label={word.italian}
      />
    );
  return (
    <Illustration
      asset={word.image!}
      alt={word.italian}
      className={small ? "small-word-art" : "word-art"}
    />
  );
}

export function PlayGame({ game }: { game: Game }) {
  const { round, start, answer } = usePlay();
  const router = useRouter();
  const [selected, setSelected] = useState<Word | null>(null);
  const nextLock = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const activeRound =
    round?.gameId === game.id && round.answers.length < round.questions.length
      ? round
      : null;
  const questionIndex = activeRound?.answers.length ?? 0;

  useEffect(() => {
    titleRef.current?.focus();
    nextLock.current = false;
  }, [questionIndex]);

  if (!activeRound) {
    return (
      <main id="main" className="game-page page-width">
        <Link className="back-link" href="/english">
          <ArrowLeft size={17} /> Tutti i giochi
        </Link>
        <section className={`ready-state theme-${game.id}`}>
          <GameArt id={game.id} />
          <span className="eyebrow">{game.english}</span>
          <h1>{game.title}</h1>
          <p>Sei nuove parole ti aspettano.</p>
          <button
            className="button button-primary"
            onClick={() => {
              setSelected(null);
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
  const visualChoices = ["colors", "objects", "food"].includes(game.id);
  const correct = selected?.english === question.word.english;

  function nextQuestion() {
    if (!selected || nextLock.current) return;
    nextLock.current = true;
    answer(selected);
    setSelected(null);
    if (questionIndex === activeRound!.questions.length - 1)
      router.push(`/english/play/${game.id}/result`);
  }

  return (
    <main id="main" className={`game-page page-width theme-${game.id}`}>
      <div className="game-toolbar">
        <Link
          className="back-link"
          href="/english"
          aria-label="Tutti i giochi"
          title="Tutti i giochi"
        >
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
      <div
        className={`question-stage ${visualChoices ? "word-stage" : "picture-stage"}`}
      >
        {visualChoices ? (
          <span className="english-prompt" lang="en">
            {question.word.english}
          </span>
        ) : (
          <>
            <WordArt word={question.word} />
            {game.showItalianPrompt && (
              <span className="italian-prompt">{question.word.italian}</span>
            )}
          </>
        )}
        <AudioButton word={question.word.english} />
      </div>
      <div
        className={`answer-grid ${visualChoices ? "visual-answers" : "text-answers"}`}
        role="group"
        aria-label="Scegli una risposta"
      >
        {question.options.map((option, index) => {
          const isSelected = selected?.english === option.english;
          const isCorrect = option.english === question.word.english;
          const feedbackClass = selected
            ? isCorrect
              ? "answer-correct"
              : isSelected
                ? "answer-wrong"
                : "answer-muted"
            : "";
          return (
            <button
              key={`${question.word.english}-${option.english}`}
              className={`answer-option ${feedbackClass}`}
              disabled={!!selected}
              aria-label={visualChoices ? option.italian : option.english}
              aria-pressed={isSelected}
              onClick={() => setSelected(option)}
            >
              <span className="option-number">{index + 1}</span>
              {visualChoices ? (
                <WordArt word={option} />
              ) : (
                <span
                  className={option.english.length > 7 ? "long-answer" : undefined}
                  lang="en"
                >
                  {option.english}
                </span>
              )}
              {selected && (isCorrect || isSelected) && (
                <span className="answer-indicator">
                  {isCorrect ? <Check size={21} /> : <X size={21} />}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="feedback-space">
        {selected ? (
          <div
            className={`answer-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}
          >
            <div role="status">
              <strong>
                {correct
                  ? "Yes! Proprio cos\u00ec!"
                  : "Un'altra parola da scoprire!"}
              </strong>
              <span>
                <span lang="en">{question.word.english}</span> ={" "}
                {question.word.italian}{" "}
                <AudioButton word={question.word.english} compact />
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
  if (
    !round ||
    round.gameId !== game.id ||
    round.answers.length !== round.questions.length
  ) {
    return (
      <main id="main" className="empty-state page-width">
        <Illustration asset="seedling" />
        <h1>Una nuova avventura?</h1>
        <p>
          Qui non conserviamo le partite. Le parole imparate restano con te.
        </p>
        <Link
          className="button button-primary"
          href={`/english/play/${game.id}`}
          onClick={() => start(game.id)}
        >
          Giochiamo <ArrowRight size={18} />
        </Link>
        <Link className="back-link" href="/english">
          Tutti i giochi
        </Link>
      </main>
    );
  }
  const score = scoreRound(round.answers);
  const review = round.answers.filter(
    (entry) => entry.word.english !== entry.selected.english,
  );
  const visibleAnswers = filter === "review" ? review : round.answers;

  return (
    <main id="main" className="results-page page-width">
      <Link className="back-link" href="/english">
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
          {score === 6
            ? "Wonderful! Tutte giuste!"
            : score >= 3
              ? "Ben fatto, esploratore!"
              : "Ogni parola \u00e8 un nuovo inizio!"}
        </h1>
        <p>
          {score === 6
            ? "Sei parole, sei piccole conquiste."
            : "Anche dagli errori nascono nuove scoperte."}
        </p>
        <div className="score-line">
          <span>
            <Check size={20} /> <strong>{score}</strong> risposte giuste
          </span>
          <span>
            <Sprout size={20} /> <strong>{6 - score}</strong> da ripassare
          </span>
        </div>
      </section>
      <section className="review-section" aria-labelledby="review-title">
        <div className="review-heading">
          <h2 id="review-title">Le tue parole</h2>
          <div
            className="segmented-control"
            role="group"
            aria-label="Filtra risposte"
          >
            <button
              aria-pressed={filter === "all"}
              onClick={() => setFilter("all")}
            >
              Tutte (6)
            </button>
            <button
              aria-pressed={filter === "review"}
              onClick={() => setFilter("review")}
            >
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
              const isCorrect = entry.word.english === entry.selected.english;
              return (
                <div className="review-row" key={entry.word.english}>
                  <WordArt word={entry.word} small />
                  <div className="review-word">
                    <strong lang="en">{entry.word.english}</strong>
                    <span>{entry.word.italian}</span>
                  </div>
                  <div
                    className={`review-answer ${isCorrect ? "is-correct" : "is-wrong"}`}
                  >
                    {isCorrect ? (
                      <>
                        <Check size={17} />
                        <span>Giusto!</span>
                      </>
                    ) : (
                      <>
                        <span>
                          La tua risposta:{" "}
                          <s lang="en">{entry.selected.english}</s>
                        </span>
                        <ChevronRight size={15} />
                        <strong lang="en">{entry.word.english}</strong>
                      </>
                    )}
                  </div>
                  <AudioButton word={entry.word.english} compact />
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
            router.push(`/english/play/${game.id}`);
          }}
        >
          <RotateCcw size={18} /> Giochiamo ancora
        </button>
        <Link href="/english" className="button button-secondary">
          <House size={18} /> Un altro gioco
        </Link>
      </div>
    </main>
  );
}
