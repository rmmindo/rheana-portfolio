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
          <svg className="modern-popup-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          <p className="modern-popup-text">
            We use cookieless, anonymous telemetry to count page views. No personal data is stored. Do you accept this minimal analytics collection?
          </p>
        </div>
        <div className="modern-popup-bottom">
          <button className="modern-popup-primary-btn" onClick={handleAccept}>ACCEPT</button>
          <button className="modern-popup-secondary-btn" onClick={handleDecline}>DECLINE</button>
        </div>
      </div>
    </div>
  );
}
