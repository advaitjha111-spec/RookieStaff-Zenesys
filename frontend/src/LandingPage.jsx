import React, { useState, useEffect, useRef } from 'react';
import './LandingPage.css';

export default function LandingPage({ onGetStarted }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const appears = containerRef.current.querySelectorAll('.appear');
    
    appears.forEach(el => {
      el.addEventListener('animationend', () => el.classList.add('is-in'), { once: true });
    });

    // Fallback if animation doesn't play
    const timeout = setTimeout(() => {
      let running = false;
      for (let i = 0; i < appears.length; i++) {
        if (appears[i].getAnimations && appears[i].getAnimations().some(a => a.playState === 'running' || a.playState === 'finished')) {
          running = true;
          break;
        }
      }
      if (!running) {
        appears.forEach(el => el.classList.add('is-in'));
        const heroPhoto = containerRef.current.querySelector('.hero-photo');
        if (heroPhoto) heroPhoto.classList.add('is-in');
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    const mql = window.matchMedia('(min-width: 901px)');
    const handleResize = (e) => {
      if (e.matches && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    mql.addEventListener('change', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      mql.removeEventListener('change', handleResize);
    };
  }, [isMenuOpen]);

  return (
    <div className={`landing-page-container ${isMenuOpen ? 'menu-open' : ''}`} ref={containerRef}>
      <div className="grain"></div>

      <div className="hero-photo">
        <video autoPlay loop muted playsInline>
          <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260818_072341_50851634-bbc3-4c33-9acc-7647d4db44aa.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="page">
        <div className="menu-backdrop" onClick={() => setIsMenuOpen(false)}></div>

        {/* 3-Column Header */}
        <header className="header">
          <a href="#top" className="logo appear appear--scale" aria-label="Verix AI" style={{ '--d': '0.08s' }}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <g transform="rotate(-30 12 12)">
                <circle cx="7.3" cy="3.2" r="1.45"/>
                <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8"/>
                <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8"/>
                <circle cx="16.7" cy="20.8" r="1.45"/>
              </g>
            </svg>
            <span>Verix<span className="logo-suffix"> AI</span></span>
          </a>

          <div className="header-actions">
            <button onClick={onGetStarted} className="btn btn-ghost header-auth appear appear--scale" style={{ '--d': '0.30s' }}>Sign In</button>
            <button onClick={onGetStarted} className="btn btn-ghost header-auth appear appear--scale" style={{ '--d': '0.32s' }}>Sign Up</button>
            <button onClick={onGetStarted} className="btn btn-solid header-cta appear appear--scale" style={{ '--d': '0.34s' }}>Get Started</button>
            <button 
              className="burger" 
              aria-controls="site-nav" 
              aria-expanded={isMenuOpen} 
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </header>

        {/* Bottom-Centered Hero */}
        <main className="hero" id="top">
          <div className="hero-copy">
            <div className="badge appear appear--pop" style={{ '--d': '0.22s' }}>
              <svg className="badge-star" viewBox="0 0 24 24">
                <path d="M12 2.6C12.55 2.6 12.88 3.15 13.08 4.7c.62 4.7 1.52 5.6 6.22 6.22 1.55.2 2.1.53 2.1 1.08s-.55.88-2.1 1.08c-4.7.62-5.6 1.52-6.22 6.22-.2 1.55-.53 2.1-1.08 2.1s-.88-.55-1.08-2.1c-.62-4.7-1.52-5.6-6.22-6.22C3.15 12.88 2.6 12.55 2.6 12s.55-.88 2.1-1.08c4.7-.62 5.6-1.52 6.22-6.22C11.12 3.15 11.45 2.6 12 2.6Z"/>
              </svg>
              <span>Financial Validation Command Center</span>
            </div>

            <h1>
              <span className="headline-line"><span className="appear appear--mask" style={{ '--d': '0.42s' }}>Automate <em>invoice validation</em> and</span></span>
              <span className="headline-line"><span className="appear appear--mask" style={{ '--d': '0.62s' }}>ERP reconciliation.</span></span>
            </h1>

            <p className="lede appear appear--soft" style={{ '--d': '0.82s' }}>
              Detect duplicates, reconcile math anomalies, and instantly sync approved invoices to your ERP ledger with 99.9% accuracy.
            </p>

            <div className="hero-actions">
              <button onClick={onGetStarted} className="btn btn-solid btn-hero appear appear--btn" style={{ '--d': '0.96s' }}>Get Started</button>
              <button onClick={onGetStarted} className="btn btn-ghost-hero btn-hero appear appear--side" style={{ '--d': '1.10s' }}>See it in action</button>
            </div>
          </div>
        </main>

        {/* Stats Footer */}
        <footer className="stats">
          {/* 1. Dual-Pill / Workflow Icon */}
          <div className="stat appear appear--stat" style={{ '--d': '1.12s' }}>
            <svg className="stat-icon" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="grad-left" x1="3" y1="2" x2="14" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.38"/>
                  <stop offset="100%" stopColor="#3a3a3a" stopOpacity="0.62"/>
                </linearGradient>
                <linearGradient id="grad-right" x1="13" y1="2" x2="24" y2="22" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#3a3a3a" stopOpacity="0.38"/>
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.62"/>
                </linearGradient>
              </defs>
              <rect x="3.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#grad-left)"/>
              <rect x="13.4" y="2.6" width="7.2" height="18.8" rx="3.6" fill="url(#grad-right)"/>
              <rect x="9.2" y="10.9" width="5.6" height="2.2" rx="1.1" fill="#4a4a4a"/>
            </svg>
            <span>4.2M+ invoices processed</span>
          </div>

          {/* 2. Download Tile Icon */}
          <div className="stat appear appear--stat" style={{ '--d': '1.28s' }}>
            <svg className="stat-icon" viewBox="0 0 24 24">
              <rect x="2.4" y="2.4" width="19.2" height="19.2" rx="6.2" fill="#ffffff"/>
              <path d="M12 7.1v7.4M8.15 12.35L12 16.2l3.85-3.85" stroke="#111" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <span>99% reduction in manual validation</span>
          </div>

          {/* 3. Three Avatars Icon */}
          <div className="stat appear appear--stat" style={{ '--d': '1.44s' }}>
            <svg className="stat-icon-wide" viewBox="0 0 40 22">
              <circle cx="10.2" cy="11" r="9.2" fill="#2b2b2b"/>
              <ellipse cx="10.2" cy="12.1" rx="4.15" ry="3.7" fill="#f4f4f4"/>
              <polygon points="8,5.5 10,8.5 7,8.5" fill="#2b2b2b"/>
              <polygon points="12.4,5.5 13.4,8.5 10.4,8.5" fill="#2b2b2b"/>
              <circle cx="9" cy="11.5" r="0.7" fill="#1a1a1a"/>
              <circle cx="11.4" cy="11.5" r="0.7" fill="#1a1a1a"/>
              <circle cx="20.2" cy="11" r="9.2" fill="#ffffff"/>
              <circle cx="17.7" cy="9.5" r="1.7" fill="#111"/>
              <circle cx="22.7" cy="9.5" r="1.7" fill="#111"/>
              <ellipse cx="20.2" cy="12.2" rx="1.2" ry="0.9" fill="#111"/>
              <path d="M18 13.8c1 1.2 3.4 1.2 4.4 0" stroke="#111" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
              <circle cx="30.2" cy="11" r="9.2" fill="#f26b1d"/>
              <text x="30.2" y="15.1" fontFamily="'Inter', system-ui, sans-serif" fontWeight="700" fontSize="12.5" fill="#ffffff" textAnchor="middle">e</text>
            </svg>
            <span>180+ finance teams onboarded</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
