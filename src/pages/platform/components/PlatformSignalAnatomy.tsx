import { useState } from 'react';
import { signalLayers, sampleCueDetail } from '@/mocks/platformData';
import CueBadge from '@/pages/home/components/CueBadge';
import ConfidenceBar from '@/pages/home/components/ConfidenceBar';

const PlatformSignalAnatomy = () => {
  const [activeLayer, setActiveLayer] = useState(0);
  const layer = signalLayers[activeLayer];

  return (
    <section id="signal-anatomy" className="bg-[#080a0e] py-28">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
            <span className="text-xs text-cc-amber font-mono tracking-wider">SIGNAL ANATOMY</span>
          </div>
          <h2 className="font-grotesk text-4xl md:text-5xl font-700 text-white mb-4">
            What's inside<br /><span className="text-gradient-gold">every cue.</span>
          </h2>
          <p className="text-cc-text-dim text-lg max-w-2xl mx-auto">
            A CueCore signal isn't a price alert. It's a fully reasoned trade thesis — built from four distinct intelligence layers fused into a single confidence-weighted output.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Layer selector */}
          <div className="lg:w-80 flex flex-col gap-3">
            {signalLayers.map((l, i) => (
              <button
                key={l.id}
                onClick={() => setActiveLayer(i)}
                className="text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer"
                style={{
                  background: activeLayer === i ? 'rgba(245,158,11,0.08)' : '#0d1117',
                  borderColor: activeLayer === i ? 'rgba(245,158,11,0.35)' : '#1a2030',
                  borderLeftWidth: activeLayer === i ? '3px' : '1px',
                  borderLeftColor: activeLayer === i ? '#F59E0B' : '#1a2030',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 flex items-center justify-center">
                      <i className={`${l.icon} text-sm`} style={{ color: activeLayer === i ? '#F59E0B' : '#4E5A6B' }} />
                    </div>
                    <span className={`text-sm font-grotesk font-500 ${activeLayer === i ? 'text-white' : 'text-cc-text-dim'}`}>{l.label}</span>
                  </div>
                  <span className="text-xs font-mono text-cc-muted">{l.weight}%</span>
                </div>
                {/* Weight bar */}
                <div className="h-0.5 rounded-full bg-[#1a2030] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${l.weight}%`, background: activeLayer === i ? '#F59E0B' : '#2a3040' }}
                  />
                </div>
              </button>
            ))}

            {/* Total weight */}
            <div className="p-4 bg-[#0d1117] border border-[#1a2030] rounded-lg">
              <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">WEIGHT DISTRIBUTION</div>
              <div className="flex flex-col gap-2">
                {signalLayers.map((l, i) => (
                  <div key={l.id} className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-[#1a2030] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${l.weight}%`, background: i === activeLayer ? '#F59E0B' : '#2a3040' }}
                      />
                    </div>
                    <span className="text-xs font-mono text-cc-muted w-8 text-right">{l.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Center: Layer detail */}
          <div className="flex-1 bg-[#0d1117] border border-[#1a2030] rounded-lg p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 flex items-center justify-center bg-cc-amber/10 border border-cc-amber/20 rounded-lg">
                <i className={`${layer.icon} text-cc-amber text-xl`} />
              </div>
              <div>
                <h3 className="font-grotesk font-600 text-white text-lg mb-1">{layer.label}</h3>
                <p className="text-cc-text-dim text-sm leading-relaxed">{layer.description}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">INDICATORS IN THIS LAYER</div>
              <div className="flex flex-wrap gap-2">
                {layer.indicators.map((ind) => (
                  <span
                    key={ind}
                    className="text-xs px-3 py-1.5 rounded-full font-mono"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)', color: '#F59E0B' }}
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-[#080a0e] rounded-lg p-4">
              <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">SAMPLE CONTRIBUTION — CUE-7841 / NVDA</div>
              <div className="flex flex-col gap-2">
                {sampleCueDetail.reasoning.slice(0, 3).map((r, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: r.signal === 'Bullish' ? '#00D084' : r.signal === 'Bearish' ? '#FF4D4D' : '#4E5A6B' }} />
                    <span className="text-xs font-mono text-cc-text-dim w-28 flex-shrink-0">{r.factor}</span>
                    <div className="flex-1 h-1 rounded-full bg-[#1a2030] overflow-hidden">
                      <div className="h-full rounded-full bg-cc-amber" style={{ width: `${r.weight * 4}%` }} />
                    </div>
                    <span className="text-xs font-mono text-cc-muted w-8 text-right">{r.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Live cue card */}
          <div className="lg:w-72">
            <div className="bg-[#0d1117] border border-[#1a2030] rounded-lg overflow-hidden sticky top-24">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a2030]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
                  <span className="text-xs font-mono text-cc-muted">LIVE CUE</span>
                </div>
                <span className="text-xs font-mono text-cc-muted">{sampleCueDetail.id}</span>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xl font-grotesk font-700 text-white">{sampleCueDetail.asset}</div>
                    <div className="text-xs text-cc-muted mt-0.5">{sampleCueDetail.sector}</div>
                  </div>
                  <CueBadge direction={sampleCueDetail.direction} size="lg" />
                </div>

                <div className="mb-4">
                  <div className="text-xs text-cc-muted mb-1.5">AI Confidence</div>
                  <ConfidenceBar value={sampleCueDetail.confidence} />
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: 'Entry', value: sampleCueDetail.entry.toFixed(2), color: 'text-white' },
                    { label: 'Target', value: sampleCueDetail.target.toFixed(2), color: 'text-cc-green' },
                    { label: 'Stop', value: sampleCueDetail.stopLoss.toFixed(2), color: 'text-cc-red' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#080a0e] rounded-md p-2.5">
                      <div className="text-xs text-cc-muted mb-1">{item.label}</div>
                      <div className={`text-xs font-mono number-font ${item.color}`}>{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between bg-[#080a0e] rounded-md px-3 py-2.5 mb-4">
                  <div className="flex items-center gap-1.5">
                    <i className="ri-scales-3-line text-cc-amber text-xs" />
                    <span className="text-xs text-cc-muted">R/R Ratio</span>
                  </div>
                  <span className="text-sm font-mono font-600 text-cc-amber number-font">1 : {sampleCueDetail.riskReward}</span>
                </div>

                {/* Reasoning */}
                <div>
                  <div className="text-xs font-mono text-cc-muted tracking-wider mb-2">REASONING</div>
                  <div className="flex flex-col gap-1.5">
                    {sampleCueDetail.reasoning.map((r, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: r.signal === 'Bullish' ? '#00D084' : r.signal === 'Bearish' ? '#FF4D4D' : '#4E5A6B' }} />
                        <span className="text-xs text-cc-text-dim">{r.factor}</span>
                        <span className="text-xs font-mono ml-auto" style={{ color: r.signal === 'Bullish' ? '#00D084' : r.signal === 'Bearish' ? '#FF4D4D' : '#4E5A6B' }}>{r.signal}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 border-t border-[#1a2030] flex items-center justify-between">
                <span className="text-xs font-mono text-cc-muted">{sampleCueDetail.generatedAt}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono badge-open">{sampleCueDetail.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlatformSignalAnatomy;
