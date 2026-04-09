export const liveCues = [
  { id: '1', asset: 'BTC/USD', direction: 'BUY' as const, confidence: 91, timeframe: '4H', entry: 68420, target: 74800, stopLoss: 65900, riskReward: 2.4, change: '+3.2%', sector: 'Crypto' },
  { id: '2', asset: 'NVDA', direction: 'BUY' as const, confidence: 87, timeframe: '1D', entry: 892.40, target: 960.00, stopLoss: 858.00, riskReward: 1.97, change: '+1.8%', sector: 'Equity' },
  { id: '3', asset: 'EUR/USD', direction: 'SELL' as const, confidence: 83, timeframe: '1H', entry: 1.0842, target: 1.0760, stopLoss: 1.0890, riskReward: 1.71, change: '-0.4%', sector: 'Forex' },
  { id: '4', asset: 'GOLD', direction: 'HOLD' as const, confidence: 72, timeframe: '1D', entry: 2318.50, target: 2380.00, stopLoss: 2280.00, riskReward: 1.60, change: '+0.2%', sector: 'Commodity' },
  { id: '5', asset: 'ETH/USD', direction: 'BUY' as const, confidence: 88, timeframe: '4H', entry: 3240, target: 3680, stopLoss: 3050, riskReward: 2.32, change: '+4.1%', sector: 'Crypto' },
  { id: '6', asset: 'TSLA', direction: 'SELL' as const, confidence: 79, timeframe: '1D', entry: 178.20, target: 162.00, stopLoss: 186.00, riskReward: 2.08, change: '-2.1%', sector: 'Equity' },
];

export const stats = [
  { label: 'Cues Generated', value: '2.4M+', sub: 'Since inception' },
  { label: 'Avg Confidence Score', value: '84.7%', sub: 'Across all signals' },
  { label: 'Win Rate (90d)', value: '73.2%', sub: 'Verified outcomes' },
  { label: 'Assets Covered', value: '1,800+', sub: 'Equities, Crypto, Forex, Commodities' },
];

export const features = [
  {
    icon: 'ri-brain-line',
    title: 'Multi-Factor AI Engine',
    description: 'Synthesizes 40+ technical indicators, order flow, sentiment signals, and macro context into a single confidence-weighted cue.',
  },
  {
    icon: 'ri-pulse-line',
    title: 'Real-Time Signal Feed',
    description: 'Sub-second cue generation across 1,800+ instruments. Every cue includes entry, target, stop-loss, and R/R ratio.',
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Risk-Reward Logic',
    description: 'Every cue is filtered through a proprietary R/R engine. Low-quality setups are suppressed before they reach your feed.',
  },
  {
    icon: 'ri-bar-chart-grouped-line',
    title: 'Sentiment Intelligence',
    description: 'NLP-driven analysis of news, earnings calls, social flow, and options positioning — fused into each cue\'s confidence score.',
  },
  {
    icon: 'ri-time-line',
    title: 'Multi-Timeframe Analysis',
    description: 'Cues are generated across 1H, 4H, 1D, and 1W timeframes with confluence scoring to identify high-probability setups.',
  },
  {
    icon: 'ri-database-2-line',
    title: 'Institutional Data Depth',
    description: 'Powered by Level 2 order book data, dark pool prints, and institutional flow — the same data desks pay millions for.',
  },
];

export const howItWorks = [
  {
    step: '01',
    title: 'Data Ingestion',
    description: 'CueCore ingests real-time price action, volume, order book depth, news feeds, and social sentiment across all covered instruments.',
  },
  {
    step: '02',
    title: 'AI Analysis',
    description: 'Our multi-layer model evaluates 40+ indicators simultaneously, detecting pattern confluence, momentum shifts, and anomalous volume.',
  },
  {
    step: '03',
    title: 'Cue Generation',
    description: 'When conditions meet our confidence threshold, a structured cue is generated with direction, entry, target, stop-loss, and R/R.',
  },
  {
    step: '04',
    title: 'Delivery & Tracking',
    description: 'Cues are delivered to your dashboard in real-time. Outcomes are tracked and fed back into the model for continuous improvement.',
  },
];

export const pricingPlans = [
  {
    name: 'Analyst',
    price: '$149',
    period: '/mo',
    description: 'For individual traders who need institutional-grade signals.',
    features: [
      '500 cues/month',
      '1H & 4H timeframes',
      'Equities & Crypto',
      'Confidence scoring',
      'Email delivery',
      'Basic analytics',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Desk',
    price: '$499',
    period: '/mo',
    description: 'For professional traders and small trading desks.',
    features: [
      'Unlimited cues',
      'All timeframes (1H–1W)',
      'All asset classes',
      'Full R/R breakdown',
      'API access',
      'Advanced analytics',
      'Slack & webhook alerts',
      'Priority support',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    name: 'Institutional',
    price: 'Custom',
    period: '',
    description: 'For hedge funds, prop desks, and enterprise teams.',
    features: [
      'Everything in Desk',
      'Dedicated model tuning',
      'Custom asset coverage',
      'Co-location data feeds',
      'SLA guarantees',
      'Dedicated account team',
      'White-label options',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

export const testimonials = [
  {
    name: 'Marcus Chen',
    role: 'Head of Quantitative Strategy',
    firm: 'Meridian Capital',
    quote: 'CueCore replaced three separate data subscriptions. The confidence scoring alone has improved our signal-to-noise ratio by 60%. It\'s become core infrastructure.',
    avatar: 'MC',
  },
  {
    name: 'Sarah Okonkwo',
    role: 'Senior Portfolio Manager',
    firm: 'Vantage Asset Management',
    quote: 'The R/R filtering is what sets it apart. We\'re not drowning in low-quality setups anymore. Every cue that hits our desk is worth evaluating.',
    avatar: 'SO',
  },
  {
    name: 'James Whitfield',
    role: 'Proprietary Trader',
    firm: 'Independent',
    quote: 'I\'ve used Bloomberg, Refinitiv, and a dozen signal services. CueCore is the first one that actually thinks like a trader. The multi-timeframe confluence is exceptional.',
    avatar: 'JW',
  },
];

export const tickerData = [
  { asset: 'BTC/USD', price: '68,420', change: '+3.24%', up: true },
  { asset: 'ETH/USD', price: '3,241', change: '+4.12%', up: true },
  { asset: 'NVDA', price: '892.40', change: '+1.83%', up: true },
  { asset: 'EUR/USD', price: '1.0842', change: '-0.41%', up: false },
  { asset: 'GOLD', price: '2,318', change: '+0.22%', up: true },
  { asset: 'TSLA', price: '178.20', change: '-2.14%', up: false },
  { asset: 'SPX', price: '5,204', change: '+0.67%', up: true },
  { asset: 'SOL/USD', price: '168.40', change: '+5.31%', up: true },
  { asset: 'AAPL', price: '189.30', change: '+0.94%', up: true },
  { asset: 'USD/JPY', price: '151.82', change: '-0.18%', up: false },
];
