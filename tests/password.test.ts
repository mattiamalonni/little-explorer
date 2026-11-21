import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, verifyPassword } from "../src/features/auth/lib/password.ts";

test("hash e verifica concordano", async () => {
  const stored = await hashPassword(" una password qualsiasi ");
  assert.match(stored, /^scrypt:[0-9a-f]{32}:[0-9a-f]{128}$/);
  assert.equal(await verifyPassword(" una password qualsiasi ", stored), true);
  assert.equal(await verifyPassword("password sbagliata", stored), false);
});

test("due hash della stessa password hanno salt diverso", async () => {
  const a = await hashPassword("stessa");
  const b = await hashPassword("stessa");
  assert.notEqual(a, b);
  assert.equal(await verifyPassword("stessa", a), true);
  assert.equal(await verifyPassword("stessa", b), true);
});

test("hash malformati o di altro algoritmo vengono rifiutati", async () => {
  assert.equal(await verifyPassword("x", "bcrypt:salt:hash"), false);
  assert.equal(await verifyPassword("x", "scrypt:salt"), false);
  assert.equal(await verifyPassword("x", "scrypt:zz:zz"), false);
});
