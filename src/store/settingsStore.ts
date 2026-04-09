import { create } from 'zustand';
import {
  DEFAULT_WPM,
  DEFAULT_FONT_SIZE,
  DEFAULT_PUNCTUATION_MULTIPLIER,
  DEFAULT_COMMA_MULTIPLIER,
  DEFAULT_PARAGRAPH_MULTIPLIER,
} from '@/utils/constants';
import { syncStatusBarWithTheme } from '@/utils/native';

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
  theme: getStored<Theme>('kron-theme', 'system'),
  defaultWpm: getStored('kron-default-wpm', DEFAULT_WPM),
  fontSize: getStored('kron-font-size', DEFAULT_FONT_SIZE),
  punctuationMultiplier: getStored('kron-punctuation-multiplier', DEFAULT_PUNCTUATION_MULTIPLIER),
  commaMultiplier: getStored('kron-comma-multiplier', DEFAULT_COMMA_MULTIPLIER),
  paragraphMultiplier: getStored('kron-paragraph-multiplier', DEFAULT_PARAGRAPH_MULTIPLIER),
  lastDocumentId: getStored('kron-last-document-id', null),

  setTheme: (theme) => {
    setStored('kron-theme', theme);
    // Apply theme class
    const html = document.documentElement;
    html.classList.remove('dark');
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      html.classList.add('dark');
    }
    // Sync system bar color with app background
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', isDark ? '#111111' : '#FFFFFF');
    syncStatusBarWithTheme();
    set({ theme });
  },

  setDefaultWpm: (defaultWpm) => {
    setStored('kron-default-wpm', defaultWpm);
    set({ defaultWpm });
  },

  setFontSize: (fontSize) => {
    setStored('kron-font-size', fontSize);
    set({ fontSize });
  },

  setPunctuationMultiplier: (punctuationMultiplier) => {
    setStored('kron-punctuation-multiplier', punctuationMultiplier);
    set({ punctuationMultiplier });
  },

  setCommaMultiplier: (commaMultiplier) => {
    setStored('kron-comma-multiplier', commaMultiplier);
    set({ commaMultiplier });
  },

  setParagraphMultiplier: (paragraphMultiplier) => {
    setStored('kron-paragraph-multiplier', paragraphMultiplier);
    set({ paragraphMultiplier });
  },

  setLastDocumentId: (lastDocumentId) => {
    setStored('kron-last-document-id', lastDocumentId);
    set({ lastDocumentId });
  },
}));
