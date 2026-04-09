import type { Word } from '@/engine/wordSequence';
import { useSettingsStore } from '@/store/settingsStore';

interface WordDisplayProps {
  word: Word | null;
}

export function WordDisplay({ word }: WordDisplayProps) {
  const fontSize = useSettingsStore((s) => s.fontSize);
  const clampedFontSize = Math.max(28, Math.min(48, fontSize));

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
      {/* Thin vertical guide line at center */}
      <div
        className="absolute left-1/2 top-[10%] bottom-[10%] w-px -translate-x-1/2 bg-[var(--color-accent)] opacity-20"
      />
      {/*
        3-column grid: 1fr | auto | 1fr
        The ORP letter sits in the center column (auto-width),
        which is always at the exact center of the container.
        Before text right-aligns toward the ORP, after text left-aligns away.
      */}
      <div
        className="w-full font-serif font-bold tracking-[0.01em]"
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
        <span className="text-[var(--color-accent)] whitespace-nowrap">
          {orp}
        </span>
        <span className="text-[var(--color-text)] whitespace-nowrap text-left overflow-hidden">
          {after}
        </span>
      </div>
    </div>
  );
}
