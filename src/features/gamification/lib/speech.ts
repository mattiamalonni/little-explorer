/** Helper condiviso per la sintesi vocale: un solo punto per guard, selezione voce e errori. */

export function stopSpeech(): void {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

export type SpeechOptions = {
  rate?: number;
  lang?: string;
  voicePrefix?: string;
  unavailableMessage?: string;
  errorMessage?: string;
  onError?: (message: string) => void;
};

export function speakItalian(text: string, options: SpeechOptions = {}): void {
  const {
    rate = 0.9,
    lang = "it-IT",
    voicePrefix = "it",
    unavailableMessage = "Audio non disponibile in questo browser. Puoi continuare con il testo scritto.",
    errorMessage = "La voce del dispositivo non risponde. Puoi continuare con il testo scritto.",
    onError,
  } = options;

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError?.(unavailableMessage);
    return;
  }

  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((entry) => entry.lang.toLowerCase().startsWith(voicePrefix));
  if (voice) utterance.voice = voice;
  utterance.onerror = (event) => {
    if (event.error !== "interrupted" && event.error !== "canceled") onError?.(errorMessage);
  };
  window.speechSynthesis.speak(utterance);
}
