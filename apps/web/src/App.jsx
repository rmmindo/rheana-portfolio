import { useState } from 'react';
import './styles/main.scss';
import VisionGate from './components/VisionGate.jsx';
import ThemeCord from './components/ThemeCord.jsx';
import Hero from './components/Hero.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';
import customFonts from './custom-fonts-list.json';

export default function App() {
  const [brandFontIdx, setBrandFontIdx] = useState(-1);

  const cycleBrandFont = (direction) => {
    setBrandFontIdx((prev) => {
      let next = prev + direction;
      if (next >= customFonts.length) return -1;
      if (next < -1) return customFonts.length - 1;
      return next;
    });
  };

  const brandFontFamily = brandFontIdx === -1 ? undefined : `"${customFonts[brandFontIdx]}"`;

  return (
    <I18nProvider>
      {/* Brand Header + Font Cycler */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <a href="/" className="brand-anchor" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          textDecoration: 'none'
        }}>
          <img src="/petal.webp" alt="Hydrangea Logo" className="brand-logo" />
          <span className="brand-name" style={{ 
            fontWeight: 'bold', 
            fontSize: '1.25rem', 
            letterSpacing: '0.05em',
            mixBlendMode: 'difference',
            color: '#FFFFFF',
            fontFamily: brandFontFamily
          }}>Rheana Mindo</span>
        </a>

        {/* Font Cycling Controls */}
        <button 
          className="font-nav-btn brand-font-btn" 
          onClick={() => cycleBrandFont(-1)}
          aria-label="Previous font for brand"
        >
          &#8592;
        </button>
        <button 
          className="font-nav-btn brand-font-btn" 
          onClick={() => cycleBrandFont(1)}
          aria-label="Next font for brand"
        >
          &#8594;
        </button>
        <span className="font-debugger brand-font-debugger" style={{ margin: 0, paddingLeft: '8px' }}>
          {brandFontIdx === -1 ? 'Default' : customFonts[brandFontIdx]}
        </span>
      </div>

      <ThemeCord />

      <div className="site-bg scene-balloon"></div>
      <div className="site-mask"></div>

      <Hero />
      <VisionGate />
    </I18nProvider>
  );
}
