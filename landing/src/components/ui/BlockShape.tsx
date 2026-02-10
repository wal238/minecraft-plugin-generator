type BlockColor = 'orange' | 'green' | 'blue' | 'red' | 'yellow' | 'purple';

const colorMap: Record<BlockColor, { bg: string; shadow: string }> = {
  orange: { bg: '#FF6B35', shadow: '#CC5529' },
  green: { bg: '#4CAF50', shadow: '#388E3C' },
  blue: { bg: '#2196F3', shadow: '#1976D2' },
  red: { bg: '#F44336', shadow: '#C62828' },
  yellow: { bg: '#FFC107', shadow: '#F9A825' },
  purple: { bg: '#9C27B0', shadow: '#7B1FA2' },
};

interface BlockShapeProps {
  color: BlockColor;
  size?: number;
  icon?: string;
}

export function BlockShape({ color, size = 48, icon }: BlockShapeProps) {
  const { bg, shadow } = colorMap[color];
  return (
    <div
      style={{
        width: size,
        height: size,
        background: bg,
        boxShadow: `3px 3px 0 ${shadow}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size * 0.45,
      }}
    >
      {icon || ''}
    </div>
  );
}
