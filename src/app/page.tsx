import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Dices, Heart, Sparkles, Sprout, Star } from "lucide-react";
import { LogicShape } from "@/features/logic/components/logic-shape";

const worlds = [
  {
    id: "english",
    href: "/english",
    kicker: "ENGLISH",
    title: "English in festa",
    description:
      "Colori, animali, corpo, famiglia, classe, frasi, preposizioni, contrari, giorni, mesi e tanto ascolto: le prime parole inglesi con illustrazioni e pronuncia.",
    games: "18 giochi",
  },
  {
    id: "math",
    href: "/math",
    kicker: "MATH",
    title: "Numeri in gioco",
    description:
      "Addizioni, sottrazioni, moltiplicazioni, divisioni, doppio e metà fino a 100, con blocchi da contare e passaggi spiegati un pezzetto alla volta.",
    games: "7 giochi",
  },
  {
    id: "italian",
    href: "/italian",
    kicker: "ITALIANO",
    title: "Caccia ai suoni",
    description:
      "GN, GLI, SC, CH, CU, MP, MB, doppie, accenti e apostrofo: i suoni dell'italiano diventano piccoli giochi da scoprire, con qualche tranello da smascherare.",
    games: "10 giochi",
  },
  {
    id: "time",
    href: "/time",
    kicker: "OROLOGIO",
    title: "Tic tac, che ora è?",
    description:
      "In punto, e un quarto, e mezza e meno un quarto: lancette da leggere, orologi da scegliere e ore da ascoltare, un quarto alla volta.",
    games: "5 giochi",
  },
  {
    id: "logic",
    href: "/logic",
    kicker: "LOGICA",
    title: "Detective delle forme",
    description:
      "Sequenze, intrusi, dimensioni e percorsi: forme colorate per allenare lo sguardo e il pensiero, una piccola sfida alla volta.",
    games: "5 giochi",
  },
] as const;

function WorldArt({ id }: { id: (typeof worlds)[number]["id"] }) {
  if (id === "english") {
    return (
      <div className="hub-world-art" aria-hidden="true">
        <Image className="art-lion" src="/illustrations/lion.svg" alt="" width={104} height={104} unoptimized />
        <span className="hub-world-glyph">Aa</span>
        <Image className="art-book" src="/illustrations/book.svg" alt="" width={73} height={73} unoptimized />
        <span className="hub-world-sticker">hello, explorer!</span>
      </div>
    );
  }

  if (id === "math") {
    return (
      <div className="hub-world-art" aria-hidden="true">
        <span className="hub-world-glyph">
          12 <small>+ 3</small>
        </span>
        <div className="art-blocks">
          <span>4</span>
          <span>7</span>
          <span>9</span>
        </div>
        <span className="hub-world-sticker">un passo alla volta</span>
      </div>
    );
  }

  if (id === "italian") {
    return (
      <div className="hub-world-art" aria-hidden="true">
        <Image className="art-spider" src="/illustrations/spider.svg" alt="" width={92} height={92} unoptimized />
        <span className="hub-world-glyph">gn</span>
        <span className="hub-world-glyph glyph-two">gl</span>
        <Image className="art-mountain" src="/illustrations/mountain.svg" alt="" width={82} height={82} unoptimized />
        <span className="hub-world-sticker">suoni e lettere</span>
      </div>
    );
  }

  if (id === "time") {
    return (
      <div className="hub-world-art" aria-hidden="true">
        <span className="hub-clock">
          <span className="hub-clock-hand is-hour" />
          <span className="hub-clock-hand is-minute" />
          <span className="hub-clock-center" />
        </span>
        <span className="hub-time-chips">
          <span>in punto</span>
          <span>e un quarto</span>
          <span>e mezza</span>
          <span>meno un quarto</span>
        </span>
        <span className="hub-world-sticker">un quarto alla volta</span>
      </div>
    );
  }

  return (
    <div className="hub-world-art" aria-hidden="true">
      <LogicShape className="hub-shape hub-shape-a" token={{ kind: "circle", color: "sun", size: "large" }} size={62} />
      <LogicShape className="hub-shape hub-shape-b" token={{ kind: "star", color: "coral", size: "medium" }} size={54} />
      <LogicShape className="hub-shape hub-shape-c" token={{ kind: "triangle", color: "green", size: "medium" }} size={46} />
      <span className="hub-world-glyph hub-logic-glyph">?</span>
      <span className="hub-world-sticker">guarda e scopri</span>
    </div>
  );
}

export default function HubPage() {
  return (
    <div className="hub">
      <main className="hub-main" id="main">
        <section className="hub-hero" aria-labelledby="hub-title">
          <div className="hub-hero-copy">
            <span className="hub-eyebrow">
              <Sparkles size={15} /> CINQUE MONDI, UN ESPLORATORE
            </span>
            <h1 id="hub-title">
              Ciao, piccolo
              <br />
              <span>esploratore!</span>
            </h1>
            <p>
              Scegli un mondo e comincia a scoprire. Parole, numeri, suoni, ore e forme ti aspettano, un piccolo passo alla volta.
            </p>
            <div className="hub-hero-meta">
              <span>
                <BookOpen size={15} /> 45 giochi
              </span>
              <span>
                <Heart size={15} /> Il tuo account
              </span>
              <span>
                <Clock3 size={15} /> Al tuo ritmo
              </span>
            </div>
          </div>
          <div className="hub-hero-art" aria-hidden="true">
            <span className="hub-orbit" />
            <span className="hub-bubble">Pronto a esplorare?</span>
            <Image className="hub-rocket" src="/illustrations/rocket.svg" alt="" width={172} height={172} unoptimized />
            <span className="hub-tile hub-tile-a">A</span>
            <span className="hub-tile hub-tile-b">1</span>
            <span className="hub-tile hub-tile-c">gn</span>
            <Star className="hub-star" size={26} fill="currentColor" />
            <Star className="hub-star-small" size={17} fill="currentColor" />
          </div>
        </section>

        <section aria-labelledby="worlds-title">
          <div className="hub-section-heading">
            <div>
              <span className="hub-eyebrow">DA DOVE VUOI PARTIRE?</span>
              <h2 id="worlds-title">Cinque mondi da scoprire</h2>
            </div>
            <span className="hub-note">
              <Sprout size={16} /> Nessuna fretta, solo curiosità
            </span>
          </div>
          <div className="hub-grid">
            {worlds.map((world) => (
              <Link key={world.id} href={world.href} className={`hub-world hub-world-${world.id}`}>
                <WorldArt id={world.id} />
                <div className="hub-world-body">
                  <span className="hub-world-kicker">{world.kicker}</span>
                  <h3>{world.title}</h3>
                  <p>{world.description}</p>
                  <span className="hub-world-meta">
                    <Clock3 size={14} /> {world.games}
                    <span className="hub-world-arrow">
                      <ArrowRight size={20} />
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="hub-cta" aria-labelledby="hub-cta-title">
          <span className="hub-cta-icon">
            <Dices size={29} strokeWidth={1.8} />
          </span>
          <div>
            <h2 id="hub-cta-title">Non sai da dove iniziare?</h2>
            <p>Little English è un buon primo passo: una parola tira l&apos;altra.</p>
          </div>
          <Link className="hub-button" href="/english">
            Inizia da English <ArrowRight size={17} />
          </Link>
        </section>
      </main>

      <footer className="hub-footer">
        <span>
          <Sprout size={16} /> Cinque mondi, un piccolo esploratore.
        </span>
        <span>
          Fatto per imparare, con <Heart size={13} /> /{" "}
          <a href="https://github.com/jdecked/twemoji" target="_blank" rel="noreferrer">
            Twemoji
          </a>{" "}
          e {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
          <a href="/illustrations/ATTRIBUTION.md">illustrazioni originali</a> /{" "}
          <a href="https://elevenlabs.io" target="_blank" rel="noreferrer">
            Audio: elevenlabs.io
          </a>
        </span>
      </footer>
    </div>
  );
}
