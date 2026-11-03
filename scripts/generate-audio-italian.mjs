import { pathToFileURL } from "node:url";
import { games } from "../src/features/italian/data/games.ts";
import { audioFilename } from "../src/features/italian/lib/audio.ts";
import { runAudioGenerator } from "./audio-core.mjs";

const help = `Generazione audio italiano con ElevenLabs (configurazione in .env).
  --voices              Elenca le voci disponibili nel tuo account
  --sample              Genera solo sample.mp3 (consuma crediti)
  --all --dry-run       Mostra testi e caratteri, senza chiamate API
  --all --confirm       Genera tutti i testi (consuma crediti)
Gli MP3 esistenti vengono riutilizzati. Nessuna rigenerazione automatica.
Per l'italiano scegli una voce italiana dalla libreria ElevenLabs.
Gli audio finiscono in public/audio/italian/.`;

export function vocabularyJobs() {
  const texts = [...new Set(games.flatMap((game) => game.entries.map((entry) => entry.spoken)))];
  const jobs = texts.map((text) => ({
    text,
    filename: audioFilename(text),
  }));
  if (new Set(jobs.map((job) => job.filename)).size !== jobs.length) {
    throw new Error("Nomi audio duplicati: correggere i testi prima di generare.");
  }
  return jobs;
}

export function main(args, env = process.env, fetchImpl = fetch) {
  return runAudioGenerator({
    args,
    env,
    fetchImpl,
    help,
    sample: "Ciao, piccolo esploratore! Ragno. Foglia. Pesce. Chiave. Acqua. Palla. Perché. Io ho un cane. Bravo!",
    jobs: vocabularyJobs,
    directory: new URL("../public/audio/italian/", import.meta.url),
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : "Generazione audio fallita.");
    process.exitCode = 1;
  });
}
