export function audioFilename(text: string) {
  const ascii = text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const slug = ascii
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${slug || "audio"}.mp3`;
}

export function audioPath(text: string) {
  return `/audio/italian/${audioFilename(text)}`;
}
