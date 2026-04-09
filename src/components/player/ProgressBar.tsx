import { useRef, useCallback } from 'react';

interface ProgressBarProps {
  progress: number; // 0-1
  onSeek: (progress: number) => void;
}

export function ProgressBar({ progress, onSeek }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  const handleInteraction = useCallback((clientX: number) => {
    const bar = barRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(ratio);
  }, [onSeek]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    handleInteraction(e.clientX);

    const onMove = (ev: PointerEvent) => handleInteraction(ev.clientX);
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }, [handleInteraction]);

  const percentage = Math.max(0, Math.min(100, progress * 100));

  return (
    <div
      ref={barRef}
      className="relative flex h-6 w-full cursor-pointer touch-none items-center"
      onPointerDown={handlePointerDown}
    >
      <div className="absolute left-0 right-0 h-[4px] rounded-full bg-[var(--color-progress-track)]" />
      <div
        className="absolute left-0 h-[4px] rounded-full bg-[var(--color-accent)]"
        style={{ width: `${percentage}%` }}
      />
      <div
        className="absolute top-1/2 h-[12px] w-[12px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-bg)] bg-[var(--color-accent)]"
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
}
