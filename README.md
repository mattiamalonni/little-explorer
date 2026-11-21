# Little Explorer

Cinque mondi di minigiochi per bambini in un'unica app: **inglese**, **matematica**, **italiano**, **orologio** e **logica**. Next.js App Router, React e TypeScript.

La home è un hub con cinque mondi. Ogni mondo conserva il proprio carattere, i propri giochi e le proprie impostazioni, ma condivide infrastruttura, illustrazioni, stili di base e un unico sistema di **stelle, livelli e traguardi**.

## Rotte

| Percorso                        | Contenuto                                |
| ------------------------------- | ---------------------------------------- |
| `/`                             | Hub con i cinque mondi                   |
| `/english`                      | Dashboard di Little English (18 giochi)  |
| `/english/play/[gameId]`        | Partita                                  |
| `/english/play/[gameId]/result` | Riepilogo                                |
| `/math`                         | Dashboard di Little Math (7 giochi)      |
| `/math/play/[gameId]`           | Partita                                  |
| `/math/play/[gameId]/result`    | Riepilogo                                |
| `/italian`                      | Dashboard di Little Italiano (10 giochi) |
| `/italian/play/[gameId]`        | Partita                                  |
| `/italian/play/[gameId]/result` | Riepilogo                                |
| `/time`                         | Dashboard di Little Orologio (5 giochi)  |
| `/time/play/[gameId]`           | Partita                                  |
| `/time/play/[gameId]/result`    | Riepilogo                                |
| `/logic`                        | Dashboard di Little Logica (5 giochi)    |
| `/logic/play/[gameId]`          | Partita                                  |
| `/logic/play/[gameId]/result`   | Riepilogo                                |

Gli URL sono in inglese; l'interfaccia per i bambini resta in italiano. Le partite vivono nello stato React. Ogni bambino crea un **nome unico** con una password: stelle, livelli e traguardi vengono salvati su PostgreSQL (Neon) e restano legati al suo account.

## Struttura

```text
src/
  app/
    page.tsx                 hub dei cinque mondi
    globals.css              reset, base e stili dell'hub
    api/
      auth/                  registrazione, accesso e uscita
      me/                    sessione, progressi e preferenze correnti
      progress/              azzeramento dei progressi e registrazione partite (`rounds/`)
      settings/              salvataggio delle preferenze di gioco
    english/                 rotte di Little English
    math/                    rotte di Little Math
    italian/                 rotte di Little Italiano
    time/                    rotte di Little Orologio
    logic/                   rotte di Little Logica
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
    time/
      components/time-app.tsx
      components/clock-face.tsx   orologio SVG originale
      data/games.ts
    logic/
      components/logic-app.tsx
      components/logic-shape.tsx  forme SVG originali
      data/games.ts
    gamification/
      components/            accesso, pillola, banner, pannello traguardi, provider React
      components/game-setup.tsx  schermata pre-gioco condivisa
      components/progress-track.tsx  barra avanzamento domande condivisa
      hooks/use-round-controller.ts  stato partita condiviso dai cinque mondi
      lib/speech.ts          sintesi vocale: guard, voce italiana e errori in un posto solo
      lib/db-rounds.ts       registrazione partite in transazione e idempotente
      lib/progress.ts        stelle, livelli, badge e logica pura
      lib/db-progress.ts     mappatura tra progressi e database
      lib/game-settings.ts   preferenze di gioco per utente
      lib/db-settings.ts     mappatura tra preferenze e database
  lib/db.ts                  client Prisma condiviso
  styles/
    auth.css                 stili di accesso e creazione del nome
    gamification.css         stili condivisi di stelle, banner, traguardi e setup
    language.css             stili condivisi English + Italiano, con scope
    math.css                 stili Math, riusati da Orologio e Logica
    time.css                 override e orologio di Little Orologio
    logic.css                override e forme di Little Logica
prisma/
  schema.prisma              modelli User, Progress, Round, GameSetting e Session
  migrations/                migrazioni SQL versionate
prisma.config.ts             configurazione Prisma CLI (schema, migrazioni, URL diretto)
src/generated/prisma/        client Prisma generato (non versionato)
scripts/
  audio-core.mjs             logica comune di generazione audio
  generate-audio-english.mjs
  generate-audio-italian.mjs
public/
  audio/english/             MP3 già presenti
  audio/italian/             MP3 opzionali, non usati dall'app
  illustrations/             SVG condivisi e crediti
```

Ogni feature è autosufficiente: dati, componenti e audio vivono nella propria cartella. Per aggiungere un mondo nuovo basta creare `src/features/<mondo>`, una cartella di rotte in `src/app/<mondo>` e un foglio di stile con scope.

### Pezzi condivisi dai giochi

I cinque mondi hanno grafica e domande diverse, ma la meccanica comune sta in un solo posto:

- `useRoundController<TRound, TStartArgs, TAnswerArgs>` gestisce lo stato della partita (`round`, `start`, `answer`). Ogni mondo passa soltanto il proprio `createRound` e il proprio `recordAnswer`: così correzioni e nuove behaviour non vanno replicate cinque volte.
- `ProgressTrack` è la barra di avanzamento delle domande, con lo stesso markup e gli stessi attributi ARIA in tutti i mondi.
- `speakItalian` / `stopSpeech` centralizzano il controllo `speechSynthesis`, la scelta della voce `it-*`, i messaggi di errore e la gestione di `interrupted`/`canceled`. English continua a usare i propri MP3 con lo stesso pattern di errore.

Restano specifici di ogni mondo i dati, le illustrazioni, il layout delle domande e la schermata dei risultati.

### Accessibilità

- Lo zoom a pinza non è bloccato: il viewport non imposta `maximumScale`/`userScalable` e il testo resta selezionabile su touch screen (WCAG 1.4.4).
- Il testo informativo usa almeno 12–13px e `--muted` ha contrasto ≥ 5:1 sullo sfondo chiaro; le etichette `9px` restano solo per decorazioni.
- Dopo una risposta, English e Italiano riportano il focus sul pulsante “Avanti” con lo stesso pattern di Math, Orologio e Logica.
- Little Logica ha il pulsante “Ascolta” per consegna e spiegazione, e la griglia 4×3 espone la posizione di partenza e della stella nell'`aria-label`.
- Le parole inglesi fuori dal gameplay (setup e card della dashboard) sono marcate `lang="en"`.

### Stili con scope

Le app originali usavano nomi di classe uguali (`.game-card`, `.dashboard`, `.question-stage`…). Per conviverle senza conflitti:

- `language.css` è scritto tutto sotto `.subject-language`.
- `math.css` è scritto tutto sotto `.subject-math`.
- Il layout di English applica `subject-language subject-english`, quello di Italiano `subject-language subject-italian`, quello di Math `subject-math`.
- Little Orologio e Little Logica riusano il layout di Math applicando `subject-math subject-time` e `subject-math subject-logic`; i file `time.css` e `logic.css` contengono solo override e i pezzi specifici (quadrante, forme, colori).

Quando si modifica uno stile condiviso, mantenere il prefisso `.subject-language` o `.subject-math`. Le differenze di un solo mondo vanno aggiunte come override mirati, ad esempio `.subject-language.subject-english .welcome-letter` o `.subject-math.subject-time .hero-clock`.

## Stelle e traguardi

La gamification è condivisa dai cinque mondi e vive sopra i layout delle singole feature:

- ogni risposta giusta vale **1 stella**; una partita perfetta aggiunge un **bonus di 3 stelle**;
- le stelle fanno salire di **livello** (da “Primi passi” a “Leggenda curiosa”);
- i **traguardi** premiano partite complete, serie perfette, costanza, mondi visitati e risposte corrette per mondo;
- la **serie di giorni** aumenta giocando in giorni consecutivi;
- il pannello dei traguardi, aperto dalla pillola nell'header o dal banner in dashboard, mostra livelli, statistiche e badge e permette di azzerare tutto.

Lo stato è gestito da `GamificationProvider` nel layout radice. All'avvio il provider chiama `GET /api/me`: senza sessione valida mostra la schermata di accesso, altrimenti carica i progressi dal database.

Il salvataggio è **autorevole lato server**: quando una partita finisce, il client applica subito il risultato all'interfaccia per dare un feedback immediato e invia solo il _delta_ (`roundId`, mondo, gioco, risposte giuste e totali) a `POST /api/progress/rounds`. Il server ricalcola stelle, badge e serie con `applyRound()` dentro una transazione `Serializable` e restituisce il progresso aggiornato, che sostituisce quello ottimistico. Il modello `Round` usa `@@unique([userId, roundId])` come chiave di idempotenza: ricaricare la pagina del risultato o inviare due volte la stessa partita non assegna stelle doppie, e due schede simultanee non possono sovrascriversi. Il pannello dei traguardi mostra lo stato del salvataggio e permette di riprovare; `DELETE /api/progress` azzera tutto.

## Prima di giocare

Ogni partita parte da una schermata di preparazione condivisa, in `src/features/gamification/components/game-setup.tsx`:

- nei giochi con un elenco (inglese, italiano e orologio) si scelgono le voci da usare, con le azioni **Tutti** e **Nessuno**; servono almeno quattro voci. In Little Orologio le voci sono le dodici ore;
- si sceglie il numero di domande della partita (4, 6, 8 o 10, oppure tutte le voci selezionate quando sono meno di 10);
- in Little Math si sceglie anche il limite dei numeri (entro 10, 20 o 100), spostato qui dalla dashboard. Little Logica non ha un elenco di voci: si sceglie solo la lunghezza della partita.

Le preferenze vengono salvate per utente e per gioco nel modello `GameSetting` (`GET` e `PUT /api/settings`) e ricaricate con `GET /api/me`. Il round usa la selezione e la lunghezza salvate; “Giochiamo ancora” riparte con la stessa configurazione.

## Account e database

- I bambini si registrano con un **nome** (2–24 caratteri) e una **password** (almeno 4). Il nome è unico senza distinzione tra maiuscole e minuscole.
- Le password sono salvate come hash `scrypt`. La sessione usa un cookie `httpOnly` `little-explorer-session` valido 30 giorni; nel database resta solo l'hash del token.
- I modelli `User`, `Progress`, `Round`, `GameSetting` e `Session` sono definiti in `prisma/schema.prisma`. Ogni utente ha un solo record `Progress`, una preferenza `GameSetting` per gioco e un record `Round` per partita completata (con la ricompensa calcolata dal server).
- Le API in `src/app/api` controllano la sessione lato server. `POST /api/progress/rounds` accetta solo il delta della partita, valida l'input e ricalcola il progresso in transazione; `DELETE /api/progress` azzera tutto. Non esiste più un endpoint che accetta uno snapshot di progressi scritto dal client.
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

Tutte le immagini sono SVG locali in `public/illustrations`, con nomi inglesi leggibili in minuscolo e trattini tra le parole (`cat.svg`, `teddy-bear.svg`). L'app applica dimensioni, rotazioni e composizione tramite CSS; non usa emoji di sistema. Little Orologio e Little Logica non richiedono nuove illustrazioni: il quadrante e le forme geometriche sono SVG disegnati direttamente nei componenti.

Per aggiungere un'illustrazione:

1. Riusa un asset locale adatto, oppure importa un SVG Twemoji dalla revisione indicata in [`public/illustrations/ATTRIBUTION.md`](public/illustrations/ATTRIBUTION.md).
2. Per concetti non coperti, crea un SVG originale nello stesso stile piatto, con `viewBox="0 0 36 36"` e nessuna risorsa esterna.
3. Aggiorna i crediti in `ATTRIBUTION.md` e non sovrascrivere asset esistenti.

## Audio

L'inglese usa MP3 locali già inclusi, generati con la voce britannica **Alice** di ElevenLabs. L'italiano non usa MP3: il pulsante Ascolta parla sempre con la voce italiana del dispositivo tramite `speechSynthesis`, scegliendo una voce `it-*` quando il browser la espone. Little Orologio usa la stessa voce italiana del dispositivo per leggere le ore ad alta voce.

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

L'inglese scrive in `public/audio/english/`, l'italiano in `public/audio/italian/`. Le due cartelle sono separate per evitare collisioni tra parole uguali nelle due lingue. Gli MP3 italiani restano supportati dallo script di generazione, ma l'app non li riproduce.

Il piano gratuito ElevenLabs non permette usi commerciali; l'app non commerciale riporta l'attribuzione e il collegamento a elevenlabs.io. Verifica licenza e costi prima di pubblicare.

## Aggiungere parole e giochi

- **English:** `src/features/english/data/games.ts`. Ogni gioco richiede almeno sei parole distinte; colori e numeri usano rappresentazioni CSS, gli altri concetti un'illustrazione locale. Il campo opzionale `text` mostra un testo italiano al posto dell'illustrazione nella domanda: è il caso di frasi, contrari, giorni e mesi. Con `listenOnly: true` la parola non viene mostrata: il bambino ascolta l'audio e sceglie la figura, quindi servono parole già coperte dagli MP3. Oltre ai dieci giochi originali ci sono corpo umano, famiglia, classe, frasi utili, preposizioni, contrari, giorni della settimana e mesi dell'anno (giochi separati); le preposizioni usano illustrazioni originali `ball-*` in `public/illustrations/`.
- **Italiano:** `src/features/italian/data/games.ts`. Ogni voce ha `pattern`, `answer`, tre alternative, `solution`, `spoken` e `note`; i giochi `letters` chiedono gruppi di lettere (come GN o MP), i giochi `words` chiedono parole intere (come l'apostrofo o l'acca). Ogni gioco deve mescolare parole in cui il suono serve e parole-tranello in cui non serve (per esempio `angolo` o `nido` dentro GN, `olio` dentro GLI, `un amico` dentro l'apostrofo), così il bambino non può indovinare dalla prima lettera.
- **Math:** `src/features/math/data/games.ts`. Addizioni, sottrazioni, moltiplicazioni e divisioni sono generate dai limiti 10, 20 e 100; il gioco del doppio e della metà usa gli stessi limiti e genera solo coppie `a + a` e divisioni per 2. Ogni partita ha sei domande e quattro risposte vicine al risultato.
- **Orologio:** `src/features/time/data/games.ts`. Le ore sono limitate a `in punto`, `e un quarto`, `e mezza` e `meno un quarto` (minuti 0, 15, 30, 45). `timePhrase` costruisce la frase italiana, `spokenTime` aggiunge “È l'” o “Sono le” per la voce del dispositivo. I giochi leggono il quadrante, scelgono l'orologio, riconoscono il quarto o ascoltano l'ora; le partite ruotano sui quattro minuti.
- **Logica:** `src/features/logic/data/games.ts`. Le sfide sono sequenze, intruso, dimensioni e percorsi su griglia; le forme sono descritte da tipo, colore e dimensione e disegnate da `logic-shape.tsx`. Le sequenze usano regole ripetute (AB, ABC, AAB), colori che cambiano ogni due forme, forme che crescono o rimpiccioliscono e riquadri vuoti anche nel mezzo. L'intruso può differire per colore, dimensione o forma; le dimensioni chiedono anche il secondo più grande/piccolo; i percorsi chiedono sequenze di 2-3 frecce su una griglia 4x3. Il gioco misto alterna i quattro tipi.

Dopo aver aggiunto parole inglesi, genera gli MP3 mancanti prima del deploy. I testi italiani non richiedono audio: vengono letti dal dispositivo.

## Deploy su Vercel

Importa il repository su Vercel, seleziona il preset **Next.js** e Node.js 22.x o successivo. Aggiungi `DATABASE_URL` e `DIRECT_URL` alle variabili d'ambiente del progetto e applica le migrazioni con `npm run db:deploy` (una volta, o come passo del comando di build). Comando build: `npm run build`. Le chiavi ElevenLabs servono solo in locale per generare gli MP3.

## Crediti

Illustrazioni [Twemoji](https://github.com/jdecked/twemoji), Twitter e altri contributori, licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Le illustrazioni originali di Little English e Little Italiano sono distribuite con la stessa licenza. Elenco completo, provenienza e mappatura dei nomi in [`public/illustrations/ATTRIBUTION.md`](public/illustrations/ATTRIBUTION.md).

Icone [Lucide](https://lucide.dev/), licenza ISC. Font Nunito e Plus Jakarta Sans, SIL Open Font License. Audio inglese generato con ElevenLabs, voce Alice.
