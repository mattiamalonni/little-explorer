"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ArrowRight, Check, ListChecks } from "lucide-react";
import { useGamification } from "@/features/gamification/components/gamification-context";
import { ROUND_LENGTH_OPTIONS, settingFor, type GameSetting } from "@/features/gamification/lib/game-settings";
import type { World } from "@/features/gamification/lib/progress";

export type SetupItem = {
  id: string;
  label: string;
  /** Lingua dell'etichetta, quando non coincide con quella del documento. */
  lang?: string;
  hint?: string;
  image?: string;
  color?: string;
  number?: number;
  text?: string;
  /** Gruppo della voce, per la scelta rapida (per esempio "bisillaba"). */
  group?: string;
};

export type SetupGroup = {
  id: string;
  label: string;
};

export type SetupConfig = {
  selected: string[];
  roundLength: number;
  limit: number | null;
};

type LimitOption = {
  value: number;
  label: string;
};

type Props = {
  world: World;
  gameId: string;
  items?: readonly SetupItem[];
  /** Pulsanti di scelta rapida: selezionano solo le voci di quel gruppo. */
  groups?: readonly SetupGroup[];
  limits?: readonly LimitOption[];
  intro?: string;
  startLabel?: string;
  onStart: (config: SetupConfig) => void;
};

const MIN_ITEMS = 4;

function clampRoundLength(length: number, available: number): number {
  if (available < MIN_ITEMS) return Math.max(MIN_ITEMS, length);
  return Math.min(Math.max(length, MIN_ITEMS), available);
}

function selectionToSetting(
  selected: readonly string[],
  allIds: readonly string[],
  roundLength: number,
  limit: number | null,
): GameSetting {
  const everything = allIds.length > 0 && selected.length === allIds.length;
  return {
    selected: everything ? null : [...selected],
    roundLength,
    limit,
  };
}

export function GameSetup({ world, gameId, items = [], groups, limits, intro, startLabel = "Cominciamo", onStart }: Props) {
  const { settings, updateGameSetting } = useGamification();
  const stored = settingFor(settings, world, gameId);
  const allIds = useMemo(() => items.map((item) => item.id), [items]);

  const [selected, setSelected] = useState<string[]>(() => {
    if (allIds.length === 0) return [];
    // null = mai impostato (tutto), [] = l'utente ha scelto "Nessuno".
    if (stored.selected === null) return allIds;
    const known = new Set(allIds);
    const restored = stored.selected.filter((id) => known.has(id));
    return stored.selected.length > 0 && restored.length === 0 ? allIds : restored;
  });
  const [roundLength, setRoundLength] = useState(() => clampRoundLength(stored.roundLength, allIds.length));
  const [limit, setLimit] = useState<number | null>(() => stored.limit ?? limits?.[0]?.value ?? null);

  const available = allIds.length > 0 ? selected.length : 20;
  const effectiveRoundLength = clampRoundLength(roundLength, available);
  const lengthOptions = useMemo(() => {
    const values = new Set<number>(ROUND_LENGTH_OPTIONS);
    if (available >= MIN_ITEMS && available <= 10) values.add(available);
    return [...values].filter((value) => value >= MIN_ITEMS && value <= available).sort((a, b) => a - b);
  }, [available]);
  const enoughItems = allIds.length === 0 || selected.length >= MIN_ITEMS;

  function persist(nextSelected: readonly string[], nextLength: number, nextLimit: number | null) {
    updateGameSetting(world, gameId, selectionToSetting(nextSelected, allIds, nextLength, limits ? nextLimit : null));
  }

  function changeSelected(nextSelected: string[]) {
    const nextLength = clampRoundLength(roundLength, allIds.length > 0 ? nextSelected.length : 20);
    setSelected(nextSelected);
    setRoundLength(nextLength);
    persist(nextSelected, nextLength, limit);
  }

  function toggleItem(id: string) {
    changeSelected(selected.includes(id) ? selected.filter((entry) => entry !== id) : [...selected, id]);
  }

  function changeLength(value: number) {
    setRoundLength(value);
    persist(selected, value, limit);
  }

  function changeLimit(value: number) {
    setLimit(value);
    persist(selected, effectiveRoundLength, value);
  }

  function start() {
    persist(selected, effectiveRoundLength, limit);
    onStart({ selected, roundLength: effectiveRoundLength, limit });
  }

  return (
    <div className="game-setup">
      {intro && <p className="game-setup-intro">{intro}</p>}
      {items.length > 0 && (
        <fieldset className="game-setup-fieldset">
          <legend>
            <ListChecks size={17} /> Con quali giochiamo?
          </legend>
          <div className="game-setup-selection-head">
            <span>
              <strong>{selected.length}</strong> di {items.length} scelti
            </span>
            <div className="game-setup-selection-actions">
              <button type="button" onClick={() => changeSelected([...allIds])} disabled={selected.length === items.length}>
                Tutti
              </button>
              <button type="button" onClick={() => changeSelected([])} disabled={selected.length === 0}>
                Nessuno
              </button>
            </div>
          </div>
          {groups && groups.length > 0 && (
            <div className="game-setup-groups" role="group" aria-label="Scelta rapida">
              {groups.map((group) => {
                const ids = items.filter((item) => item.group === group.id).map((item) => item.id);
                const only = ids.length > 0 && ids.length === selected.length && ids.every((id) => selected.includes(id));
                return (
                  <button
                    key={group.id}
                    type="button"
                    aria-pressed={only}
                    disabled={ids.length === 0}
                    onClick={() => changeSelected(ids)}
                  >
                    {group.label} <span>{ids.length}</span>
                  </button>
                );
              })}
            </div>
          )}
          <div className="game-setup-items" role="group" aria-label="Voci disponibili">
            {items.map((item) => {
              const isSelected = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  className="game-setup-item"
                  aria-pressed={isSelected}
                  onClick={() => toggleItem(item.id)}
                >
                  <span className="game-setup-item-media" aria-hidden="true">
                    {item.number !== undefined ? (
                      <span className="game-setup-number">{item.number}</span>
                    ) : item.color ? (
                      <span className="game-setup-color" style={{ backgroundColor: item.color }} />
                    ) : item.image ? (
                      <Image src={`/illustrations/${item.image}.svg`} alt="" width={44} height={44} unoptimized />
                    ) : (
                      <span className="game-setup-word">{(item.text ?? item.label).slice(0, 2)}</span>
                    )}
                  </span>
                  <span className="game-setup-item-copy">
                    <span className="game-setup-item-label" lang={item.lang}>
                      {item.label}
                    </span>
                    {item.hint && <span className="game-setup-item-hint">{item.hint}</span>}
                  </span>
                  <span className={`game-setup-check ${isSelected ? "is-checked" : ""}`}>
                    {isSelected && <Check size={13} />}
                  </span>
                </button>
              );
            })}
          </div>
          {!enoughItems && (
            <p className="game-setup-warning" role="status">
              Scegli almeno {MIN_ITEMS} voci per cominciare.
            </p>
          )}
        </fieldset>
      )}

      <fieldset className="game-setup-fieldset">
        <legend>Quante domande?</legend>
        <div className="game-setup-choices">
          {lengthOptions.map((value) => (
            <button key={value} type="button" aria-pressed={effectiveRoundLength === value} onClick={() => changeLength(value)}>
              {value}
            </button>
          ))}
        </div>
        <p className="game-setup-note">Un passo alla volta, al tuo ritmo.</p>
      </fieldset>

      {limits && limits.length > 0 && (
        <fieldset className="game-setup-fieldset">
          <legend>Quanto grandi, questi numeri?</legend>
          <div className="game-setup-choices">
            {limits.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={limit === option.value}
                onClick={() => changeLimit(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="game-setup-note">Parti da 10, oppure fai un piccolo salto in avanti.</p>
        </fieldset>
      )}

      <button type="button" className="button button-primary game-setup-start" onClick={start} disabled={!enoughItems}>
        {startLabel} <ArrowRight size={18} />
      </button>
    </div>
  );
}
