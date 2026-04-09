import { useState, useEffect } from 'react';

const NavBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Platform', href: '/platform' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Intelligence', href: '/intelligence' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0A0C10]/95 backdrop-blur-md' : 'bg-transparent'
      }`}
      style={scrolled ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : {}}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-7 h-7 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-cc-amber rotate-45 relative">
              <div className="absolute inset-1 bg-cc-amber/30" />
            </div>
          </div>
          <span className="font-grotesk font-700 text-white text-lg tracking-tight">
            Cue<span className="text-cc-amber">Core</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm transition-colors duration-200 cursor-pointer font-inter tracking-wide"
              style={{ color: '#8A95A8' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#F0F2F6')}
              onMouseLeave={e => (e.currentTarget.style.color = '#8A95A8')}
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="/signin"
            className="text-sm transition-colors cursor-pointer whitespace-nowrap"
            style={{ color: '#8A95A8' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F0F2F6')}
            onMouseLeave={e => (e.currentTarget.style.color = '#8A95A8')}
          >
            Sign In
          </a>
          <a
            href="/request-access"
            className="text-sm font-500 px-4 py-2 cursor-pointer whitespace-nowrap font-grotesk transition-colors"
            style={{ backgroundColor: '#F59E0B', color: '#0A0C10', borderRadius: '6px', fontWeight: 500, fontSize: '14px' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#FBBF24')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#F59E0B')}
          >
            Request Access
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center text-cc-text-dim cursor-pointer"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <i className={`text-xl ${mobileOpen ? 'ri-close-line' : 'ri-menu-3-line'}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0d1117] border-b border-[#1a2030] px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-cc-text-dim hover:text-white transition-colors cursor-pointer"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/request-access"
            className="text-sm font-500 px-4 py-2 rounded-md text-center cursor-pointer whitespace-nowrap"
            style={{ backgroundColor: '#F59E0B', color: '#0A0C10', borderRadius: '6px' }}
          >
            Request Access
          </a>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
