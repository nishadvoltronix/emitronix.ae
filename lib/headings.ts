const minorWords = new Set([
  "a", "an", "and", "as", "at", "but", "by", "for", "in", "nor", "of", "on",
  "or", "per", "the", "to", "via", "vs", "with",
]);

/** Consistent English heading case without altering acronyms or Arabic copy. */
export function formatHeading(text: string): string {
  if (/[\u0600-\u06ff]/.test(text)) return text;

  const words = [...text.matchAll(/[A-Za-z][A-Za-z0-9]*(?:['’][A-Za-z]+)?/g)];
  let position = 0;
  return text.replace(/[A-Za-z][A-Za-z0-9]*(?:['’][A-Za-z]+)?/g, (word: string, offset: number) => {
    const index = position++;
    // Preserve DEWA, QA/QC, WhatsApp, iPhone and similar intentional spellings.
    const stem = word.replace(/['’]s$/i, "");
    if (stem.length > 1 && (stem === stem.toUpperCase() || /[a-z][A-Z]/.test(stem))) return word;

    const previousEnd = index ? words[index - 1].index! + words[index - 1][0].length : 0;
    const startsPhrase = /[:!?—–]/.test(text.slice(previousEnd, offset));
    const lower = word.toLowerCase();
    if (index > 0 && index < words.length - 1 && !startsPhrase && minorWords.has(lower)) return lower;
    return word.charAt(0).toUpperCase() + word.slice(1);
  });
}
