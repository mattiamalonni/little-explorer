import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Le migrazioni usano la connessione diretta, l'app usa quella con pooler.
    url: env("DIRECT_URL"),
  },
});
