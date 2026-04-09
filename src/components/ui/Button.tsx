import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full px-5 py-3 font-serif text-[15px] font-semibold transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  const variants: Record<Variant, string> = {
    primary: 'border border-[var(--color-accent)] bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent-subtle)] active:bg-[var(--color-accent-subtle)]',
    secondary: 'border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg)] active:bg-[var(--color-bg)]',
    danger: 'border border-[var(--color-border)] bg-transparent text-[var(--color-danger)] hover:bg-[var(--color-accent-subtle)] active:bg-[var(--color-accent-subtle)]',
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
