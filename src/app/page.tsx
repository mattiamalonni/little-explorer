import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock3, Dices, Heart, Sparkles, Sprout, Star } from "lucide-react";

const worlds = [
  {
    id: "english",
    href: "/english",
    kicker: "ENGLISH",
    title: "Little English",
    description: "Colori, animali, oggetti, azioni, cibi e numeri: le prime parole inglesi con illustrazioni e pronuncia.",
    games: "8 giochi",
  },
  {
    id: "math",
    href: "/math",
    kicker: "MATH",
    title: "Little Math",
    description:
      "Addizioni, sottrazioni, moltiplicazioni e divisioni fino a 100, con blocchi da contare e passaggi spiegati un pezzetto alla volta.",
    games: "6 giochi",
  },
  {
    id: "italian",
    href: "/italian",
    kicker: "ITALIANO",
    title: "Little Italiano",
    description: "GN, GLI, SC, CH, CU, doppie e accenti: i suoni dell'italiano diventano piccoli giochi da scoprire.",
    games: "8 giochi",
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

export default function HubPage() {
  return (
    <div className="hub">
      <a className="hub-skip" href="#main">
        Vai al contenuto
      </a>
      <header className="hub-header">
        <div className="hub-header-inner">
          <Link href="/" className="hub-brand" aria-label="Little Explorer, pagina iniziale">
            <span className="hub-brand-mark">
              <Sprout size={25} strokeWidth={2.4} />
            </span>
            <span>
              little<span className="hub-brand-accent">explorer</span>
              <span className="hub-brand-dot">.</span>
            </span>
          </Link>
          <nav className="hub-nav" aria-label="I tre mondi">
            <Link href="/english">English</Link>
            <Link href="/math">Math</Link>
            <Link href="/italian">Italiano</Link>
          </nav>
        </div>
      </header>

      <main className="hub-main" id="main">
        <section className="hub-hero" aria-labelledby="hub-title">
          <div className="hub-hero-copy">
            <span className="hub-eyebrow">
              <Sparkles size={15} /> TRE MONDI, UN ESPLORATORE
            </span>
            <h1 id="hub-title">
              Ciao, piccolo
              <br />
              <span>esploratore!</span>
            </h1>
            <p>Scegli un mondo e comincia a scoprire. Parole, numeri e suoni ti aspettano, un piccolo passo alla volta.</p>
            <div className="hub-hero-meta">
              <span>
                <BookOpen size={15} /> 19 giochi
              </span>
              <span>
                <Heart size={15} /> Senza account
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
              <h2 id="worlds-title">Tre mondi da scoprire</h2>
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
          <Sprout size={16} /> Tre mondi, un piccolo esploratore.
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
