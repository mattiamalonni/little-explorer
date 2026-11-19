"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Dices,
  Flower2,
  Heart,
  House,
  Puzzle,
  RotateCcw,
  Sparkles,
  Sprout,
  Star,
  Trophy,
  X,
} from "lucide-react";
import { LogicShape } from "@/features/logic/components/logic-shape";
import {
  createRound,
  directionLabel,
  games,
  gameStickers,
  optionById,
  scoreRound,
  selectedOptionLabel,
  type Direction,
  type Game,
  type LogicGameId,
  type Grid,
  type Option,
  type Question,
  type Round,
  type RoundConfig,
  type ShapeToken,
} from "@/features/logic/data/games";
import { ProgressBanner } from "@/features/gamification/components/progress-banner";
import { RoundRewards } from "@/features/gamification/components/round-rewards";
import { GameSetup } from "@/features/gamification/components/game-setup";
import { useRoundReward } from "@/features/gamification/components/use-round-reward";

type PlayContext = {
  round: Round | null;
  start: (gameId: LogicGameId, config?: RoundConfig) => void;
  answer: (selected: string) => void;
};

const PlayContext = createContext<PlayContext | null>(null);

function usePlay() {
  const context = useContext(PlayContext);
  if (!context) throw new Error("I giochi hanno bisogno di AppShell");
  return context;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [round, setRound] = useState<Round | null>(null);

  function start(gameId: LogicGameId, config?: RoundConfig) {
    setRound((previous) => createRound(gameId, config ?? {}, previous ?? undefined));
  }

  function answer(selected: string) {
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
    <PlayContext.Provider value={{ round, start, answer }}>
      {children}
      <footer className="site-footer">
        <span>
          <Sprout size={16} /> Piccoli indizi, grandi scoperte.
        </span>
        <span>
          Fatto per imparare, con <Heart size={13} />
        </span>
      </footer>
    </PlayContext.Provider>
  );
}

const artTokens: Record<LogicGameId, ShapeToken[]> = {
  patterns: [
    { kind: "circle", color: "coral", size: "medium" },
    { kind: "square", color: "coral", size: "medium" },
    { kind: "circle", color: "coral", size: "medium" },
  ],
  "odd-one-out": [
    { kind: "circle", color: "coral", size: "medium" },
    { kind: "square", color: "coral", size: "medium" },
    { kind: "triangle", color: "coral", size: "medium" },
    { kind: "star", color: "sky", size: "medium" },
  ],
  sizes: [
    { kind: "circle", color: "sun", size: "small" },
    { kind: "circle", color: "sun", size: "medium" },
    { kind: "circle", color: "sun", size: "large" },
  ],
  directions: [],
  mixed: [
    { kind: "star", color: "sun", size: "medium" },
    { kind: "diamond", color: "violet", size: "medium" },
    { kind: "heart", color: "coral", size: "medium" },
    { kind: "triangle", color: "green", size: "medium" },
  ],
};

function GameArt({ game }: { game: Game }) {
  return (
    <div className={`game-art art-${game.id}`} aria-hidden="true">
      <Sparkles className="art-spark" size={22} />
      {game.id === "directions" ? (
        <div className="logic-art-scene art-grid-scene">
          <span className="art-grid-cell" />
          <span className="art-grid-cell is-start">
            <Sprout size={17} />
          </span>
          <span className="art-grid-cell" />
          <span className="art-grid-cell is-target">
            <Star size={16} fill="currentColor" />
          </span>
        </div>
      ) : (
        <div className="logic-art-scene">
          <div className="logic-art-row">
            {artTokens[game.id].map((token, index) => (
              <LogicShape key={index} token={token} />
            ))}
            {game.id === "patterns" && <span className="logic-art-question">?</span>}
          </div>
        </div>
      )}
      <span className="art-sticker">{gameStickers[game.id]}</span>
      <Star className="art-star" size={23} />
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();

  function surprise() {
    const game = games[Math.floor(Math.random() * games.length)];
    router.push(`/logic/play/${game.id}`);
  }

  return (
    <main id="main" className="dashboard page-width">
      <section className="welcome" aria-labelledby="welcome-title">
        <div>
          <span className="eyebrow">
            <Sparkles size={15} /> UN PICCOLO MONDO DI LOGICA
          </span>
          <h1 id="welcome-title">
            Ciao, piccolo
            <br />
            <span>esploratore!</span>
            <Flower2 className="hello-flower" aria-hidden="true" />
          </h1>
          <p>Guarda bene, pensa un po&apos; e scopri la forma che manca.</p>
        </div>
        <div className="welcome-art logic-hero" aria-hidden="true">
          <span className="welcome-bubble">Cosa viene dopo?</span>
          <LogicShape token={{ kind: "circle", color: "sun", size: "large" }} className="hero-shape shape-one" />
          <LogicShape token={{ kind: "square", color: "sky", size: "medium" }} className="hero-shape shape-two" />
          <LogicShape token={{ kind: "star", color: "coral", size: "medium" }} className="hero-shape shape-three" />
          <LogicShape token={{ kind: "triangle", color: "green", size: "small" }} className="hero-shape shape-four" />
          <span className="logic-hero-question">?</span>
          <Star className="hero-star" size={27} fill="currentColor" />
        </div>
      </section>
      <ProgressBanner world="logic" />
      <section aria-labelledby="games-title">
        <div className="section-heading">
          <div>
            <span className="eyebrow">PRONTI A PENSARE?</span>
            <h2 id="games-title">Che sfida scegliamo oggi?</h2>
          </div>
          <span className="small-note">
            <Sprout size={16} /> Un indizio alla volta
          </span>
        </div>
        <div className="games-grid">
          {games.map((game) => (
            <Link key={game.id} className="game-card" href={`/logic/play/${game.id}`}>
              <GameArt game={game} />
              <div className="game-card-body">
                <span className={`category-label label-${game.id}`}>{game.subtitle}</span>
                <h3>{game.title}</h3>
                <p>{game.description}</p>
                <div className="game-card-bottom">
                  <span>
                    <Puzzle size={15} /> Domande a scelta <span>/</span> al tuo ritmo
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
          <p>Una sequenza, un intruso, un percorso di frecce: scegliamo una sfida per te.</p>
        </div>
        <button className="button button-primary" onClick={surprise}>
          Scegli per me <ArrowRight size={17} />
        </button>
      </section>
      <p className="encouragement">
        <Flower2 size={21} /> Non serve indovinare subito. Guarda, confronta e prova: la logica cresce un passo alla volta.
      </p>
    </main>
  );
}

function DirectionGlyph({ direction, size = 34 }: { direction: Direction; size?: number }) {
  if (direction === "up") return <ArrowUp size={size} aria-hidden="true" />;
  if (direction === "down") return <ArrowDown size={size} aria-hidden="true" />;
  if (direction === "left") return <ArrowLeft size={size} aria-hidden="true" />;
  return <ArrowRight size={size} aria-hidden="true" />;
}

function Sequence({ tokens }: { tokens: ShapeToken[] }) {
  return (
    <div className="logic-sequence">
      {tokens.map((token, index) => (
        <span className="logic-sequence-item" key={index}>
          <LogicShape token={token} />
        </span>
      ))}
    </div>
  );
}

function LogicGrid({ grid }: { grid: Grid }) {
  const cells = Array.from({ length: grid.cols * grid.rows }, (_, index) => index);
  return (
    <div
      className="logic-grid"
      style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
      role="img"
      aria-label="Griglia con un esploratore e una stella da raggiungere"
    >
      {cells.map((cell) => (
        <span
          key={cell}
          className={`logic-cell ${cell === grid.start ? "is-start" : ""} ${cell === grid.target ? "is-target" : ""}`}
        >
          {cell === grid.start && <Sprout size={19} aria-hidden="true" />}
          {cell === grid.target && <Star size={18} fill="currentColor" aria-hidden="true" />}
        </span>
      ))}
    </div>
  );
}

function PathArrows({ path, size = 30 }: { path: Direction[]; size?: number }) {
  return (
    <span className="logic-path-option" aria-hidden="true">
      {path.map((direction, index) => (
        <span className="logic-path-step" key={index}>
          <DirectionGlyph direction={direction} size={size} />
          {index < path.length - 1 && <span className="logic-path-arrow">›</span>}
        </span>
      ))}
    </span>
  );
}

function OptionVisual({ option }: { option: Option }) {
  if (option.shape) return <LogicShape token={option.shape} />;
  if (option.path) {
    return (
      <span className="logic-path-choice" aria-hidden="true">
        <PathArrows path={option.path} />
        <span className="logic-path-caption">{option.label}</span>
      </span>
    );
  }
  if (option.arrow) {
    return (
      <span className="logic-arrow-option" aria-hidden="true">
        <DirectionGlyph direction={option.arrow} />
        <span>{directionLabel(option.arrow)}</span>
      </span>
    );
  }
  return null;
}

function QuestionCard({ round, game }: { round: Round; game: Game }) {
  const { answer } = usePlay();
  const router = useRouter();
  const index = round.answers.length;
  const question = round.questions[index];
  const total = round.questions.length;
  const [selected, setSelected] = useState<string | null>(null);
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
    if (index === total - 1) router.push(`/logic/play/${game.id}/result`);
  }

  return (
    <>
      <div className="game-toolbar">
        <Link className="back-link" href="/logic">
          <ArrowLeft size={17} /> Tutti i giochi
        </Link>
        <span className="toolbar-title">
          {game.subtitle} <span>&middot; {total} domande</span>
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
          {question.prompt}
        </h1>
        <p className="logic-instruction">{question.instruction}</p>
      </div>
      <section className={`question-stage logic-stage art-${question.kind}`} aria-label="Sfida di logica">
        {question.kind === "patterns" && (
          <div className="logic-sequence logic-sequence-question">
            {question.sequence.map((token, position) =>
              position === question.blankIndex ? (
                <span className="logic-question-tile" key={position} aria-label="forma mancante">
                  ?
                </span>
              ) : (
                <span className="logic-sequence-item" key={position}>
                  <LogicShape token={token} />
                </span>
              ),
            )}
            {question.blankIndex === undefined && (
              <span className="logic-question-tile" aria-hidden="true">
                ?
              </span>
            )}
          </div>
        )}
        {question.kind === "odd-one-out" && <Sequence tokens={question.sequence} />}
        {question.kind === "sizes" && (
          <div className="logic-sizes-hint">
            <span className="sizes-mark" aria-hidden="true">
              <ArrowUp size={26} />
            </span>
            <p>Confronta le dimensioni con calma.</p>
          </div>
        )}
        {question.kind === "directions" && question.grid && <LogicGrid grid={question.grid} />}
      </section>
      <div className="answer-grid logic-answer-grid" role="group" aria-label="Scegli una risposta">
        {question.options.map((option, i) => {
          const isCorrect = option.id === question.answer;
          const isSelected = selected === option.id;
          const feedback = selected === null ? "" : isCorrect ? "answer-correct" : isSelected ? "answer-wrong" : "answer-muted";
          return (
            <button
              key={option.id}
              className={`answer-option logic-option ${option.arrow || option.path ? "is-arrow" : ""} ${feedback}`}
              disabled={selected !== null}
              aria-pressed={isSelected}
              aria-label={`${option.label}${selected !== null && isCorrect ? ", risposta corretta" : ""}`}
              onClick={() => setSelected(option.id)}
            >
              <span className="option-number" aria-hidden="true">
                {i + 1}
              </span>
              <OptionVisual option={option} />
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
            <Heart size={15} /> Prenditi il tuo tempo. Qui si impara guardando.
          </p>
        ) : (
          <div className={`answer-feedback ${correct ? "feedback-correct" : "feedback-wrong"}`}>
            <div role="status">
              <strong>{correct ? "Proprio così! Che occhio!" : "Quasi! Guardiamo insieme."}</strong>
              <p className="feedback-equation">{optionById(question, question.answer)?.label}</p>
              {!correct && (
                <p>
                  La tua risposta: <s>{selectedOptionLabel(question, selected)}</s>
                </p>
              )}
              <p>{question.explanation}</p>
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
          <Link className="back-link" href="/logic">
            <ArrowLeft size={17} /> Tutti i giochi
          </Link>
          <section className="ready-state">
            <GameArt game={game} />
            <span className="eyebrow">{game.subtitle}</span>
            <h1>{game.title}</h1>
            <p>Scegli quante sfide e comincia quando vuoi.</p>
            <GameSetup
              key={game.id}
              world="logic"
              gameId={game.id}
              intro="Nessuna fretta: guarda bene, poi scegli."
              onStart={({ roundLength }) => {
                start(game.id, { roundLength });
              }}
            />
          </section>
        </>
      )}
    </main>
  );
}

function ReviewVisual({ question }: { question: Question }) {
  if (question.sequence.length > 0) {
    return (
      <span className="logic-review-visual" aria-hidden="true">
        {question.sequence.map((token, index) => (
          <LogicShape key={index} token={token} size={26} />
        ))}
      </span>
    );
  }
  const correctOption = optionById(question, question.answer);
  return (
    <span className="logic-review-visual" aria-hidden="true">
      {correctOption?.shape ? (
        <LogicShape token={correctOption.shape} size={36} />
      ) : correctOption?.path ? (
        <span className="logic-review-path">
          <PathArrows path={correctOption.path} size={21} />
        </span>
      ) : correctOption?.arrow ? (
        <span className="logic-review-arrow">
          <DirectionGlyph direction={correctOption.arrow} size={26} />
        </span>
      ) : (
        <Puzzle size={26} />
      )}
    </span>
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
    world: "logic",
    gameId: game.id,
    correct: score,
    total: round?.questions.length ?? 6,
    enabled: completed,
  });

  if (!round || !completed) {
    return (
      <main id="main" className="empty-state page-width">
        <Puzzle size={65} />
        <h1 ref={headingRef} tabIndex={-1}>
          Una nuova sfida?
        </h1>
        <p>Qui non conserviamo le partite. Le forme ti aspettano per un&apos;altra avventura.</p>
        <Link className="button button-primary" href={`/logic/play/${game.id}`}>
          Giochiamo <ArrowRight size={18} />
        </Link>
        <Link className="back-link" href="/logic">
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
      <Link className="back-link" href="/logic">
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
              : "Ogni tentativo ti fa pensare meglio!"}
        </h1>
        <p>
          {score === total
            ? `${total} ${total === 1 ? "sfida risolta" : "sfide risolte"}, ${total} piccole conquiste.`
            : "Anche dagli errori nascono nuove idee."}
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
          <h2 id="review-title">Le tue sfide</h2>
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
              <Check size={21} /> Nessuna sfida da ripassare. Ottimo lavoro!
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
                    {isCorrect ? <Check size={22} /> : <Puzzle size={22} />}
                  </span>
                  <ReviewVisual question={question} />
                  <div className="review-calculation">
                    <strong>{question.prompt}</strong>
                    <span>{optionById(question, question.answer)?.label}</span>
                    {!isCorrect && (
                      <span>
                        La tua risposta: <s>{selectedOptionLabel(question, selected)}</s>
                      </span>
                    )}
                    <p className="logic-review-note">{question.explanation}</p>
                  </div>
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
            start(game.id, { roundLength: round.roundLength });
            router.push(`/logic/play/${game.id}`);
          }}
        >
          <RotateCcw size={18} /> Giochiamo ancora
        </button>
        <Link href="/logic" className="button button-secondary">
          <House size={18} /> Un altro gioco
        </Link>
      </div>
      <p className="encouragement">
        <Heart size={17} /> Il bello è scoprire, non correre.
      </p>
    </main>
  );
}
