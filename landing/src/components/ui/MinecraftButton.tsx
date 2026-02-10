import Link from 'next/link';

type ButtonVariant = 'orange' | 'green' | 'blue' | 'red' | 'outline';

interface MinecraftButtonProps {
  variant?: ButtonVariant;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
}

export function MinecraftButton({
  variant = 'orange',
  href,
  onClick,
  children,
  className = '',
  disabled = false,
  loading = false,
  type = 'button',
}: MinecraftButtonProps) {
  const classes = `mc-btn mc-btn-${variant} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`;

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {loading ? 'Loading...' : children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
