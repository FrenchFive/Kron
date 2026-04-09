import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRewindSentence: () => void;
  onRewindParagraph: () => void;
  onSkipSentence: () => void;
  onSkipParagraph: () => void;
}

export function PlayerControls({
  isPlaying,
  onTogglePlay,
  onRewindSentence,
  onRewindParagraph,
  onSkipSentence,
  onSkipParagraph,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <IconButton label="Rewind paragraph" onClick={onRewindParagraph} className="h-12 w-12">
        <ChevronsLeft size={22} strokeWidth={1.5} />
      </IconButton>
      <IconButton label="Rewind sentence" onClick={onRewindSentence} className="h-12 w-12">
        <ChevronLeft size={22} strokeWidth={1.5} />
      </IconButton>
      <IconButton
        label={isPlaying ? 'Pause' : 'Play'}
        onClick={onTogglePlay}
        className="h-14 w-14 border-[var(--color-text)] bg-[var(--color-text)] text-[var(--color-bg)] hover:border-[var(--color-text)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)]"
      >
        {isPlaying ? (
          <Pause size={28} strokeWidth={1.5} />
        ) : (
          <Play size={28} strokeWidth={1.5} />
        )}
      </IconButton>
      <IconButton label="Skip sentence" onClick={onSkipSentence} className="h-12 w-12">
        <ChevronRight size={22} strokeWidth={1.5} />
      </IconButton>
      <IconButton label="Skip paragraph" onClick={onSkipParagraph} className="h-12 w-12">
        <ChevronsRight size={22} strokeWidth={1.5} />
      </IconButton>
    </div>
  );
}
