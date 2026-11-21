import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const KEY_LENGTH = 64;
// scrypt è bloccante: la versione promisificata lascia libero l'event loop durante login e registrazione.
const scryptAsync = promisify(scrypt);

function derive(password: string, salt: string): Promise<Buffer> {
  return scryptAsync(password, salt, KEY_LENGTH) as Promise<Buffer>;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = await derive(password, salt);
  return `scrypt:${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algorithm, salt, hash] = stored.split(":");
  if (algorithm !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "hex");
  const candidate = await derive(password, salt);
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}
