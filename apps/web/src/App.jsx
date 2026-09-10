import './styles/main.scss';
import React, { useState } from 'react';
import VisionGate from './components/VisionGate.jsx';
import ThemeCord from './components/ThemeCord.jsx';
import Hero from './components/Hero.jsx';
import BottomHUD from './components/BottomHUD.jsx';
import HeaderHUD from './components/HeaderHUD.jsx';
import Experience from './components/Experience.jsx';
import ConsentBanner from './components/ConsentBanner.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';

export default function App() {
  const [isConsentResolved, setIsConsentResolved] = useState(
    () => typeof window !== 'undefined' ? !!localStorage.getItem('analytics_consent') : false
  );

  return (
    <I18nProvider>
      <HeaderHUD />
      <BottomHUD />
      <ThemeCord />
      <div className="site-bg"></div>
      
      {!isConsentResolved && (
        <ConsentBanner onResolve={() => setIsConsentResolved(true)} />
      )}

      {isConsentResolved && (
        <>
          <Hero />
          <VisionGate />
          <Experience />
        </>
      )}
    </I18nProvider>
  );
}
