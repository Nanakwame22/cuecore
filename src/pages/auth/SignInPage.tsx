import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SignInPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/app/dashboard');
    }, 1200);
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
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Grid bg */}
          <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center mb-10">
              <h1 className="font-grotesk text-3xl font-700 text-white mb-2">Welcome back</h1>
              <p className="text-cc-text-dim text-sm">Sign in to your CueCore account</p>
            </div>

            <div className="bg-[#0d1117] border border-[#1a2030] rounded-xl p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-mono text-cc-muted tracking-wider mb-2">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@firm.com"
                    className="w-full px-4 py-3 text-sm rounded-md font-inter"
                    style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono text-cc-muted tracking-wider">PASSWORD</label>
                    <a href="#" className="text-xs text-cc-amber hover:text-cc-amber-light transition-colors cursor-pointer">Forgot password?</a>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 text-sm rounded-md font-inter"
                    style={{ background: '#0A0C10', border: '1px solid rgba(255,255,255,0.08)', color: '#F0F2F6' }}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-md" style={{ background: 'rgba(255,77,77,0.10)', border: '1px solid rgba(255,77,77,0.25)' }}>
                    <i className="ri-error-warning-line text-cc-red text-sm" />
                    <span className="text-xs text-cc-red">{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 font-grotesk font-500 text-sm py-3 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                  style={{ background: loading ? '#D97706' : '#F59E0B', color: '#0A0C10' }}
                  onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#FBBF24'; }}
                  onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#F59E0B'; }}
                >
                  {loading ? (
                    <><i className="ri-loader-4-line animate-spin" /> Signing in...</>
                  ) : (
                    <>Sign In <i className="ri-arrow-right-line" /></>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm text-cc-text-dim">
                  Don&apos;t have an account?{' '}
                  <a href="/request-access" className="text-cc-amber hover:text-cc-amber-light transition-colors cursor-pointer">
                    Request access
                  </a>
                </p>
              </div>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-cc-muted">
              <div className="flex items-center gap-1.5">
                <i className="ri-lock-line text-cc-amber text-sm" />
                <span>SOC 2 Type II</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="ri-shield-check-line text-cc-amber text-sm" />
                <span>256-bit encryption</span>
              </div>
              <div className="flex items-center gap-1.5">
                <i className="ri-global-line text-cc-amber text-sm" />
                <span>99.97% uptime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
