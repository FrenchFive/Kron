export interface PauseSettings {
  punctuationMultiplier: number;
  commaMultiplier: number;
  paragraphMultiplier: number;
}

export function calculatePauseMultiplier(
  word: string,
  isLastInParagraph: boolean,
  settings: PauseSettings
): number {
  if (isLastInParagraph) return settings.paragraphMultiplier;

  const lastChar = word.slice(-1);
  if (['.', '!', '?'].includes(lastChar)) return settings.punctuationMultiplier;
  if ([',', ';', ':'].includes(lastChar)) return settings.commaMultiplier;
  if (['—', '–', '\u2026'].some(p => word.endsWith(p)) || word.endsWith('...')) {
    return settings.commaMultiplier;
  }

  return 1.0;
}
