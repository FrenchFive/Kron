import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = 'primary', children, className = '', ...props }: ButtonProps) {
  const base = 'font-serif font-medium text-[15px] rounded-[4px] transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed';

  const variants: Record<Variant, string> = {
    primary: `border-2 border-[var(--color-accent)] text-[var(--color-accent)] bg-transparent px-5 py-2.5 hover:bg-[var(--color-accent)] hover:text-[var(--color-bg)]`,
    secondary: `text-[var(--color-text-secondary)] hover:text-[var(--color-text)] bg-transparent border-none p-0`,
    danger: `text-[var(--color-danger)] hover:underline bg-transparent border-none p-0`,
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
