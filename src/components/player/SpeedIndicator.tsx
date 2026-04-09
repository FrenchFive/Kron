import { Minus, Plus } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

interface SpeedIndicatorProps {
  wpm: number;
  onAdjust: (delta: number) => void;
}

export function SpeedIndicator({ wpm, onAdjust }: SpeedIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-4">
      <IconButton label="Decrease speed" onClick={() => onAdjust(-10)}>
        <Minus size={18} strokeWidth={1.5} />
      </IconButton>
      <span className="font-serif font-bold text-[16px] text-[var(--color-text)] min-w-[60px] text-center">
        {wpm}
      </span>
      <IconButton label="Increase speed" onClick={() => onAdjust(10)}>
        <Plus size={18} strokeWidth={1.5} />
      </IconButton>
    </div>
  );
}
