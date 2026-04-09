import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  label: string;
}

export function IconButton({ children, label, className = '', ...props }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={`p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-150 cursor-pointer bg-transparent border-none ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
