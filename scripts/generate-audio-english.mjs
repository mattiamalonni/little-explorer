import { pathToFileURL } from "node:url";
import { games } from "../src/features/english/data/games.ts";
import { audioFilename } from "../src/features/english/lib/audio.ts";
import { runAudioGenerator } from "./audio-core.mjs";

const help = `Generazione audio inglese con ElevenLabs (configurazione in .env).
  --voices              Elenca le voci disponibili nel tuo account
  --sample              Genera solo sample.mp3 (consuma crediti)
  --all --dry-run       Mostra parole e caratteri, senza chiamate API
  --all --confirm       Genera il vocabolario completo (consuma crediti)
Gli MP3 esistenti vengono riutilizzati. Nessuna rigenerazione automatica.
Gli audio finiscono in public/audio/english/.`;

export function vocabularyJobs() {
  const words = [...new Set(games.flatMap((game) => game.words.map((word) => word.english)))];
  const jobs = words.map((text) => ({
    text,
    filename: audioFilename(text),
  }));
  if (new Set(jobs.map((job) => job.filename)).size !== jobs.length) {
    throw new Error("Nomi audio duplicati: correggere i nomi prima di generare.");
  }
  return jobs;
}

export function main(args, env = process.env, fetchImpl = fetch) {
  return runAudioGenerator({
    args,
    env,
    fetchImpl,
    help,
    sample: "Hello, little explorer! Tree. Flower. Rainbow. Butterfly. One, two, three. Well done!",
    jobs: vocabularyJobs,
    directory: new URL("../public/audio/english/", import.meta.url),
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((error) => {
    console.error(error instanceof Error ? error.message : "Generazione audio fallita.");
    process.exitCode = 1;
  });
}
