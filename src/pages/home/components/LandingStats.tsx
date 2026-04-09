import { stats } from '@/mocks/landingData';

const LandingStats = () => (
  <section className="bg-[#0d1117] border-y border-[#1a2030]">
    <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
      {stats.map((s, i) => (
        <div key={i} className="text-center">
          <div className="text-3xl md:text-4xl font-grotesk font-700 text-gradient-gold number-font mb-1">{s.value}</div>
          <div className="text-sm text-white font-500 mb-0.5">{s.label}</div>
          <div className="text-xs text-cc-muted">{s.sub}</div>
        </div>
      ))}
    </div>
  </section>
);

export default LandingStats;
