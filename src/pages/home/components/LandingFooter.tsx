const LandingFooter = () => (
  <footer className="bg-[#0d1117] border-t border-[#1a2030] py-12">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
        <div className="max-w-xs">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-6 h-6 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-cc-amber rotate-45 relative"><div className="absolute inset-0.5 bg-cc-amber/30" /></div>
            </div>
            <span className="font-grotesk font-700 text-white text-base">Cue<span className="text-cc-amber">Core</span></span>
          </div>
          <p className="text-cc-muted text-sm leading-relaxed">Institutional-grade AI trading intelligence. Built for professionals who demand signal clarity.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 text-sm">
          <div>
            <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">PLATFORM</div>
            <div className="flex flex-col gap-2">
              {['Features', 'How It Works', 'API Docs'].map(l => <a key={l} href="#" className="text-cc-text-dim hover:text-white transition-colors cursor-pointer">{l}</a>)}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">COMPANY</div>
            <div className="flex flex-col gap-2">
              {['About', 'Blog', 'Careers', 'Contact'].map(l => <a key={l} href="#" className="text-cc-text-dim hover:text-white transition-colors cursor-pointer">{l}</a>)}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-cc-muted tracking-wider mb-3">LEGAL</div>
            <div className="flex flex-col gap-2">
              {['Privacy Policy', 'Terms of Service', 'Risk Disclosure'].map(l => <a key={l} href="#" className="text-cc-text-dim hover:text-white transition-colors cursor-pointer">{l}</a>)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#1a2030]">
        <p className="text-xs text-cc-muted">© 2026 CueCore. All rights reserved. Not financial advice.</p>
        <div className="flex items-center gap-4">
          {['ri-twitter-x-line', 'ri-linkedin-line', 'ri-github-line'].map((icon, i) => (
            <a key={i} href="#" className="w-7 h-7 flex items-center justify-center text-cc-muted hover:text-white transition-colors cursor-pointer"><i className={`${icon} text-sm`} /></a>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
