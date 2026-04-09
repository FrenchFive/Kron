export function calculateOrpIndex(word: string): number {
  // Count only letters to determine word length
  const letterCount = word.replace(/[^a-zA-Z]/g, '').length;

  // One-third mark: the eye's natural landing spot sits roughly 1/3
  // into the word, giving consistent focal alignment across lengths.
  const orpPosition = letterCount <= 1 ? 0 : Math.floor(letterCount / 3);

  // Adjust for leading non-letter characters (quotes, parentheses, etc.)
  let leadingNonLetters = 0;
  for (const char of word) {
    if (/[a-zA-Z]/.test(char)) break;
    leadingNonLetters++;
  }

  return orpPosition + leadingNonLetters;
}
