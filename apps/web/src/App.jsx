import { useState } from 'react';
import resume from './content/resume.json';
import ThemeToggle from './components/ThemeToggle.jsx';
import PetalBurst from './components/PetalBurst.jsx';
import ReadingProgress from './components/ReadingProgress.jsx';
import VisionGate from './components/VisionGate.jsx';
import VisitorCount from './components/VisitorCount.jsx';
import Petal from './components/Petal.jsx';
import { SpeechProvider, SpeakButton } from './components/SpeechProvider.jsx';
import LangToggle from './components/LangToggle.jsx';
import { I18nProvider, useI18n } from './hooks/useI18n.jsx';
import { useActiveSection } from './hooks/useActiveSection.js';
import Hero from './sections/Hero.jsx';
import VideoResume from './sections/VideoResume.jsx';
import Work from './sections/Work.jsx';
import Plot from './sections/Plot.jsx';
import Proof from './sections/Proof.jsx';
import Skills from './sections/Skills.jsx';
import HowIWork from './sections/HowIWork.jsx';
import Roots from './sections/Roots.jsx';
import WriteToMe from './sections/WriteToMe.jsx';
import NextStep from './sections/NextStep.jsx';

const byId = id => resume.sections.find(s => s.id === id);

const NAV = [
  { id: 'experience', key: 'nav.experience' },
  { id: 'projects', key: 'nav.plot' },
  { id: 'video', key: 'nav.video' },
  { id: 'proof', key: 'nav.proof' },
  { id: 'skills', key: 'nav.skills' },
];
const NAV_IDS = NAV.map(n => n.id);

function Page() {
  const { t } = useI18n();
  const active = useActiveSection(NAV_IDS);
  const activeIndex = NAV.findIndex(n => n.id === active);
  const [transitioning, setTransitioning] = useState(false);

  const education = byId('education');

  const handleNavClick = (e, id) => {
    e.preventDefault();
    setTransitioning(true);
    setTimeout(() => {
      window.location.hash = id;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'instant' });
      setTimeout(() => setTransitioning(false), 50);
    }, 500); // Wait for color overlay to cover the screen
  };

  return (
    <>
      {/* Temporarily removed .page-transition to debug click interception */}
      
      <a className="skip-link" href="#main">{t('skip')}</a>
      <ReadingProgress />
      <PetalBurst />
      <VisionGate />

      <div className="hud">
        <a className="hud__top-left" href="#main">
          <Petal size={26} className="topbar__petal" />
          <span className="topbar__brand-name">Rheana Mindo</span>
        </a>

        <div className="hud__top-right" role="group" aria-label={t('nav.controls')}>
          <LangToggle />
          <SpeakButton 
            targetRef={{ get current() { return document.getElementById(active || 'main'); } }} 
            id={active || 'main'} 
            label="this section" 
          />
          <ThemeToggle />
        </div>

        <a className="hud__bottom-left topbar__cv-btn" href="/rheana-mindo-cv.pdf" download>
          <span className="cv-btn__text">Download&nbsp;</span>
          CV
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '4px'}}>
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
        </a>

        <nav className="hud__bottom-right" aria-label={t('nav.label')}>
          <ul className="hud__links" role="list">
            {NAV.map(item => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className={`topbar__link${active === item.id ? ' is-current' : ''}`}
                  aria-current={active === item.id ? 'true' : undefined}
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <main id="main">
        <Hero profile={resume.profile} />
        <Work />
        <Plot />
        <VideoResume />
        <Proof />
        <Skills />
        <HowIWork />
        <Roots />
        <WriteToMe email={resume.profile.contact.find(c => c.label.includes('@'))?.label ?? ''} />
        <NextStep />
      </main>

      <footer className="footer">
        <div className="section__inner">
          <p className="footer__meta">{t('footer.built')}</p>
          <p>{t('footer.font')}</p>
          <nav className="footer__links" aria-label={t('footer.legal')}>
            <a href="/privacy.html">{t('footer.privacy')}</a>
            <a href="/legal.html">{t('footer.legal')}</a>
          </nav>
          <VisitorCount />
        </div>
      </footer>
    </>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <SpeechProvider>
        <Page />
      </SpeechProvider>
    </I18nProvider>
  );
}
