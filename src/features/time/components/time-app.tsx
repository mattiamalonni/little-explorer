"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
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
import { ClockFace } from "@/features/time/components/clock-face";
import {
  createRound,
  entries,
  explanation,
  gameStickers,
  games,
  parseClockKey,
  scoreRound,
  selectedLabel,
  timePhrase,
  type Game,
  type TimeGameId,
  type Minute,
  type Question,
  type Round,
  type RoundConfig,
} from "@/features/time/data/games";
import { ProgressBanner } from "@/features/gamification/components/progress-banner";
import { RoundRewards } from "@/features/gamification/components/round-rewards";
import { GameSetup } from "@/features/gamification/components/game-setup";
import { useRoundReward } from "@/features/gamification/components/use-round-reward";
import { useSound } from "@/features/gamification/components/sound-context";

const sampleTimes: Record<TimeGameId, { hour: number; minute: Minute }> = {
  read: { hour: 3, minute: 30 },
  set: { hour: 7, minute: 15 },
  quarters: { hour: 4, minute: 45 },
  listen: { hour: 9, minute: 0 },
  mixed: { hour: 6, minute: 30 },
};

const setupItems = entries.map((entry) => ({
  id: entry.id,
  label: entry.hour === 1 ? "L'una" : `Le ${entry.hour}`,
  number: entry.hour,
}));

type PlayContext = {
  round: Round | null;
  start: (gameId: TimeGameId, config?: RoundConfig) => void;
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

function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [round, setRound] = useState<Round | null>(null);
  const { sound } = useSound();
  const [audioError, setAudioError] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    return () => {
      stopSpeech();
    };
  }, [pathname]);

  useEffect(() => {
    if (!sound) stopSpeech();
  }, [sound]);

  function speak(text: string) {
    if (!sound) return;
    stopSpeech();
    setAudioError("");

    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setAudioError("L'audio non è disponibile in questo browser. Puoi continuare con le ore scritte.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "it-IT";
    utterance.rate = 0.82;
    const italianVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("it"));
    if (italianVoice) utterance.voice = italianVoice;
    utterance.onerror = (event) => {
      if (event.error !== "interrupted" && event.error !== "canceled") {
        setAudioError("La voce del dispositivo non risponde. Puoi continuare con le ore scritte.");
      }
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }

  function start(gameId: TimeGameId, config?: RoundConfig) {
    stopSpeech();
    setRound((previous) => createRound(gameId, config ?? {}, previous ?? undefined));
  }

  function answer(selected: string) {
    stopSpeech();
    setRound((current) => {
      if (!current || current.answers.length >= current.questions.length) return current;
      const question = current.questions[current.answers.length];
      return {
        ...current,
        answers: [
          ...current.answers,
          {
            question,
            selected,
            correct: selected === question.answer,
          },
        ],
      };
    });
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
        <span>
          <Sprout size={16} /> Piccole lancette, grandi scoperte.
        </span>
        <span>
          Fatto per imparare, con <Heart size={13} />
        </span>
      </footer>
    </PlayContext.Provider>
  );
}

function GameArt({ game }: { game: Game }) {
  const sample = sampleTimes[game.id];
  return (
    <div className={`game-art art-${game.id}`} aria-hidden="true">
      <Sparkles className="art-spark" size={22} />
      <ClockFace hour={sample.hour} minute={sample.minute} size={132} className="art-clock" decorative />
      <span className="art-sticker">{gameStickers[game.id]}</span>
      <Star className="art-star" size={23} />
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();

  function surprise() {
    const game = games[Math.floor(Math.random() * games.length)];
    router.push(`/time/play/${game.id}`);
  }

  return (
    <main id="main" className="dashboard page-width">
      <section className="welcome" aria-labelledby="welcome-title">
        <div>
          <span className="eyebrow">
            <Sparkles size={15} /> UN PICCOLO MONDO DI TEMPO
          </span>
          <h1 id="welcome-title">
            Ciao, piccolo
            <br />
            <span>esploratore!</span>
            <Flower2 className="hello-flower" aria-hidden="true" />
          </h1>
          <p>Impariamo a leggere l&apos;orologio, un quarto alla volta.</p>
        </div>
        <div className="welcome-art time-hero" aria-hidden="true">
          <span className="welcome-bubble">Che ore sono?</span>
          <ClockFace hour={10} minute={15} size={186} className="hero-clock" decorative />
          <span className="time-chip chip-hour">in punto</span>
          <span className="time-chip chip-quarter">e un quarto</span>
          <span className="time-chip chip-half">e mezza</span>
          <span className="time-chip chip-to">meno un quarto</span>
          <Star className="hero-star" size={27} fill="currentColor" />
        </div>
      </section>
      <ProgressBanner world="time" />
      <section aria-labelledby="games-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PRONTI A PARTIRE?</span>
            <h2 id="games-title">Che ora scegliamo oggi?</h2>
          </div>
          <span className="small-note">
            <Sprout size={16} /> Solo in punto, e mezza e i quarti
          </span>
        </div>
        <div className="games-grid">
          {games.map((game) => (
            <Link key={game.id} className="game-card" href={`/time/play/${game.id}`}>
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
          <p>Un orologio, una voce, un quarto: scegliamo un gioco per te.</p>
        </div>
        <button className="button button-primary" onClick={surprise}>
          Scegli per me <ArrowRight size={17} />
        </button>
      </section>
      <p className="encouragement">
        <Flower2 size={21} /> Non serve leggere l&apos;ora al primo colpo. Basta guardare le lancette, una alla volta.
      </p>
    </main>
  );
}

function AudioButton({ text, compact = false }: { text: string; compact?: boolean }) {
  const { speak, sound } = usePlay();
  return (
    <button
      className={compact ? "icon-button" : "button button-secondary"}
      onClick={() => speak(text)}
      disabled={!sound}
      title={sound ? `Ascolta: ${text}` : "Attiva audio in alto per ascoltare"}
      aria-label={`Ascolta: ${text}`}
    >
      <Volume2 size={compact ? 19 : 19} /> {!compact && "Ascolta"}
    </button>
  );
}

function promptFor(question: Question): string {
  return question.mode === "clock" ? "Quale orologio è giusto?" : "Che ore sono?";
}

function optionLabel(question: Question, option: string): string {
  const time = parseClockKey(option);
  return time ? timePhrase(time.hour, time.minute) : option;
}

function QuestionCard({ round, game }: { round: Round; game: Game }) {
  const { answer } = usePlay();
  const router = useRouter();
  const index = round.answers.length;
  const question = round.questions[index];
  const total = round.questions.length;
  const [selected, setSelected] = useState<string | null>(null);
  const [help, setHelp] = useState(false);
  const lock = useRef(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const correct = selected === question.answer;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);
  useEffect(() => {
    if (selected !== null) nextRef.current?.focus();
  }, [selected]);

  function next() {
    if (selected === null || lock.current) return;
    lock.current = true;
    answer(selected);
    if (index === total - 1) router.push(`/time/play/${game.id}/result`);
  }

  const showClock = question.mode !== "clock";
  const listening = question.mode === "clock" && game.id === "listen";

  return (
    <>
      <div className="game-toolbar">
        <Link className="back-link" href="/time">
          <ArrowLeft size={17} /> Tutti i giochi
        </Link>
        <span className="toolbar-title">
          {game.subtitle} <span>&middot; {round.questions.length} domande</span>
        </span>
        <span className="round-counter">
          {index + 1} <span>/ {total}</span>
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Domande completate"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index}
      >
        <span style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <div className="question-heading">
        <span className="eyebrow">{game.subtitle.toUpperCase()}</span>
        <h1 tabIndex={-1} ref={titleRef}>
          {promptFor(question)}
        </h1>
      </div>
      <section className={`question-stage clock-stage art-${question.gameId}`} aria-label="Orologio da leggere">
        {showClock ? (
          <>
            <ClockFace
              hour={question.hour}
              minute={question.minute}
              size={212}
              label={`Lancetta corta sul ${question.hour}, lancetta lunga sul ${question.minute === 0 ? 12 : question.minute / 5}`}
            />
            <p className="clock-caption">La lancetta corta dice l&apos;ora, quella lunga i minuti.</p>
          </>
        ) : (
          <div className="time-prompt">
            {listening ? (
              <>
                <span className="listen-mark" aria-hidden="true">
                  <Volume2 size={30} />
                </span>
                <p className="time-phrase listen-phrase">Ascolta l&apos;ora</p>
              </>
            ) : (
              <p className="time-phrase">{question.phrase}</p>
            )}
            <AudioButton text={question.spoken} />
          </div>
        )}
      </section>
      <div className="help-toggle">
        <button className="text-button" aria-expanded={help} aria-controls="clock-help" onClick={() => setHelp(!help)}>
          <Lightbulb size={18} /> {help ? "Nascondi l\u2019aiuto" : "Mi dai un aiutino?"}
        </button>
      </div>
      {help && (
        <aside className="math-help clock-help" id="clock-help" aria-label="Aiuto per leggere l'orologio">
          <p>
            <strong>La lancetta corta</strong> indica l&apos;ora. <strong>La lancetta lunga</strong> indica i minuti: sul 12 è
            &laquo;in punto&raquo;, sul 3 &laquo;e un quarto&raquo;, sul 6 &laquo;e mezza&raquo;, sul 9 &laquo;meno un
            quarto&raquo;.
          </p>
          <div className="clock-legend" aria-hidden="true">
            <span>
              <ClockFace hour={3} minute={0} size={64} decorative /> in punto
            </span>
            <span>
              <ClockFace hour={3} minute={15} size={64} decorative /> e un quarto
            </span>
            <span>
              <ClockFace hour={3} minute={30} size={64} decorative /> e mezza
            </span>
            <span>
              <ClockFace hour={3} minute={45} size={64} decorative /> meno un quarto
            </span>
          </div>
        </aside>
      )}
      <div className="answer-grid time-answer-grid" role="group" aria-label="Scegli una risposta">
        {question.options.map((option, i) => {
          const isCorrect = option === question.answer;
          const isSelected = selected === option;
          const feedback = selected === null ? "" : isCorrect ? "answer-correct" : isSelected ? "answer-wrong" : "answer-muted";
          const time = parseClockKey(option);
          return (
            <button
              key={option}
              className={`answer-option time-option ${time ? "is-clock" : ""} ${feedback}`}
              disabled={selected !== null}
              aria-pressed={isSelected}
              aria-label={`${optionLabel(question, option)}${selected !== null && isCorrect ? ", risposta corretta" : ""}`}
              onClick={() => setSelected(option)}
            >
              <span className="option-number" aria-hidden="true">
                {i + 1}
              </span>
              {time ? (
                <ClockFace hour={time.hour} minute={time.minute} size={112} decorative />
              ) : (
                <span className="time-option-label">{option}</span>
              )}
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
            <Heart size={15} /> Prenditi il tuo tempo. Le lancette non corrono.
          </p>
        ) : (
          <div className={`answer-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
            <div role="status">
              <strong>{correct ? "Proprio così! Ben fatto!" : "Quasi! Guardiamo insieme l\u2019orologio."}</strong>
              <p className="feedback-equation">{question.phrase}</p>
              {!correct && (
                <p>
                  La tua risposta: <s>{selectedLabel(question, selected)}</s>
                </p>
              )}
              <p>{explanation(question)}</p>
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
          <Link className="back-link" href="/time">
            <ArrowLeft size={17} /> Tutti i giochi
          </Link>
          <section className="ready-state">
            <GameArt game={game} />
            <span className="eyebrow">{game.subtitle}</span>
            <h1>{game.title}</h1>
            <p>Scegli le ore da allenare e quante domande.</p>
            <GameSetup
              key={game.id}
              world="time"
              gameId={game.id}
              items={setupItems}
              intro="Ogni ora si può leggere in punto, e un quarto, e mezza o meno un quarto."
              onStart={({ selected, roundLength }) => {
                start(game.id, { selected, roundLength });
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
    world: "time",
    gameId: game.id,
    correct: score,
    total: round?.questions.length ?? 6,
    enabled: completed,
  });

  if (!round || !completed) {
    return (
      <main id="main" className="empty-state page-width">
        <Clock3 size={65} />
        <h1 ref={headingRef} tabIndex={-1}>
          Una nuova ora?
        </h1>
        <p>Qui non conserviamo le partite. Le lancette ti aspettano per un&apos;altra avventura.</p>
        <Link className="button button-primary" href={`/time/play/${game.id}`}>
          Giochiamo <ArrowRight size={18} />
        </Link>
        <Link className="back-link" href="/time">
          Tutti i giochi
        </Link>
      </main>
    );
  }
  const review = round.answers.filter((answer) => !answer.correct);
  const visible = filter === "review" ? review : round.answers;
  const total = round.questions.length;
  return (
    <main id="main" className="results-page page-width">
      <Link className="back-link" href="/time">
        <ArrowLeft size={17} /> Tutti i giochi
      </Link>
      <section className="result-celebration">
        <div className="trophy-art" aria-hidden="true">
          <Star size={23} />
          <Trophy size={80} strokeWidth={1.5} />
          <Sparkles size={25} />
        </div>
        <span className="eyebrow">AVVENTURA COMPLETATA</span>
        <h1 ref={headingRef} tabIndex={-1}>
          {score === total
            ? "Evviva! Tutte giuste!"
            : score >= Math.ceil(total / 2)
              ? "Ben fatto, esploratore!"
              : "Ogni orologio è una nuova scoperta!"}
        </h1>
        <p>
          {score === total
            ? `${total} ${total === 1 ? "orologio letto" : "orologi letti"}, ${total} piccole conquiste.`
            : "Anche dagli errori impariamo a guardare meglio le lancette."}
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
          <h2 id="review-title">Le tue ore</h2>
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
          {visible.length === 0 ? (
            <p className="nothing-to-review">
              <Check size={21} /> Nessun orologio da ripassare. Ottimo lavoro!
            </p>
          ) : (
            visible.map(({ question, selected }) => {
              const isCorrect = question.answer === selected;
              return (
                <div className="review-row" key={question.id}>
                  <span
                    className={`review-icon ${isCorrect ? "is-correct" : "is-wrong"}`}
                    aria-label={isCorrect ? "Risposta corretta" : "Da ripassare"}
                  >
                    {isCorrect ? <Check size={22} /> : <Clock3 size={22} />}
                  </span>
                  <ClockFace
                    hour={question.hour}
                    minute={question.minute}
                    size={64}
                    className="review-clock"
                    label={question.phrase}
                  />
                  <div className="review-calculation">
                    <strong>{question.phrase}</strong>
                    {!isCorrect && (
                      <span>
                        La tua risposta: <s>{selectedLabel(question, selected)}</s>
                      </span>
                    )}
                    <p className="review-clock-note">{explanation(question)}</p>
                  </div>
                  <AudioButton text={question.spoken} compact />
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
            start(game.id, { selected: round.selection, roundLength: round.roundLength });
            router.push(`/time/play/${game.id}`);
          }}
        >
          <RotateCcw size={18} /> Giochiamo ancora
        </button>
        <Link href="/time" className="button button-secondary">
          <House size={18} /> Un altro gioco
        </Link>
      </div>
      <p className="encouragement">
        <Heart size={17} /> Il bello è scoprire, non correre.
      </p>
    </main>
  );
}
