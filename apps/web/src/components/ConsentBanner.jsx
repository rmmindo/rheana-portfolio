import React, { useEffect, useState } from 'react';

export default function ConsentBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    if (!consent) {
      setIsVisible(true);
    } else if (consent === 'granted') {
      injectAnalytics();
    }
  }, []);

  const injectAnalytics = () => {
    const code = import.meta.env.VITE_GOATCOUNTER || 'rheanamindo';
    if (!code) return;
    
    if (document.querySelector('script[data-goatcounter]')) return;

    const s = document.createElement('script');
    s.async = true;
    s.src = 'https://gc.zgo.at/count.js';
    s.setAttribute('data-goatcounter', 'https://' + code + '.goatcounter.com/count');
    document.head.appendChild(s);
    
    // Tell components like BottomHUD that they can now fetch safely
    window.dispatchEvent(new Event('analytics_granted'));
  };

  const handleAccept = () => {
    localStorage.setItem('analytics_consent', 'granted');
    setIsVisible(false);
    injectAnalytics();
  };

  const handleDecline = () => {
    localStorage.setItem('analytics_consent', 'denied');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="consent-banner">
      <h4 className="consent-title">Privacy & Analytics</h4>
      <p className="consent-text">
        We use cookieless, anonymous telemetry to count page views. No personal data is stored. Do you accept this minimal analytics collection?
      </p>
      <div className="consent-actions">
        <button className="consent-btn consent-decline" onClick={handleDecline}>Decline</button>
        <button className="consent-btn consent-accept" onClick={handleAccept}>Accept</button>
      </div>
    </div>
  );
}
