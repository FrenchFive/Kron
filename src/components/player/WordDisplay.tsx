import type { Word } from '@/engine/wordSequence';
import { useSettingsStore } from '@/store/settingsStore';

interface WordDisplayProps {
  word: Word | null;
  landscape?: boolean;
}

export function WordDisplay({ word, landscape }: WordDisplayProps) {
  const fontSize = useSettingsStore((s) => s.fontSize);
  // In landscape, bump font size for better use of horizontal space
  const baseFontSize = landscape ? Math.min(fontSize + 8, 56) : fontSize;
  const clampedFontSize = Math.max(28, Math.min(56, baseFontSize));

  if (!word) {
    return (
      <div className="flex items-center justify-center h-full">
        <span
          className="font-serif font-bold tracking-[0.01em] text-[var(--color-text-secondary)]"
          style={{ fontSize: `${clampedFontSize}px` }}
        >
          &mdash;
        </span>
      </div>
    );
  }

  const { text, orpIndex } = word;
  const before = text.slice(0, orpIndex);
  const orp = text[orpIndex] ?? '';
  const after = text.slice(orpIndex + 1);

  return (
    <div className="relative flex items-center justify-center h-full">
      {/* Thin vertical guide line — focal alignment anchor */}
      <div
        className="absolute left-1/2 top-[10%] bottom-[10%] w-px -translate-x-1/2 bg-[var(--color-accent)] opacity-15"
      />
      {/*
        3-column grid: 1fr | auto | 1fr
        The ORP letter sits in the center column (auto-width),
        pinned to the exact horizontal center regardless of word length.
        Before text right-aligns toward the ORP, after text left-aligns away.
      */}
      <div
        key={word.index}
        className="w-full font-serif font-bold tracking-[0.01em] word-enter"
        style={{
          fontSize: `${clampedFontSize}px`,
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          alignItems: 'baseline',
        }}
      >
        <span className="text-[var(--color-text)] whitespace-nowrap text-right overflow-hidden">
          {before}
        </span>
        <span
          className="orp-letter whitespace-nowrap"
          style={{ fontSize: `${Math.round(clampedFontSize * 1.08)}px` }}
        >
          {orp}
        </span>
        <span className="text-[var(--color-text)] whitespace-nowrap text-left overflow-hidden">
          {after}
        </span>
      </div>
    </div>
  );
}
