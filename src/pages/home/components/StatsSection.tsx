
export function StatsSection() {
  const stats = [
    {
      number: '200+',
      label: 'Cryptocurrencies',
      description: 'Available for trading'
    },
    {
      number: '30 Million+',
      label: 'Registered Users',
      description: 'Worldwide community'
    },
    {
      number: '700+',
      label: 'Trading Pairs',
      description: 'Multiple options'
    },
    {
      number: '$1.2 Billion',
      label: 'Daily Volume',
      description: 'High liquidity'
    }
  ];

  return (
    <section className="bg-gray-900 py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">
                {stat.number}
              </div>
              <div className="text-green-400 font-semibold mb-1">
                {stat.label}
              </div>
              <div className="text-gray-400 text-sm">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
