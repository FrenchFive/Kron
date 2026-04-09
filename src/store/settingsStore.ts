import { create } from 'zustand';
import {
  DEFAULT_WPM,
  DEFAULT_FONT_SIZE,
  DEFAULT_PUNCTUATION_MULTIPLIER,
  DEFAULT_COMMA_MULTIPLIER,
  DEFAULT_PARAGRAPH_MULTIPLIER,
} from '@/utils/constants';

type Theme = 'light' | 'dark' | 'system';

interface SettingsState {
  theme: Theme;
  defaultWpm: number;
  fontSize: number;
  punctuationMultiplier: number;
  commaMultiplier: number;
  paragraphMultiplier: number;
  lastDocumentId: string | null;

  setTheme: (theme: Theme) => void;
  setDefaultWpm: (wpm: number) => void;
  setFontSize: (size: number) => void;
  setPunctuationMultiplier: (m: number) => void;
  setCommaMultiplier: (m: number) => void;
  setParagraphMultiplier: (m: number) => void;
  setLastDocumentId: (id: string | null) => void;
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    return JSON.parse(val) as T;
  } catch {
    return fallback;
  }
}

function setStored(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export const useSettingsStore = create<SettingsState>((set) => ({
  theme: getStored<Theme>('readfast-theme', 'system'),
  defaultWpm: getStored('readfast-default-wpm', DEFAULT_WPM),
  fontSize: getStored('readfast-font-size', DEFAULT_FONT_SIZE),
  punctuationMultiplier: getStored('readfast-punctuation-multiplier', DEFAULT_PUNCTUATION_MULTIPLIER),
  commaMultiplier: getStored('readfast-comma-multiplier', DEFAULT_COMMA_MULTIPLIER),
  paragraphMultiplier: getStored('readfast-paragraph-multiplier', DEFAULT_PARAGRAPH_MULTIPLIER),
  lastDocumentId: getStored('readfast-last-document-id', null),

  setTheme: (theme) => {
    setStored('readfast-theme', theme);
    // Apply theme class
    const html = document.documentElement;
    html.classList.remove('dark');
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      html.classList.add('dark');
    }
    set({ theme });
  },

  setDefaultWpm: (defaultWpm) => {
    setStored('readfast-default-wpm', defaultWpm);
    set({ defaultWpm });
  },

  setFontSize: (fontSize) => {
    setStored('readfast-font-size', fontSize);
    set({ fontSize });
  },

  setPunctuationMultiplier: (punctuationMultiplier) => {
    setStored('readfast-punctuation-multiplier', punctuationMultiplier);
    set({ punctuationMultiplier });
  },

  setCommaMultiplier: (commaMultiplier) => {
    setStored('readfast-comma-multiplier', commaMultiplier);
    set({ commaMultiplier });
  },

  setParagraphMultiplier: (paragraphMultiplier) => {
    setStored('readfast-paragraph-multiplier', paragraphMultiplier);
    set({ paragraphMultiplier });
  },

  setLastDocumentId: (lastDocumentId) => {
    setStored('readfast-last-document-id', lastDocumentId);
    set({ lastDocumentId });
  },
}));
