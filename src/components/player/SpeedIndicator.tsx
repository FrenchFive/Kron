import { Minus, Plus } from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';

interface SpeedIndicatorProps {
  wpm: number;
  onAdjust: (delta: number) => void;
}

export function SpeedIndicator({ wpm, onAdjust }: SpeedIndicatorProps) {
  return (
    <div className="surface-card-flat flex items-center justify-center gap-5 rounded-full px-3 py-2">
      <IconButton label="Decrease speed" onClick={() => onAdjust(-10)}>
        <Minus size={18} strokeWidth={1.5} />
      </IconButton>
      <div className="min-w-[72px] text-center">
        <p className="font-serif text-[17px] font-medium text-[var(--color-text)]">{wpm}</p>
        <p className="tiny-meta">wpm</p>
      </div>
      <IconButton label="Increase speed" onClick={() => onAdjust(10)}>
        <Plus size={18} strokeWidth={1.5} />
      </IconButton>
    </div>
  );
}
