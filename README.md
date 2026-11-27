# Little Explorer

Cinque mondi di minigiochi per bambini in un'unica app: **inglese**, **matematica**, **italiano**, **orologio** e **logica**. Next.js App Router, React e TypeScript.

La home è un hub con cinque mondi. Ogni mondo conserva il proprio carattere, i propri giochi e le proprie impostazioni, ma condivide infrastruttura, illustrazioni, stili di base e un unico sistema di **stelle, livelli e traguardi**.

## Rotte

| Percorso                        | Contenuto                                |
| ------------------------------- | ---------------------------------------- |
| `/`                             | Hub con i cinque mondi                   |
| `/english`                      | Dashboard di Little English (19 giochi)  |
| `/english/play/[gameId]`        | Partita                                  |
| `/english/play/[gameId]/result` | Riepilogo                                |
| `/math`                         | Dashboard di Little Math (7 giochi)      |
| `/math/play/[gameId]`           | Partita                                  |
| `/math/play/[gameId]/result`    | Riepilogo                                |
| `/italian`                      | Dashboard di Little Italiano (13 giochi) |
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
    error.tsx                errore recuperabile di una rotta
    global-error.tsx         rete di sicurezza se fallisce il layout radice
    not-found.tsx            404 in italiano
    globals.css              reset, base e stili dell'hub
    api/
      auth/                  registrazione, accesso e uscita
      cron/cleanup/          pulizia notturna delle sessioni scadute
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
      lib/round-input.ts     validazione del delta di partita (testabile da sola)
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
tests/                       test unitari node:test della logica pura
scripts/
  audio-core.mjs             logica comune di generazione audio
  check-audio-english.mjs    verifica che nessun MP3 manchi (usabile in CI)
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

Lo stato è gestito da `GamificationProvider` nel layout radice. La sessione viene letta **sul server** da `SessionGate` (in `src/app/layout.tsx`), dietro un confine `<Suspense>`: utente, progressi e preferenze arrivano al provider come prop iniziale, senza il round-trip client di `GET /api/me`. L'endpoint resta solo per i refresh e per il recupero dopo un errore transiente. Senza sessione valida si mostra la schermata di accesso, altrimenti i progressi arrivano dal database.

Il salvataggio è **autorevole lato server**: quando una partita finisce, il client applica subito il risultato all'interfaccia per dare un feedback immediato e invia solo il _delta_ (`roundId`, mondo, gioco, risposte giuste e totali) a `POST /api/progress/rounds`. Il server ricalcola stelle, badge e serie con `applyRound()` dentro una transazione `Serializable` e restituisce il progresso aggiornato **e la reward calcolata sul DB**: quest'ultima sostituisce l'anteprima ottimistica nella schermata risultati. Il modello `Round` usa `@@unique([userId, roundId])` come chiave di idempotenza: ricaricare la pagina del risultato o inviare due volte la stessa partita non assegna stelle doppie, e due schede simultanee non possono sovrascriversi.

La data usata per serie e badge è calcolata sul server e passata al client (`today` in `/api/me` e nelle risposte di login/registrazione): così il fuso orario del browser non può far scattare il badge un giorno prima o dopo. Le richieste di salvataggio usano `keepalive`, quindi una partita completata non si perde se la scheda viene chiusa subito. L'azzeramento (`DELETE /api/progress`) attende la fine degli invii in volo e, se fallisce, resta in coda: il pulsante **Riprova** lo ripete davvero.

## Prima di giocare

Ogni partita parte da una schermata di preparazione condivisa, in `src/features/gamification/components/game-setup.tsx`:

- nei giochi con un elenco (inglese, italiano e orologio) si scelgono le voci da usare, con le azioni **Tutti** e **Nessuno**; servono almeno quattro voci. La scelta esplicita “Nessuno” sopravvive alla navigazione e al reload: `null` significa “non ancora impostata, prendi tutte le voci”, `[]` in memoria è “Nessuno”, e sul database quest'ultimo è salvato con il segnaposto `__none__` perché i record storici con `[]` significavano “tutto”. In Little Orologio le voci sono le dodici ore;
- si sceglie il numero di domande della partita (4, 6, 8 o 10, oppure tutte le voci selezionate quando sono meno di 10);
- in Little Math si sceglie anche il limite dei numeri (entro 10, 20 o 100), spostato qui dalla dashboard. Little Logica non ha un elenco di voci: si sceglie solo la lunghezza della partita.

Le preferenze vengono salvate per utente e per gioco nel modello `GameSetting` (`GET` e `PUT /api/settings`) e ricaricate con `GET /api/me`. Il round usa la selezione e la lunghezza salvate; “Giochiamo ancora” riparte con la stessa configurazione. Se il salvataggio di una preferenza fallisce, la modifica resta in coda, lo stato del salvataggio passa in errore e **Riprova** la invia di nuovo insieme agli eventuali round e azzeramenti pendenti.

## Account e database

- I bambini si registrano con un **nome** (2–24 caratteri) e una **password** di almeno **8 caratteri**. L'accesso accetta anche password più corte, così gli account creati in precedenza restano utilizzabili. Il nome è unico senza distinzione tra maiuscole e minuscole.
- Le password sono salvate come hash `scrypt` calcolato in modo asincrono (`promisify`), così login e registrazione non bloccano l'event loop. La sessione usa un cookie `httpOnly` `little-explorer-session` valido 30 giorni; nel database resta solo l'hash del token. Ogni nuovo accesso invalida le sessioni precedenti dello stesso utente.
- Login e registrazione hanno un rate limit in memoria (20 tentativi/IP e 8 per nome ogni minuto, con header `Retry-After`); la registrazione restituisce un messaggio generico se il nome è occupato, per non rivelare quali nomi esistono. Su piattaforme multi-istanza va affiancato un limite distribuito (WAF/Redis).
- Le letture della sessione nelle API che servono solo progressi o preferenze usano `getSessionUserId()` con `select` minimale; `/api/me` continua a caricare progressi e preferenze. Un errore del database restituisce JSON 500 e non viene più interpretato come "utente non autenticato": solo un 401 porta alla schermata di accesso, mentre i 5xx mostrano una schermata di errore con pulsante **Riprova**.
- I modelli `User`, `Progress`, `Round`, `GameSetting` e `Session` sono definiti in `prisma/schema.prisma`. Ogni utente ha un solo record `Progress`, una preferenza `GameSetting` per gioco e un record `Round` per partita completata (con la ricompensa calcolata dal server).
- Le API in `src/app/api` controllano la sessione lato server. `POST /api/progress/rounds` accetta solo il delta della partita, valida l'input e ricalcola il progresso in transazione; `DELETE /api/progress` azzera tutto. Non esiste più un endpoint che accetta uno snapshot di progressi scritto dal client.
- Se su un browser esistono ancora progressi anonimi in `localStorage` (chiave `little-explorer:progress:v1`), vengono copiati nel nuovo account al momento della registrazione e poi rimossi. Il server li passa da `reconcileMigration()`, che ripristina le invarianti garantite dai round (risposte giuste ≤ stelle, partite perfette e giochi ≤ partite, serie ≤ partite, nessuna data futura) e scarta i badge non coerenti, tranne `streak-3` che resta sbloccato anche se la serie ricade. Un payload costruito a mano non può quindi seminare un account con valori impossibili.

## Avvio locale

Node.js 22.18 o successivo.

```bash
npm install
cp .env.example .env
```

Compila in `.env`:

- `DATABASE_URL`: URL PostgreSQL con pooler, usato dall'app;
- `DIRECT_URL`: URL diretto dello stesso database, usato dalle migrazioni Prisma;
- `CRON_SECRET`: segreto per il cron di pulizia sessioni (facoltativo in locale; obbligatorio su Vercel per abilitare il cron).

`vercel.json` schedula `GET /api/cron/cleanup` ogni notte alle 03:00 UTC per eliminare le sessioni scadute e i record `Round` più vecchi di 90 giorni (l'indice `Round_createdAt_idx` rende la pulizia economica); l'endpoint risponde 503 se `CRON_SECRET` non è impostato e 401 senza l'header `Authorization: Bearer <CRON_SECRET>`.

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

La verifica automatica è:

```bash
npm test              # 36 test unitari con node:test (nessun framework, nessun DB)
npm run typecheck     # next typegen && tsc --noEmit (serve da checkout pulito)
npm run lint
npm run format:check
npm run audio:check:english
npm run build
```

I test usano il test runner integrato di Node con `--experimental-strip-types`: importano i moduli `.ts` direttamente, senza alias o transpilazione. Coprono `applyRound` e la normalizzazione dei progressi, la validazione dell'input delle partite, name/password, rate limit, preferenze di gioco e la logica deterministica dei round di English e Math (con `random` iniettato).

Gli stessi comandi girano in `.github/workflows/ci.yml` a ogni push su `main` e a ogni pull request. Il job non ha bisogno di database: imposta solo un `DIRECT_URL` segnaposto perché `postinstall` esegua `prisma generate`, che non apre connessioni. La build non richiede `DATABASE_URL` perché la sessione viene letta a request time dietro `<Suspense>`.

## Illustrazioni

Tutte le immagini sono SVG locali in `public/illustrations`, con nomi inglesi leggibili in minuscolo e trattini tra le parole (`cat.svg`, `teddy-bear.svg`). L'app applica dimensioni, rotazioni e composizione tramite CSS; non usa emoji di sistema. Little Orologio e Little Logica non richiedono nuove illustrazioni: il quadrante e le forme geometriche sono SVG disegnati direttamente nei componenti.

Per aggiungere un'illustrazione:

1. Riusa un asset locale adatto, oppure importa un SVG Twemoji dalla revisione indicata in [`public/illustrations/ATTRIBUTION.md`](public/illustrations/ATTRIBUTION.md).
2. Per concetti non coperti, crea un SVG originale nello stesso stile piatto, con `viewBox="0 0 36 36"` e nessuna risorsa esterna.
3. Aggiorna i crediti in `ATTRIBUTION.md` e non sovrascrivere asset esistenti.

## Audio

L'inglese usa MP3 locali già inclusi (441 voci del vocabolario, comprese le 48 frasi del gioco _I am / You are_), generati con la voce britannica **Alice** di ElevenLabs. L'italiano non usa MP3: il pulsante Ascolta parla sempre con la voce italiana del dispositivo tramite `speechSynthesis`, scegliendo una voce `it-*` quando il browser la espone. Little Orologio e Little Logica usano la stessa voce italiana del dispositivo.

I browser non chiamano mai ElevenLabs. Il pulsante Ascolta è presente in domande, feedback e riepiloghi. Un nuovo ascolto interrompe il precedente; cambio pagina, avanzamento e disattivazione audio fermano la riproduzione, compresa la voce di riserva. Se un MP3 manca o non si riproduce, English ripassa alla voce inglese del dispositivo (`en-*`): il messaggio di errore compare solo se anche quel fallback fallisce.

Gli elementi audio vengono riutilizzati per parola e la parola successiva è precaricata quando appare il feedback, così il primo ascolto non paga la latenza di rete. `next.config.ts` serve `/audio` e `/illustrations` con `Cache-Control: immutable`.

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
   # oppure vedi il testo del campione senza spendere crediti:
   npm run audio:generate:english -- --sample --dry-run
   npm run audio:generate:english -- --all --confirm
   npm run audio:generate:italian -- --all --confirm
   ```

Gli MP3 esistenti vengono riutilizzati, quindi il comando si può riprendere dopo un errore. Gli errori fermano il lotto senza retry automatici. Per rigenerare un file, rimuovilo esplicitamente. Se cambi voce o modello, sposta prima gli audio precedenti fuori dalla cartella di destinazione per non mescolare voci diverse.

Prima di ogni deploy (o in CI) verifica che non manchi nessun audio:

```bash
npm run audio:check:english
```

L'inglese scrive in `public/audio/english/`, l'italiano in `public/audio/italian/`. Le due cartelle sono separate per evitare collisioni tra parole uguali nelle due lingue. Gli MP3 italiani restano supportati dallo script di generazione, ma l'app non li riproduce.

Il piano gratuito ElevenLabs non permette usi commerciali; l'app non commerciale riporta l'attribuzione e il collegamento a elevenlabs.io. Verifica licenza e costi prima di pubblicare.

## Aggiungere parole e giochi

- **English:** `src/features/english/data/games.ts`. Ogni gioco richiede almeno sei parole distinte; colori e numeri usano rappresentazioni CSS, gli altri concetti un'illustrazione locale. Il campo opzionale `text` mostra un testo italiano al posto dell'illustrazione nella domanda: è il caso di frasi, contrari, giorni e mesi. Con `listenOnly: true` la parola non viene mostrata: il bambino ascolta l'audio e sceglie la figura, quindi servono parole già coperte dagli MP3. Oltre ai dieci giochi originali ci sono corpo umano, famiglia, classe, frasi utili, preposizioni, contrari, giorni della settimana e mesi dell'anno (giochi separati); le preposizioni usano illustrazioni originali `ball-*` in `public/illustrations/`.
- **Italiano:** `src/features/italian/data/games.ts`. Ogni voce ha `pattern`, `answer`, tre alternative, `solution`, `spoken` e `note`; i giochi `letters` chiedono gruppi di lettere (come GN o MP), i giochi `words` chiedono parole intere (come l'apostrofo o l'acca). Ogni gioco deve mescolare parole in cui il suono serve e parole-tranello in cui non serve (per esempio `angolo` o `nido` dentro GN, `olio` dentro GLI, `un amico` dentro l'apostrofo), così il bambino non può indovinare dalla prima lettera. Nei giochi con il campo `targets` (GN, GLI, GLI o LI, SC) ogni round è composto per metà da parole con il suono e per metà da tranelli. Il gioco `sillabe` è a scelta: `answer` è la parola divisa con i trattini (`gat-to`) e le alternative sono divisioni sbagliate delle stesse lettere.
- **Math:** `src/features/math/data/games.ts`. Addizioni, sottrazioni, moltiplicazioni e divisioni sono generate dai limiti 10, 20 e 100; il gioco del doppio e della metà usa gli stessi limiti e genera solo coppie `a + a` e divisioni per 2. Ogni partita ha sei domande e quattro risposte vicine al risultato.
- **Orologio:** `src/features/time/data/games.ts`. Le ore sono limitate a `in punto`, `e un quarto`, `e mezza` e `meno un quarto` (minuti 0, 15, 30, 45). `timePhrase` costruisce la frase italiana, `spokenTime` aggiunge “È l'” o “Sono le” per la voce del dispositivo. I giochi leggono il quadrante, scelgono l'orologio, riconoscono il quarto o ascoltano l'ora; le partite ruotano sui quattro minuti.
- **Logica:** `src/features/logic/data/games.ts`. Le sfide sono sequenze, intruso, dimensioni e percorsi su griglia; le forme sono descritte da tipo, colore e dimensione e disegnate da `logic-shape.tsx`. Le sequenze usano regole ripetute (AB, ABC, AAB), colori che cambiano ogni due forme, forme che crescono o rimpiccioliscono e riquadri vuoti anche nel mezzo. L'intruso può differire per colore, dimensione o forma; le dimensioni chiedono anche il secondo più grande/piccolo; i percorsi chiedono sequenze di 2-3 frecce su una griglia 4x3. Il gioco misto alterna i quattro tipi.

Dopo aver aggiunto parole inglesi, genera gli MP3 mancanti prima del deploy. I testi italiani non richiedono audio: vengono letti dal dispositivo.

## Sicurezza HTTP

`next.config.ts` aggiunge a tutte le risposte `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` e una `Permissions-Policy` che disabilita sensori non usati. In produzione aggiunge anche HSTS e una CSP con `default-src 'self'`. La CSP usa `'unsafe-inline'` per script e stili generati da Next: i nonce sono incompatibili con Cache Components/PPR, perché lo script della shell statica non avrebbe il nonce della richiesta. Non esiste HTML scritto dagli utenti né `dangerouslySetInnerHTML`. Se in futuro serve una CSP rigorosa, valuta `experimental.sri` invece dei nonce.

## Errori e pagine mancanti

Se una rotta fallisce, `src/app/error.tsx` mostra un messaggio in italiano con un pulsante **Riprova** che rivaluta il segmento. Se fallisce il layout radice (sessione o provider), subentra `global-error.tsx`, che deve definire `<html>` e `<body>` propri. Le pagine risultato chiamano `notFound()` quando non c'è una partita in corso: `not-found.tsx` offre il ritorno alla home con lo stile dell'app.

## Deploy su Vercel

Importa il repository su Vercel, seleziona il preset **Next.js** e Node.js 22.x o successivo. Aggiungi `DATABASE_URL`, `DIRECT_URL` e `CRON_SECRET` alle variabili d'ambiente del progetto e applica le migrazioni con `npm run db:deploy` (una volta, o come passo del comando di build) — serve anche la nuova tabella `Round`. Comando build: `npm run build`. Le chiavi ElevenLabs servono solo in locale per generare gli MP3.

## Crediti

Illustrazioni [Twemoji](https://github.com/jdecked/twemoji), Twitter e altri contributori, licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Le illustrazioni originali di Little English e Little Italiano sono distribuite con la stessa licenza. Elenco completo, provenienza e mappatura dei nomi in [`public/illustrations/ATTRIBUTION.md`](public/illustrations/ATTRIBUTION.md).

Icone [Lucide](https://lucide.dev/), licenza ISC. Font Nunito e Plus Jakarta Sans, SIL Open Font License. Audio inglese generato con ElevenLabs, voce Alice.
