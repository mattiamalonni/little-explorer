import assert from "node:assert/strict";
import test from "node:test";
import { checkAuthRateLimit } from "../src/features/auth/lib/rate-limit.ts";

let sequence = 0;
function request(ip: string): Request {
  return new Request("http://localhost/api/auth/login", {
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` },
  });
}
function uniqueIp(): string {
  sequence += 1;
  return `192.0.2.${sequence}`;
}

test("consente i tentativi sotto la soglia e restituisce retry-after oltre", () => {
  const ip = uniqueIp();
  const name = `bambino-${sequence}`;
  for (let i = 0; i < 8; i += 1) {
    assert.deepEqual(checkAuthRateLimit(request(ip), name), { ok: true });
  }
  const blocked = checkAuthRateLimit(request(ip), name);
  assert.equal(blocked.ok, false);
  if (!blocked.ok) {
    assert.ok(blocked.retryAfter >= 1 && blocked.retryAfter <= 60);
  }
});

test("il limite per nome è case-insensitive", () => {
  const name = `Caso-${sequence}`;
  for (let i = 0; i < 8; i += 1) {
    assert.equal(checkAuthRateLimit(request(uniqueIp()), i % 2 === 0 ? name : name.toLowerCase()).ok, true);
  }
  assert.equal(checkAuthRateLimit(request(uniqueIp()), name.toUpperCase()).ok, false);
});

test("il limite per IP protegge anche nomi diversi", () => {
  const ip = uniqueIp();
  for (let i = 0; i < 20; i += 1) {
    assert.equal(checkAuthRateLimit(request(ip), `nome-${sequence}-${i}`).ok, true);
  }
  assert.equal(checkAuthRateLimit(request(ip), `nome-${sequence}-finale`).ok, false);
});

test("usa x-real-ip come fallback e non confonde IP diversi", () => {
  const a = new Request("http://localhost", { headers: { "x-real-ip": `a-${sequence}` } });
  const b = new Request("http://localhost", { headers: { "x-real-ip": `b-${sequence}` } });
  for (let i = 0; i < 8; i += 1) {
    assert.equal(checkAuthRateLimit(a, `fallback-${sequence}-${i}`).ok, true);
  }
  assert.equal(checkAuthRateLimit(b, `fallback-${sequence}-altro`).ok, true);
});
