import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

const styles: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink/90',
  secondary: 'bg-transparent border border-ink text-ink hover:bg-ink hover:text-paper',
  ghost: 'bg-transparent text-ink hover:bg-ink/5',
};

export default function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={`rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none ${styles[variant]} ${className}`}
      {...props}
    />
  );
}
