interface MinecraftCardProps {
  children: React.ReactNode;
  className?: string;
  highlighted?: boolean;
}

export function MinecraftCard({ children, className = '', highlighted = false }: MinecraftCardProps) {
  return (
    <div className={`mc-card ${highlighted ? 'pricing-card-highlighted' : ''} ${className}`}>
      {children}
    </div>
  );
}
