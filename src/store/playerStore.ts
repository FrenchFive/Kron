import { create } from 'zustand';
import type { WordSequence, PositionMap } from '@/engine/wordSequence';
import { buildPositionMap, getAllWords } from '@/engine/wordSequence';
import type { Word } from '@/engine/wordSequence';
import {
  rewindSentence,
  rewindParagraph,
  skipSentence,
  skipParagraph,
} from '@/engine/rsvp';
import { DEFAULT_WPM } from '@/utils/constants';

interface PlayerState {
  isPlaying: boolean;
  currentIndex: number;
  wpm: number;
  mode: 'sprint';

  documentId: string | null;
  wordSequence: WordSequence | null;
  positionMap: PositionMap | null;
  wordArray: Word[];
  totalWords: number;

  play: () => void;
  pause: () => void;
  togglePlayPause: () => void;
  setWpm: (wpm: number) => void;
  adjustWpm: (delta: number) => void;
  seekTo: (index: number) => void;
  rewindSentence: () => void;
  rewindParagraph: () => void;
  skipSentence: () => void;
  skipParagraph: () => void;
  skipWords: (count: number) => void;
  loadDocument: (documentId: string, wordSequence: WordSequence, startPosition: number, wpm: number) => void;
  advanceWord: () => void;
  unload: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  isPlaying: false,
  currentIndex: 0,
  wpm: DEFAULT_WPM,
  mode: 'sprint',

  documentId: null,
  wordSequence: null,
  positionMap: null,
  wordArray: [],
  totalWords: 0,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlayPause: () => set((s) => ({ isPlaying: !s.isPlaying })),

  setWpm: (wpm) => set({ wpm: Math.max(100, Math.min(800, wpm)) }),
  adjustWpm: (delta) => {
    const { wpm } = get();
    const next = Math.max(100, Math.min(800, wpm + delta));
    set({ wpm: next });
  },

  seekTo: (index) => {
    const { totalWords } = get();
    set({ currentIndex: Math.max(0, Math.min(index, totalWords - 1)) });
  },

  rewindSentence: () => {
    const { positionMap, currentIndex } = get();
    if (!positionMap) return;
    set({ currentIndex: rewindSentence(positionMap, currentIndex) });
  },

  rewindParagraph: () => {
    const { positionMap, currentIndex } = get();
    if (!positionMap) return;
    set({ currentIndex: rewindParagraph(positionMap, currentIndex) });
  },

  skipSentence: () => {
    const { positionMap, currentIndex, totalWords } = get();
    if (!positionMap) return;
    set({ currentIndex: skipSentence(positionMap, currentIndex, totalWords) });
  },

  skipParagraph: () => {
    const { positionMap, currentIndex, totalWords } = get();
    if (!positionMap) return;
    set({ currentIndex: skipParagraph(positionMap, currentIndex, totalWords) });
  },

  skipWords: (count) => {
    const { currentIndex, totalWords } = get();
    const next = Math.max(0, Math.min(currentIndex + count, totalWords - 1));
    set({ currentIndex: next });
  },

  loadDocument: (documentId, wordSequence, startPosition, wpm) => {
    const positionMap = buildPositionMap(wordSequence);
    const wordArray = getAllWords(wordSequence);
    set({
      documentId,
      wordSequence,
      positionMap,
      wordArray,
      totalWords: wordSequence.totalWords,
      currentIndex: startPosition,
      wpm,
      isPlaying: false,
    });
  },

  advanceWord: () => {
    const { currentIndex, totalWords } = get();
    if (currentIndex >= totalWords - 1) {
      set({ isPlaying: false });
      return;
    }
    set({ currentIndex: currentIndex + 1 });
  },

  unload: () => {
    set({
      isPlaying: false,
      currentIndex: 0,
      documentId: null,
      wordSequence: null,
      positionMap: null,
      wordArray: [],
      totalWords: 0,
    });
  },
}));
