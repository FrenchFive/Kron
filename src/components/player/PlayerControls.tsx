import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

interface PlayerControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onBack20: () => void;
  onForward20: () => void;
}

export function PlayerControls({
  isPlaying,
  onTogglePlay,
  onBack20,
  onForward20,
}: PlayerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <IconButton label="Back 20 words" onClick={onBack20} className="h-12 w-12">
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
      <IconButton label="Forward 20 words" onClick={onForward20} className="h-12 w-12">
        <ChevronRight size={22} strokeWidth={1.5} />
      </IconButton>
    </div>
  );
}
