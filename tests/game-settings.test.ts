import assert from "node:assert/strict";
import test from "node:test";
import {
  createDefaultGameSetting,
  normalizeGameSetting,
  normalizeGameSettings,
  settingFor,
  settingKey,
} from "../src/features/gamification/lib/game-settings.ts";

test("settingKey e settingFor usano la chiave world:gameId", () => {
  assert.equal(settingKey("math", "addition"), "math:addition");
  const settings = normalizeGameSettings({ "math:addition": { roundLength: 10 } });
  assert.deepEqual(settingFor(settings, "math", "addition"), { selected: null, roundLength: 10, limit: null });
  assert.deepEqual(settingFor(settings, "english", "colors"), createDefaultGameSetting());
});

test("normalizeGameSetting ripulisce selezione, lunghezza e limite", () => {
  assert.deepEqual(normalizeGameSetting({ selected: [" red ", "red", "", 3, "blue"], roundLength: 6.9, limit: 20 }), {
    selected: ["red", "blue"],
    roundLength: 6,
    limit: 20,
  });
  assert.deepEqual(normalizeGameSetting({ selected: [], roundLength: -3, limit: 7 }), {
    selected: [],
    roundLength: 1,
    limit: null,
  });
  assert.deepEqual(normalizeGameSetting({ roundLength: 99, limit: 100 }), {
    selected: null,
    roundLength: 20,
    limit: 100,
  });
  assert.deepEqual(normalizeGameSetting(null), createDefaultGameSetting());
});

test("la selezione vuota ('Nessuno') sopravvive alla normalizzazione", () => {
  const saved = normalizeGameSetting({ selected: [], roundLength: 6, limit: null });
  assert.deepEqual(saved.selected, []);
  assert.notEqual(saved.selected, null);
  assert.deepEqual(normalizeGameSetting({}).selected, null);
  assert.deepEqual(normalizeGameSetting({ selected: "none" }).selected, null);
});

test("normalizeGameSettings scarta chiavi non valide", () => {
  const settings = normalizeGameSettings({
    ":colors": { roundLength: 8 },
    "foo:colors": { roundLength: 8 },
    "math:bad_id": { roundLength: 8 },
    "english:": { roundLength: 8 },
    "english:colors": { roundLength: 8 },
  });
  assert.deepEqual(Object.keys(settings), ["english:colors"]);
  assert.equal(settings["english:colors"].roundLength, 8);
  assert.deepEqual(normalizeGameSettings([]), {});
});
