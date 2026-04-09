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
    <div className="surface-card mx-5 max-w-[420px] p-5">
      <p className="font-serif text-[15px] text-[var(--color-text)] leading-relaxed">
        {contextWords.map((word) => (
          <span
            key={word.index}
            className={word.index === currentIndex ? 'font-bold text-[var(--color-text)]' : 'font-normal text-[var(--color-text-secondary)]'}
          >
            {word.text}{' '}
          </span>
        ))}
      </p>
    </div>
  );
}
