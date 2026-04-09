type Direction = 'BUY' | 'SELL' | 'HOLD';

interface CueBadgeProps {
  direction: Direction;
  size?: 'sm' | 'md' | 'lg';
}

const CueBadge = ({ direction, size = 'md' }: CueBadgeProps) => {
  const config = {
    BUY: { bg: 'bg-cc-green/10', text: 'text-cc-green', border: 'border-cc-green/30', icon: 'ri-arrow-up-line' },
    SELL: { bg: 'bg-cc-red/10', text: 'text-cc-red', border: 'border-cc-red/30', icon: 'ri-arrow-down-line' },
    HOLD: { bg: 'bg-cc-amber/10', text: 'text-cc-amber', border: 'border-cc-amber/30', icon: 'ri-pause-line' },
  };

  const sizeConfig = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  };

  const c = config[direction];

  return (
    <span className={`inline-flex items-center font-mono font-600 rounded border ${c.bg} ${c.text} ${c.border} ${sizeConfig[size]} whitespace-nowrap`}>
      <i className={`${c.icon} text-xs`} />
      {direction}
    </span>
  );
};

export default CueBadge;
