"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Stato condiviso di una partita per tutti e cinque i mondi.
 * Ogni mondo fornisce solo le proprie funzioni `createRound` e `recordAnswer`:
 * la logica di transizione (inizio, risposta, accumulo) resta identica ovunque.
 */
export function useRoundController<TRound, TStartArgs extends unknown[], TAnswerArgs extends unknown[]>(options: {
  create: (previous: TRound | undefined, ...args: TStartArgs) => TRound;
  record: (round: TRound, ...args: TAnswerArgs) => TRound;
}) {
  const [round, setRound] = useState<TRound | null>(null);
  const createRef = useRef(options.create);
  const recordRef = useRef(options.record);
  useEffect(() => {
    createRef.current = options.create;
    recordRef.current = options.record;
  });

  const start = useCallback((...args: TStartArgs) => {
    setRound((previous) => createRef.current(previous ?? undefined, ...args));
  }, []);

  const answer = useCallback((...args: TAnswerArgs) => {
    setRound((current) => (current ? recordRef.current(current, ...args) : current));
  }, []);

  return { round, start, answer };
}
