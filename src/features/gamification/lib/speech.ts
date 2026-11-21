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

export function speakWithDeviceVoice(text: string, options: SpeechOptions = {}): void {
  const {
    rate = 0.9,
    lang,
    voicePrefix,
    unavailableMessage = "Audio non disponibile in questo browser. Puoi continuare con il testo scritto.",
    errorMessage = "La voce del dispositivo non risponde. Puoi continuare con il testo scritto.",
    onError,
  } = options;

  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onError?.(unavailableMessage);
    return;
  }

  const speechLang = lang ?? "it-IT";
  const prefix = voicePrefix ?? speechLang.split("-")[0].toLowerCase();
  stopSpeech();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLang;
  utterance.rate = rate;
  const voice = window.speechSynthesis.getVoices().find((entry) => entry.lang.toLowerCase().startsWith(prefix));
  if (voice) utterance.voice = voice;
  utterance.onerror = (event) => {
    if (event.error !== "interrupted" && event.error !== "canceled") onError?.(errorMessage);
  };
  window.speechSynthesis.speak(utterance);
}

export function speakItalian(text: string, options: SpeechOptions = {}): void {
  speakWithDeviceVoice(text, { lang: "it-IT", voicePrefix: "it", ...options });
}
