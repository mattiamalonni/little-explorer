# Little Explorer

Tre mondi di minigiochi per bambini in un'unica app: **inglese**, **matematica** e **italiano**. Next.js App Router, React e TypeScript.

La home è un hub con tre mondi. Ogni mondo conserva il proprio carattere, i propri giochi e le proprie impostazioni, ma condivide infrastruttura, illustrazioni, stili di base e un unico sistema di **stelle, livelli e traguardi**.

## Rotte

| Percorso                        | Contenuto                               |
| ------------------------------- | --------------------------------------- |
| `/`                             | Hub con i tre mondi                     |
| `/english`                      | Dashboard di Little English (8 giochi)  |
| `/english/play/[gameId]`        | Partita                                 |
| `/english/play/[gameId]/result` | Riepilogo                               |
| `/math`                         | Dashboard di Little Math (6 giochi)     |
| `/math/play/[gameId]`           | Partita                                 |
| `/math/play/[gameId]/result`    | Riepilogo                               |
| `/italian`                      | Dashboard di Little Italiano (8 giochi) |
| `/italian/play/[gameId]`        | Partita                                 |
| `/italian/play/[gameId]/result` | Riepilogo                               |

Gli URL sono in inglese; l'interfaccia per i bambini resta in italiano. Le partite vivono nello stato React. Ogni bambino crea un **nome unico** con una password: stelle, livelli e traguardi vengono salvati su PostgreSQL (Neon) e restano legati al suo account.

## Struttura

```text
src/
  app/
    page.tsx                 hub dei tre mondi
    globals.css              reset, base e stili dell'hub
    api/
      auth/                  registrazione, accesso e uscita
      me/                    sessione e progressi correnti
      progress/              salvataggio e azzeramento dei progressi
    english/                 rotte di Little English
    math/                    rotte di Little Math
    italian/                 rotte di Little Italiano
  features/
    auth/
      components/auth-screen.tsx
      lib/                   password, sessione e validazione
    english/
      components/english-app.tsx
      data/games.ts
      lib/audio.ts
    math/
      components/math-app.tsx
      components/calculation-help.tsx
      data/games.ts
    italian/
      components/italian-app.tsx
      data/games.ts
      lib/audio.ts
    gamification/
      components/            accesso, pillola, banner, pannello traguardi, provider React
      lib/progress.ts        stelle, livelli, badge e logica pura
      lib/db-progress.ts     mappatura tra progressi e database
  lib/db.ts                  client Prisma condiviso
  styles/
    auth.css                 stili di accesso e creazione del nome
    gamification.css         stili condivisi di stelle, banner e traguardi
    language.css             stili condivisi English + Italiano, con scope
    math.css                 stili Math, con scope
prisma/
  schema.prisma              modelli User, Progress e Session
  migrations/                migrazioni SQL versionate
scripts/
  audio-core.mjs             logica comune di generazione audio
  generate-audio-english.mjs
  generate-audio-italian.mjs
public/
  audio/english/             MP3 già presenti
  audio/italian/             MP3 opzionali
  illustrations/             SVG condivisi e crediti
```

Ogni feature è autosufficiente: dati, componenti e audio vivono nella propria cartella. Per aggiungere un mondo nuovo basta creare `src/features/<mondo>`, una cartella di rotte in `src/app/<mondo>` e un foglio di stile con scope.

### Stili con scope

Le tre app originali usavano nomi di classe uguali (`.game-card`, `.dashboard`, `.question-stage`…). Per conviverle senza conflitti:

- `language.css` è scritto tutto sotto `.subject-language`.
- `math.css` è scritto tutto sotto `.subject-math`.
- Il layout di English applica `subject-language subject-english`, quello di Italiano `subject-language subject-italian`, quello di Math `subject-math`.

Quando si modifica uno stile condiviso, mantenere il prefisso `.subject-language`. Le differenze di un solo mondo vanno aggiunte come override mirati, ad esempio `.subject-language.subject-english .welcome-letter`.

## Stelle e traguardi

La gamification è condivisa dai tre mondi e vive sopra i layout delle singole feature:

- ogni risposta giusta vale **1 stella**; una partita perfetta aggiunge un **bonus di 3 stelle**;
- le stelle fanno salire di **livello** (da “Primi passi” a “Leggenda curiosa”);
- i **traguardi** premiano partite complete, serie perfette, costanza, mondi visitati e risposte corrette per materia;
- la **serie di giorni** aumenta giocando in giorni consecutivi;
- il pannello dei traguardi, aperto dalla pillola nell'header o dal banner in dashboard, mostra livelli, statistiche e badge e permette di azzerare tutto.

Lo stato è gestito da `GamificationProvider` nel layout radice. All'avvio il provider chiama `GET /api/me`: senza sessione valida mostra la schermata di accesso, altrimenti carica i progressi dal database. Ogni partita aggiorna subito lo stato React e invia un `PUT /api/progress` in background; il pannello dei traguardi mostra lo stato del salvataggio e permette di riprovare. L'azzeramento riscrive i progressi iniziali.

## Account e database

- I bambini si registrano con un **nome** (2–24 caratteri) e una **password** (almeno 4). Il nome è unico senza distinzione tra maiuscole e minuscole.
- Le password sono salvate come hash `scrypt`. La sessione usa un cookie `httpOnly` `little-explorer-session` valido 30 giorni; nel database resta solo l'hash del token.
- I modelli `User`, `Progress` e `Session` sono definiti in `prisma/schema.prisma`. Ogni utente ha un solo record `Progress`.
- Le API in `src/app/api` controllano la sessione lato server. `PUT /api/progress` normalizza i dati prima di salvarli, `DELETE /api/progress` li azzera.
- Se su un browser esistono ancora progressi anonimi in `localStorage` (chiave `little-explorer:progress:v1`), vengono copiati nel nuovo account al momento della registrazione e poi rimossi.

## Avvio locale

Node.js 22.18 o successivo.

```bash
npm install
cp .env.example .env
```

Compila in `.env`:

- `DATABASE_URL`: URL PostgreSQL con pooler, usato dall'app;
- `DIRECT_URL`: URL diretto dello stesso database, usato dalle migrazioni Prisma.

Poi applica lo schema e avvia:

```bash
npm run db:deploy
npm run dev
```

Apri http://localhost:3000. Per una porta diversa: `npm run dev -- --port 3001`.

```bash
npm run lint
npm run format
npm run format:check
npm run build
npm start
```

Altri comandi utili:

```bash
npm run db:generate   # rigenera il client Prisma
npm run db:push       # sincronizza lo schema senza creare una migrazione
npm run db:migrate    # crea e applica una migrazione in sviluppo
npm run db:deploy     # applica le migrazioni esistenti
```

Non è presente una suite di test: la verifica avviene con lint, controllo della formattazione, build e controllo manuale delle rotte e degli endpoint.

## Illustrazioni

Tutte le immagini sono SVG locali in `public/illustrations`, con nomi inglesi leggibili in minuscolo e trattini tra le parole (`cat.svg`, `teddy-bear.svg`). L'app applica dimensioni, rotazioni e composizione tramite CSS; non usa emoji di sistema.

Per aggiungere un'illustrazione:

1. Riusa un asset locale adatto, oppure importa un SVG Twemoji dalla revisione indicata in [`public/illustrations/ATTRIBUTION.md`](public/illustrations/ATTRIBUTION.md).
2. Per concetti non coperti, crea un SVG originale nello stesso stile piatto, con `viewBox="0 0 36 36"` e nessuna risorsa esterna.
3. Aggiorna i crediti in `ATTRIBUTION.md` e non sovrascrivere asset esistenti.

## Audio

L'inglese usa MP3 locali già inclusi, generati con la voce britannica **Alice** di ElevenLabs. L'italiano usa gli MP3 locali se presenti in `public/audio/italian/`, altrimenti la voce italiana del dispositivo tramite `speechSynthesis`.

I browser non chiamano mai ElevenLabs. Il pulsante Ascolta è presente in domande, feedback e riepiloghi. Un nuovo ascolto interrompe il precedente; cambio pagina, avanzamento e disattivazione audio fermano la riproduzione.

### Generare gli audio

1. Crea un account [ElevenLabs](https://elevenlabs.io/) e una chiave API con Text to Speech e lettura voci.
2. Copia `.env.example` in `.env` e compila `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` e, se serve, `ELEVENLABS_MODEL_ID`. Non usare prefissi `NEXT_PUBLIC_`: la chiave non deve arrivare al browser.
3. Elenca le voci disponibili:

   ```bash
   npm run audio:generate:english -- --voices
   npm run audio:generate:italian -- --voices
   ```

4. Genera un campione (consuma crediti):

   ```bash
   npm run audio:generate:english -- --sample
   npm run audio:generate:italian -- --sample
   ```

5. Simula il lotto completo, poi conferma:

   ```bash
   npm run audio:generate:english -- --all --dry-run
   npm run audio:generate:italian -- --all --dry-run
   npm run audio:generate:english -- --all --confirm
   npm run audio:generate:italian -- --all --confirm
   ```

Gli MP3 esistenti vengono riutilizzati, quindi il comando si può riprendere dopo un errore. Gli errori fermano il lotto senza retry automatici. Per rigenerare un file, rimuovilo esplicitamente. Se cambi voce o modello, sposta prima gli audio precedenti fuori dalla cartella di destinazione per non mescolare voci diverse.

L'inglese scrive in `public/audio/english/`, l'italiano in `public/audio/italian/`. Le due cartelle sono separate per evitare collisioni tra parole uguali nelle due lingue.

Il piano gratuito ElevenLabs non permette usi commerciali; l'app non commerciale riporta l'attribuzione e il collegamento a elevenlabs.io. Verifica licenza e costi prima di pubblicare.

## Aggiungere parole e giochi

- **English:** `src/features/english/data/games.ts`. Ogni gioco richiede almeno sei parole distinte; colori e numeri usano rappresentazioni CSS, gli altri concetti un'illustrazione locale.
- **Italiano:** `src/features/italian/data/games.ts`. Ogni voce ha `pattern`, `answer`, tre alternative, `solution`, `spoken` e `note`; i giochi `letters` chiedono gruppi di lettere, i giochi `words` chiedono parole intere.
- **Math:** `src/features/math/data/games.ts`. Addizioni, sottrazioni, moltiplicazioni e divisioni sono generate dai limiti 10, 20 e 100; ogni partita ha sei domande e quattro risposte vicine al risultato.

Dopo aver aggiunto parole inglesi o testi italiani, genera gli audio mancanti prima del deploy.

## Deploy su Vercel

Importa il repository su Vercel, seleziona il preset **Next.js** e Node.js 22.x o successivo. Aggiungi `DATABASE_URL` e `DIRECT_URL` alle variabili d'ambiente del progetto e applica le migrazioni con `npm run db:deploy` (una volta, o come passo del comando di build). Comando build: `npm run build`. Le chiavi ElevenLabs servono solo in locale per generare gli MP3.

## Crediti

Illustrazioni [Twemoji](https://github.com/jdecked/twemoji), Twitter e altri contributori, licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Le illustrazioni originali di Little English sono distribuite con la stessa licenza. Elenco completo, provenienza e mappatura dei nomi in [`public/illustrations/ATTRIBUTION.md`](public/illustrations/ATTRIBUTION.md).

Icone [Lucide](https://lucide.dev/), licenza ISC. Font Nunito e Plus Jakarta Sans, SIL Open Font License. Audio inglese generato con ElevenLabs, voce Alice.
