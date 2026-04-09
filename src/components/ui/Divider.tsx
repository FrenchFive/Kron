export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`m-0 border-0 border-t border-[var(--color-border)]/80 ${className}`} />;
}
