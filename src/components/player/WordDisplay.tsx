import type { Word } from '@/engine/wordSequence';
import { useSettingsStore } from '@/store/settingsStore';

interface WordDisplayProps {
  word: Word | null;
}

export function WordDisplay({ word }: WordDisplayProps) {
  const fontSize = useSettingsStore((s) => s.fontSize);

  if (!word) {
    return (
      <div className="flex items-center justify-center h-full">
        <span
          className="font-serif font-bold tracking-[0.02em] text-[var(--color-text-secondary)]"
          style={{ fontSize: `${fontSize}px` }}
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
    <div className="flex items-center justify-center h-full">
      <span
        className="font-serif font-bold tracking-[0.02em] text-[var(--color-text)] whitespace-nowrap"
        style={{ fontSize: `${fontSize}px` }}
      >
        {before}
        <span className="text-[var(--color-accent)]">{orp}</span>
        {after}
      </span>
    </div>
  );
}
