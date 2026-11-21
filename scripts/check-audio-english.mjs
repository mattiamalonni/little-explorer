import { access } from "node:fs/promises";
import { vocabularyJobs } from "./generate-audio-english.mjs";

// Usabile in CI: verifica che ogni parola del vocabolario abbia un MP3 locale.
const jobs = vocabularyJobs();
const missing = [];

for (const job of jobs) {
  try {
    await access(new URL(`../public/audio/english/${job.filename}`, import.meta.url));
  } catch {
    missing.push(job);
  }
}

if (missing.length > 0) {
  for (const job of missing) console.error(`Manca ${job.filename} (${job.text})`);
  console.error(
    `${missing.length}/${jobs.length} audio mancanti. Generali con npm run audio:generate:english -- --all --confirm`,
  );
  process.exitCode = 1;
} else {
  console.log(`OK: ${jobs.length} audio inglesi presenti.`);
}
