export const signalLayers = [
  {
    id: 'technical',
    label: 'Technical Analysis',
    icon: 'ri-line-chart-line',
    color: '#F59E0B',
    weight: 35,
    indicators: ['RSI Divergence', 'MACD Cross', 'Bollinger Squeeze', 'EMA Stack', 'Volume Profile', 'Fibonacci Retracement'],
    description: 'Pattern recognition across 18 technical indicators with multi-timeframe confluence scoring.',
  },
  {
    id: 'volume',
    label: 'Volume & Order Flow',
    icon: 'ri-bar-chart-2-line',
    color: '#00D084',
    weight: 25,
    indicators: ['Dark Pool Prints', 'Level 2 Depth', 'VWAP Deviation', 'Block Trade Detection', 'Cumulative Delta'],
    description: 'Institutional order flow analysis including dark pool activity and Level 2 book imbalances.',
  },
  {
    id: 'sentiment',
    label: 'Sentiment Intelligence',
    icon: 'ri-emotion-line',
    color: '#F59E0B',
    weight: 20,
    indicators: ['News NLP Score', 'Options Put/Call', 'Social Flow Index', 'Earnings Tone', 'Analyst Revision'],
    description: 'NLP-driven sentiment fusion from news, earnings calls, options positioning, and social signals.',
  },
  {
    id: 'macro',
    label: 'Macro Context',
    icon: 'ri-global-line',
    color: '#8A95A8',
    weight: 20,
    indicators: ['Sector Rotation', 'Correlation Matrix', 'VIX Regime', 'Fed Policy Bias', 'Currency Strength'],
    description: 'Macro regime detection that adjusts signal thresholds based on market-wide risk conditions.',
  },
];

export const dataSources = [
  { name: 'NYSE / NASDAQ', type: 'Exchange', icon: 'ri-stock-line', latency: '< 2ms' },
  { name: 'CME Group', type: 'Futures', icon: 'ri-funds-line', latency: '< 3ms' },
  { name: 'Binance / Coinbase', type: 'Crypto', icon: 'ri-bit-coin-line', latency: '< 5ms' },
  { name: 'Reuters Newswire', type: 'News', icon: 'ri-newspaper-line', latency: '< 50ms' },
  { name: 'Options Chain', type: 'Derivatives', icon: 'ri-scales-3-line', latency: '< 10ms' },
  { name: 'Dark Pool Feed', type: 'Institutional', icon: 'ri-eye-off-line', latency: '< 15ms' },
  { name: 'Social Sentiment', type: 'Alternative', icon: 'ri-chat-3-line', latency: '< 100ms' },
  { name: 'Macro Indicators', type: 'Economic', icon: 'ri-earth-line', latency: 'Daily' },
];

export const platformCapabilities = [
  {
    icon: 'ri-cpu-line',
    title: 'Proprietary AI Engine',
    description: 'A multi-layer neural architecture trained on 12 years of market data. Not a wrapper around a generic LLM — purpose-built for market microstructure.',
    metric: '40+ factors',
    metricLabel: 'per cue',
  },
  {
    icon: 'ri-timer-flash-line',
    title: 'Sub-Second Latency',
    description: 'From data ingestion to cue delivery in under 800ms. Co-located infrastructure at major exchange data centers ensures you\'re never behind the market.',
    metric: '< 800ms',
    metricLabel: 'end-to-end',
  },
  {
    icon: 'ri-shield-check-line',
    title: 'R/R Gating',
    description: 'Every cue must pass a minimum 1.5:1 risk-reward threshold before delivery. Low-quality setups are suppressed at the model level — not filtered by you.',
    metric: '1.5:1 min',
    metricLabel: 'R/R threshold',
  },
  {
    icon: 'ri-loop-right-line',
    title: 'Continuous Learning',
    description: 'Outcome tracking feeds directly back into the model. Every resolved cue — win or loss — improves the next generation of signals.',
    metric: '2.4M+',
    metricLabel: 'training outcomes',
  },
  {
    icon: 'ri-git-branch-line',
    title: 'Multi-Timeframe Confluence',
    description: 'Signals are validated across 1H, 4H, 1D, and 1W timeframes simultaneously. Only setups with cross-timeframe alignment reach your feed.',
    metric: '4 timeframes',
    metricLabel: 'confluence check',
  },
  {
    icon: 'ri-code-line',
    title: 'Full API Access',
    description: 'REST and WebSocket APIs for programmatic access. Integrate CueCore signals directly into your execution system, risk engine, or portfolio management platform.',
    metric: '99.97%',
    metricLabel: 'uptime SLA',
  },
];

export const sampleCueDetail = {
  id: 'CUE-7841',
  asset: 'NVDA',
  sector: 'Equity · Technology',
  direction: 'BUY' as const,
  confidence: 91,
  timeframe: '4H',
  entry: 892.40,
  target: 960.00,
  stopLoss: 858.00,
  riskReward: 1.97,
  generatedAt: '14:32:07 UTC',
  status: 'OPEN',
  reasoning: [
    { factor: 'RSI Divergence', signal: 'Bullish', weight: 18, detail: 'Positive divergence on 4H RSI with price making lower lows' },
    { factor: 'Volume Surge', signal: 'Bullish', weight: 22, detail: '3.2x average volume on last 3 candles — institutional accumulation pattern' },
    { factor: 'MACD Cross', signal: 'Bullish', weight: 15, detail: 'Bullish MACD crossover confirmed on 4H with histogram expansion' },
    { factor: 'Dark Pool', signal: 'Bullish', weight: 24, detail: '$142M dark pool print at $889 — significant institutional interest' },
    { factor: 'Sentiment NLP', signal: 'Neutral', weight: 12, detail: 'Earnings tone slightly positive; analyst revision cycle turning' },
  ],
};

export const integrations = [
  { name: 'Interactive Brokers', icon: 'ri-bank-line', category: 'Broker' },
  { name: 'TD Ameritrade', icon: 'ri-building-line', category: 'Broker' },
  { name: 'Alpaca', icon: 'ri-code-s-slash-line', category: 'API Broker' },
  { name: 'Slack', icon: 'ri-slack-line', category: 'Alerts' },
  { name: 'Telegram', icon: 'ri-telegram-line', category: 'Alerts' },
  { name: 'Webhook', icon: 'ri-webhook-line', category: 'Custom' },
  { name: 'REST API', icon: 'ri-code-line', category: 'Developer' },
  { name: 'WebSocket', icon: 'ri-wifi-line', category: 'Developer' },
];

export const performanceMetrics = [
  { label: 'Win Rate (90d)', value: '73.2%', change: '+2.1%', up: true },
  { label: 'Avg R/R Delivered', value: '2.14x', change: '+0.3x', up: true },
  { label: 'Avg Confidence', value: '84.7%', change: '+1.4%', up: true },
  { label: 'False Positive Rate', value: '4.8%', change: '-0.6%', up: true },
  { label: 'Cues / Day', value: '1,240', change: '+180', up: true },
  { label: 'Avg Latency', value: '620ms', change: '-40ms', up: true },
];
