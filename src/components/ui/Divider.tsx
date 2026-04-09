export function Divider({ className = '' }: { className?: string }) {
  return <hr className={`border-0 border-t border-[var(--color-border)] m-0 ${className}`} />;
}
