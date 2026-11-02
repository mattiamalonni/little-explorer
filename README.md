# Little Explorer

Tre mondi di minigiochi per bambini in un'unica app: **inglese**, **matematica** e **italiano**. Next.js App Router, React e TypeScript.

La home è un hub con tre mondi. Ogni mondo conserva il proprio carattere, i propri giochi e le proprie impostazioni, ma condivide infrastruttura, illustrazioni e stili di base.

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

Gli URL sono in inglese; l'interfaccia per i bambini resta in italiano. Le partite vivono nello stato React: non ci sono account, database, cookie applicativi o salvataggi persistenti.

## Struttura

```text
src/
  app/
    page.tsx                 hub dei tre mondi
    globals.css              reset, base e stili dell'hub
    english/                 rotte di Little English
    math/                    rotte di Little Math
    italian/                 rotte di Little Italiano
  features/
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
  styles/
    language.css             stili condivisi English + Italiano, con scope
    math.css                 stili Math, con scope
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

## Avvio locale

Node.js 22.18 o successivo.

```bash
npm install
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

Non è presente una suite di test: la verifica avviene con lint, controllo della formattazione, build e controllo manuale delle rotte.

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
2. Copia `.env.example` in `.env.local` e compila `ELEVENLABS_API_KEY`, `ELEVENLABS_VOICE_ID` e, se serve, `ELEVENLABS_MODEL_ID`. Non usare prefissi `NEXT_PUBLIC_`: la chiave non deve arrivare al browser.
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

Importa il repository su Vercel, seleziona il preset **Next.js** e Node.js 22.x o successivo. Comando build: `npm run build`. Non servono segreti, variabili d'ambiente o database in produzione: le chiavi ElevenLabs servono solo in locale per generare gli MP3.

## Crediti

Illustrazioni [Twemoji](https://github.com/jdecked/twemoji), Twitter e altri contributori, licenza [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Le illustrazioni originali di Little English sono distribuite con la stessa licenza. Elenco completo, provenienza e mappatura dei nomi in [`public/illustrations/ATTRIBUTION.md`](public/illustrations/ATTRIBUTION.md).

Icone [Lucide](https://lucide.dev/), licenza ISC. Font Nunito e Plus Jakarta Sans, SIL Open Font License. Audio inglese generato con ElevenLabs, voce Alice.
