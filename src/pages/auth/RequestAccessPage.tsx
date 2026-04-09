import { useState } from 'react';

const RequestAccessPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const textarea = form.querySelector('textarea[name="use_case"]') as HTMLTextAreaElement;
    if (textarea && textarea.value.length > 500) return;

    setLoading(true);
    const data = new FormData(form);
    const body = new URLSearchParams();
    data.forEach((value, key) => {
      if (typeof value === 'string') body.append(key, value);
    });

    try {
      await fetch('https://readdy.ai/api/form/d7asd9lfnvpdiguspu60', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080a0e] flex flex-col">
      {/* Top bar */}
      <div className="h-14 flex items-center px-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <a href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-6 h-6 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-cc-amber rotate-45 relative">
              <div className="absolute inset-0.5 bg-cc-amber/30" />
            </div>
          </div>
          <span className="font-grotesk font-700 text-white text-base tracking-tight">
            Cue<span className="text-cc-amber">Core</span>
          </span>
        </a>
        <div className="ml-auto flex items-center gap-2 text-xs text-cc-muted">
          Already have an account?
          <a href="/signin" className="text-cc-amber hover:text-cc-amber-light transition-colors cursor-pointer">Sign in</a>
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-6 py-16">
        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: copy */}
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 bg-cc-amber/10 border border-cc-amber/20 rounded-full px-3 py-1.5 mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-cc-green pulse-dot" />
                <span className="text-xs text-cc-amber font-mono tracking-wider">EARLY ACCESS OPEN</span>
              </div>
              <h1 className="font-grotesk text-4xl font-700 text-white leading-tight mb-4">
                Request access to<br /><span className="text-gradient-gold">CueCore</span>
              </h1>
              <p className="text-cc-text-dim leading-relaxed mb-8">
                CueCore is currently in early access. We're onboarding professional traders, prop desks, and institutional teams. Fill out the form and we'll be in touch within 24 hours.
              </p>

              <div className="space-y-5 mb-10">
                {[
                  { icon: 'ri-time-line', title: '14-day free trial', desc: 'Full Desk plan access, no credit card required.' },
                  { icon: 'ri-customer-service-line', title: 'Dedicated onboarding', desc: 'A CueCore specialist will walk you through the platform.' },
                  { icon: 'ri-shield-check-line', title: 'SOC 2 Type II compliant', desc: 'Enterprise-grade security and data privacy.' },
                  { icon: 'ri-close-circle-line', title: 'Cancel anytime', desc: 'No lock-in. Cancel or pause your plan at any time.' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div className="w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0" style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.20)' }}>
                      <i className={`${item.icon} text-cc-amber text-sm`} />
                    </div>
                    <div>
                      <div className="text-sm font-inter font-500 text-cc-text mb-0.5">{item.title}</div>
                      <div className="text-xs text-cc-muted">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-5">
                <div className="text-xs font-mono text-cc-muted tracking-wider mb-4">TRUSTED BY</div>
                <div className="grid grid-cols-2 gap-3">
                  {['Meridian Capital', 'Vantage AM', 'Apex Prop Desk', 'Quant Research Co.', 'Irongate Trading', 'Northfield Capital'].map(firm => (
                    <div key={firm} className="text-xs text-cc-text-dim font-inter flex items-center gap-2">
                      <i className="ri-building-line text-cc-amber text-xs" />
                      {firm}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: form */}
            <div>
              {submitted ? (
                <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-10 text-center">
                  <div className="w-14 h-14 flex items-center justify-center rounded-full mx-auto mb-5" style={{ background: 'rgba(0,208,132,0.12)', border: '1px solid rgba(0,208,132,0.25)' }}>
                    <i className="ri-check-line text-cc-green text-2xl" />
                  </div>
                  <h2 className="font-grotesk text-2xl font-700 text-white mb-3">Request received</h2>
                  <p className="text-cc-text-dim text-sm leading-relaxed mb-6">
                    Thanks for your interest in CueCore. Our team will review your application and reach out within 24 hours.
                  </p>
                  <a href="/" className="inline-flex items-center gap-2 text-sm text-cc-amber hover:text-cc-amber-light transition-colors cursor-pointer">
                    <i className="ri-arrow-left-line" /> Back to home
                  </a>
                </div>
              ) : (
                <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-8">
                  <form data-readdy-form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">FIRST NAME</label>
                        <input type="text" name="first_name" required placeholder="James" className="w-full px-4 py-3 text-sm rounded-md font-inter" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">LAST NAME</label>
                        <input type="text" name="last_name" required placeholder="Whitfield" className="w-full px-4 py-3 text-sm rounded-md font-inter" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">EMAIL ADDRESS</label>
                      <input type="email" name="email" required placeholder="you@firm.com" className="w-full px-4 py-3 text-sm rounded-md font-inter" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">FIRM / ORGANIZATION</label>
                      <input type="text" name="firm" placeholder="Meridian Capital (optional)" className="w-full px-4 py-3 text-sm rounded-md font-inter" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">TRADER TYPE</label>
                      <select name="trader_type" required className="w-full px-4 py-3 text-sm rounded-md font-inter cursor-pointer" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }}>
                        <option value="">Select your role</option>
                        <option value="individual">Individual / Retail Trader</option>
                        <option value="prop">Prop Desk Trader</option>
                        <option value="portfolio_manager">Portfolio Manager</option>
                        <option value="quant">Quantitative Analyst</option>
                        <option value="hedge_fund">Hedge Fund</option>
                        <option value="institutional">Institutional / Enterprise</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">PLAN INTEREST</label>
                      <select name="plan_interest" className="w-full px-4 py-3 text-sm rounded-md font-inter cursor-pointer" style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }}>
                        <option value="analyst">Analyst — $149/mo</option>
                        <option value="desk">Desk — $499/mo</option>
                        <option value="institutional">Institutional — Custom</option>
                        <option value="unsure">Not sure yet</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">
                        HOW WILL YOU USE CUECORE? <span className="text-cc-muted normal-case font-sans">(optional)</span>
                      </label>
                      <textarea
                        name="use_case"
                        rows={3}
                        maxLength={500}
                        placeholder="Briefly describe your trading workflow or use case..."
                        className="w-full px-4 py-3 text-sm rounded-md font-inter resize-none"
                        style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }}
                        onChange={e => setCharCount(e.target.value.length)}
                      />
                      <div className="text-right text-xs text-cc-muted mt-1">{charCount}/500</div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full flex items-center justify-center gap-2 font-grotesk font-500 text-sm py-3.5 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                      style={{ background: loading ? '#D97706' : '#F59E0B', color: '#0A0C10' }}
                      onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#FBBF24'; }}
                      onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#F59E0B'; }}
                    >
                      {loading ? (
                        <><i className="ri-loader-4-line animate-spin" /> Submitting...</>
                      ) : (
                        <>Request Early Access <i className="ri-arrow-right-line" /></>
                      )}
                    </button>
                    <p className="text-xs text-cc-muted text-center">
                      By submitting, you agree to our{' '}
                      <a href="#" className="text-cc-amber hover:underline cursor-pointer">Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="text-cc-amber hover:underline cursor-pointer">Privacy Policy</a>.
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestAccessPage;
