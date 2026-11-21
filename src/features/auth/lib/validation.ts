export type Credentials = {
  name: string;
  password: string;
};

export type ParsedCredentials = { ok: true; credentials: Credentials } | { ok: false; error: string };

const NAME_PATTERN = /^[\p{L}\p{N} .'-]+$/u;

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ").normalize("NFKC");
}

export function nameKey(name: string): string {
  return normalizeName(name).toLocaleLowerCase("it-IT");
}

/**
 * `minPasswordLength` è 4 per l'accesso (per non bloccare chi ha un account vecchio)
 * e 8 per la registrazione (nuove password più sicure).
 */
export function parseCredentials(payload: unknown, options?: { minPasswordLength?: number }): ParsedCredentials {
  const minPasswordLength = options?.minPasswordLength ?? 4;
  if (typeof payload !== "object" || payload === null) {
    return { ok: false, error: "Compila il nome e la password." };
  }

  const record = payload as Record<string, unknown>;
  const rawName = typeof record.name === "string" ? record.name : "";
  const rawPassword = typeof record.password === "string" ? record.password : "";
  const name = normalizeName(rawName);

  if (name.length < 2 || name.length > 24) {
    return { ok: false, error: "Il nome deve avere da 2 a 24 lettere." };
  }
  if (!NAME_PATTERN.test(name)) {
    return { ok: false, error: "Nel nome puoi usare lettere, numeri, spazi, apostrofi e trattini." };
  }
  if (rawPassword.length < minPasswordLength || rawPassword.length > 100) {
    return { ok: false, error: `La password deve avere da ${minPasswordLength} a 100 caratteri.` };
  }

  return { ok: true, credentials: { name, password: rawPassword } };
}
