interface ConfidenceBarProps {
  value: number;
}

const ConfidenceBar = ({ value }: ConfidenceBarProps) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${value}%`, backgroundColor: '#F59E0B' }}
      />
    </div>
    <span className="text-xs number-font font-600 text-cc-amber">
      {value}%
    </span>
  </div>
);

export default ConfidenceBar;
