"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type SoundContextValue = {
  sound: boolean;
  toggleSound: () => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [sound, setSound] = useState(true);
  const toggleSound = useCallback(() => setSound((current) => !current), []);
  const value = useMemo(() => ({ sound, toggleSound }), [sound, toggleSound]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound(): SoundContextValue {
  const context = useContext(SoundContext);
  if (!context) throw new Error("I componenti audio richiedono SoundProvider");
  return context;
}
