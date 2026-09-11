import React, { useEffect, useState } from 'react';

export default function ConsentBanner({ onResolve }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    if (!consent) {
      setIsVisible(true);
    } else {
      if (consent === 'granted') {
        injectAnalytics();
      }
      if (onResolve) onResolve();
    }
  }, [onResolve]);

  const injectAnalytics = () => {
    const code = import.meta.env.VITE_GOATCOUNTER || 'rheanamindo';
    if (!code) return;
    
    if (document.querySelector('script[data-goatcounter]')) return;

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + code + '.goatcounter.com/count');
    document.head.appendChild(s);
    
    window.dispatchEvent(new Event('analytics_granted'));
  };

  const handleAccept = () => {
    localStorage.setItem('analytics_consent', 'granted');
    setIsVisible(false);
    injectAnalytics();
    if (onResolve) onResolve();
  };

  const handleDecline = () => {
    localStorage.setItem('analytics_consent', 'denied');
    setIsVisible(false);
    if (onResolve) onResolve();
  };

  if (!isVisible) return null;

  return (
    <div className="consent-gate-wrapper">
      <div className="modern-popup consent-specific">
        <div className="modern-popup-top">
          <svg className="modern-popup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
          <h2 className="modern-popup-title" style={{ marginBottom: '12px' }}>Welcome, explorer.</h2>
          <p className="modern-popup-text">
            We’d love to count you among our travelers. Total anonymity is guaranteed, with no cookies and no tracking. Ready to leave your mark?
          </p>
        </div>
        <div className="modern-popup-bottom">
          <button className="modern-popup-primary-btn" onClick={handleAccept}>LOG MY PRESENCE</button>
          <button className="modern-popup-secondary-btn" onClick={handleDecline}>REMAIN INVISIBLE</button>
        </div>
      </div>
    </div>
  );
}
