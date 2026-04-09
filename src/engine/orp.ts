export function calculateOrpIndex(word: string): number {
  // Count only letters to determine word length
  const letterCount = word.replace(/[^a-zA-Z]/g, '').length;

  let orpPosition: number;
  if (letterCount <= 1) orpPosition = 0;
  else if (letterCount <= 3) orpPosition = 0;
  else if (letterCount <= 5) orpPosition = 1;
  else if (letterCount <= 9) orpPosition = 2;
  else if (letterCount <= 13) orpPosition = 3;
  else orpPosition = 4;

  // Adjust for leading non-letter characters (quotes, parentheses, etc.)
  let leadingNonLetters = 0;
  for (const char of word) {
    if (/[a-zA-Z]/.test(char)) break;
    leadingNonLetters++;
  }

  return orpPosition + leadingNonLetters;
}
