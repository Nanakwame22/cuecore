import { tickerData } from '@/mocks/landingData';

const TickerBar = () => {
  const doubled = [...tickerData, ...tickerData];

  return (
    <div
      className="w-full overflow-hidden h-9 flex items-center"
      style={{ backgroundColor: '#0A0C10', borderBottom: '1px solid rgba(245,158,11,0.15)' }}
    >
      <div className="flex items-center gap-0 ticker-scroll whitespace-nowrap">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-6" style={{ borderRight: '1px solid rgba(245,158,11,0.15)' }}>
            <span className="text-xs font-mono tracking-wider" style={{ color: '#F0F2F6' }}>{item.asset}</span>
            <span className="text-xs font-mono number-font text-white">{item.price}</span>
            <span className={`text-xs font-mono number-font ${item.up ? 'text-cc-green' : 'text-cc-red'}`}>
              {item.change}
            </span>
            <span style={{ color: 'rgba(245,158,11,0.40)', fontSize: '8px' }}>●</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TickerBar;
