import type { Word } from '@/engine/wordSequence';
import { CONTEXT_PREVIEW_WORDS } from '@/utils/constants';

interface ContextPreviewProps {
  words: Word[];
  currentIndex: number;
}

export function ContextPreview({ words, currentIndex }: ContextPreviewProps) {
  const start = Math.max(0, currentIndex - CONTEXT_PREVIEW_WORDS);
  const end = Math.min(words.length, currentIndex + CONTEXT_PREVIEW_WORDS + 1);
  const contextWords = words.slice(start, end);

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-5 max-w-[400px]">
      <p className="font-serif text-[14px] text-[var(--color-text)] leading-relaxed">
        {contextWords.map((word) => (
          <span
            key={word.index}
            className={word.index === currentIndex ? 'font-bold' : 'font-normal'}
          >
            {word.text}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}
