'use client';

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: () => void;
}

export function PricingToggle({ isYearly, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <span className={`font-pixel text-xs ${!isYearly ? 'text-mc-orange' : 'text-[var(--text-muted)]'}`}>
        Monthly
      </span>
      <button
        onClick={onToggle}
        className="relative w-14 h-7 rounded-none border-2 border-[var(--mc-gray)] transition-colors"
        style={{ background: isYearly ? 'var(--mc-green)' : 'var(--mc-gray-dark)' }}
      >
        <div
          className="absolute top-0.5 w-5 h-5 bg-white transition-transform"
          style={{ left: isYearly ? '28px' : '4px' }}
        />
      </button>
      <span className={`font-pixel text-xs ${isYearly ? 'text-mc-green' : 'text-[var(--text-muted)]'}`}>
        Yearly
        <span className="ml-2 text-mc-yellow text-[0.5rem]">Save 17%</span>
      </span>
    </div>
  );
}
