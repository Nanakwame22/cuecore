import { testimonials } from '@/mocks/landingData';

const LandingTestimonials = () => (
  <section className="bg-[#080a0e] py-24">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1 mb-6">
          <span className="text-xs text-cc-amber font-mono tracking-wider">TRUSTED BY PROFESSIONALS</span>
        </div>
        <h2 className="font-grotesk text-4xl font-700 text-white">What the desk is saying.</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <div key={i} className="bg-[#0d1117] border border-[#1a2030] rounded-lg p-6">
            <div className="flex mb-4 gap-0.5">
              {[...Array(5)].map((_, s) => <i key={s} className="ri-star-fill text-cc-amber text-xs" />)}
            </div>
            <p className="text-cc-text-dim text-sm leading-relaxed mb-6">"{t.quote}"</p>
            <div className="flex items-center gap-3 pt-4 border-t border-[#1a2030]">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-cc-amber/10 border border-cc-amber/20 text-cc-amber text-xs font-grotesk font-700 flex-shrink-0">{t.avatar}</div>
              <div>
                <div className="text-sm font-600 text-white">{t.name}</div>
                <div className="text-xs text-cc-muted">{t.role} · {t.firm}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingTestimonials;
