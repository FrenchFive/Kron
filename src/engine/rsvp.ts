import type { PositionMap } from './wordSequence';

export function calculateDisplayDuration(wpm: number, pauseMultiplier: number): number {
  const baseMs = 60_000 / wpm;
  return baseMs * pauseMultiplier;
}

export function findPreviousStart(indices: number[], currentIndex: number): number {
  // Find the largest start index that is strictly less than currentIndex
  for (let i = indices.length - 1; i >= 0; i--) {
    if (indices[i] < currentIndex) {
      return indices[i];
    }
  }
  return 0;
}

export function findCurrentStart(indices: number[], currentIndex: number): number {
  // Find the largest start index that is <= currentIndex
  for (let i = indices.length - 1; i >= 0; i--) {
    if (indices[i] <= currentIndex) {
      return indices[i];
    }
  }
  return 0;
}

export function findNextStart(indices: number[], currentIndex: number): number | null {
  // Find the smallest start index that is > currentIndex
  for (const idx of indices) {
    if (idx > currentIndex) {
      return idx;
    }
  }
  return null;
}

export function rewindSentence(posMap: PositionMap, currentIndex: number): number {
  const currentStart = findCurrentStart(posMap.sentenceStartIndices, currentIndex);
  if (currentIndex === currentStart) {
    return findPreviousStart(posMap.sentenceStartIndices, currentIndex);
  }
  return currentStart;
}

export function rewindParagraph(posMap: PositionMap, currentIndex: number): number {
  const currentStart = findCurrentStart(posMap.paragraphStartIndices, currentIndex);
  if (currentIndex === currentStart) {
    return findPreviousStart(posMap.paragraphStartIndices, currentIndex);
  }
  return currentStart;
}

export function skipSentence(posMap: PositionMap, currentIndex: number, totalWords: number): number {
  return findNextStart(posMap.sentenceStartIndices, currentIndex) ?? totalWords - 1;
}

export function skipParagraph(posMap: PositionMap, currentIndex: number, totalWords: number): number {
  return findNextStart(posMap.paragraphStartIndices, currentIndex) ?? totalWords - 1;
}
