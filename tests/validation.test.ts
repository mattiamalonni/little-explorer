import assert from "node:assert/strict";
import test from "node:test";
import { nameKey, normalizeName, parseCredentials } from "../src/features/auth/lib/validation.ts";

test("normalizeName: trim, spazi collassati e NFKC", () => {
  assert.equal(normalizeName("  Ma\t tti a  "), "Ma tti a");
  assert.equal(normalizeName("Ｍａｔｔｉａ"), "Mattia");
});

test("nameKey è stabile e case-insensitive in italiano", () => {
  assert.equal(nameKey("  Mattia  "), nameKey("mattia"));
  assert.equal(nameKey("Però"), "però");
});

test("parseCredentials valida il nome", () => {
  assert.equal(parseCredentials({ name: "A", password: "lungaabbastanza" }).ok, false);
  assert.equal(parseCredentials({ name: "x".repeat(25), password: "lungaabbastanza" }).ok, false);
  assert.equal(parseCredentials({ name: "Bio@", password: "lungaabbastanza" }).ok, false);
  assert.equal(parseCredentials({ name: "Mario Rossi", password: "lungaabbastanza" }).ok, true);
  assert.equal(parseCredentials({ name: "Èmile", password: "lungaabbastanza" }).ok, true);
  assert.equal(parseCredentials(null).ok, false);
});

test("la password minima è 4 per il login e 8 per la registrazione", () => {
  const payload = { name: "Mattia", password: "12345678" };
  assert.equal(parseCredentials(payload).ok, true);
  assert.equal(parseCredentials(payload, { minPasswordLength: 8 }).ok, true);

  const short = { name: "Mattia", password: "1234" };
  assert.equal(parseCredentials(short).ok, true);
  const result = parseCredentials(short, { minPasswordLength: 8 });
  assert.equal(result.ok, false);
  if (!result.ok) assert.match(result.error, /8/);

  assert.equal(parseCredentials({ name: "Mattia", password: "x".repeat(101) }).ok, false);
});
