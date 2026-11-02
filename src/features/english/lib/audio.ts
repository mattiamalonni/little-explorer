export function audioFilename(text: string) {
  return `${text.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.mp3`;
}

export function wordAudioPath(text: string) {
  return `/audio/english/${audioFilename(text)}`;
}
