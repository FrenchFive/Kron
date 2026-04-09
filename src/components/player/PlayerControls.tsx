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
      <IconButton label="Rewind paragraph" onClick={onRewindParagraph}>
        <ChevronsLeft size={22} strokeWidth={1.5} />
      </IconButton>
      <IconButton label="Rewind sentence" onClick={onRewindSentence}>
        <ChevronLeft size={22} strokeWidth={1.5} />
      </IconButton>
      <IconButton
        label={isPlaying ? 'Pause' : 'Play'}
        onClick={onTogglePlay}
        className="!p-3"
      >
        {isPlaying ? (
          <Pause size={28} strokeWidth={1.5} />
        ) : (
          <Play size={28} strokeWidth={1.5} />
        )}
      </IconButton>
      <IconButton label="Skip sentence" onClick={onSkipSentence}>
        <ChevronRight size={22} strokeWidth={1.5} />
      </IconButton>
      <IconButton label="Skip paragraph" onClick={onSkipParagraph}>
        <ChevronsRight size={22} strokeWidth={1.5} />
      </IconButton>
    </div>
  );
}
