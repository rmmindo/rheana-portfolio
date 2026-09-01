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

// Nav order is the page order. Keeping the two in sync by hand is how they
// drift, so this array is the single definition: it drives the links AND the
// scroll-spy, and the sections below are rendered in the same sequence.
// Order follows the page. The video used to be first, which is what made it
// feel like it arrived from nowhere: a stranger who has not seen a single
// piece of work yet has no reason to give a person three minutes. It now sits
// after the work and before the people who vouch for her, where a visitor who
// is interested wants to see who they would be talking to.
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

  const education = byId('education');

  return (
    <>
      <a className="skip-link" href="#main">{t('skip')}</a>
      <ReadingProgress />
      <PetalBurst />
      <VisionGate />

      <header className="topbar">
        <a className="topbar__brand" href="#main">
          <Petal size={26} className="topbar__petal" />
          <span className="topbar__brand-name">Rheana Mindo</span>
        </a>

        <nav className="topbar__nav" aria-label={t('nav.label')}>
          <ul className="topbar__links" role="list">
            {NAV.map(item => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`topbar__link${active === item.id ? ' is-current' : ''}`}
                  aria-current={active === item.id ? 'true' : undefined}
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="topbar__controls" role="group" aria-label={t('nav.controls')}>
          <div className="topbar__tools">
            <LangToggle />
            <SpeakButton 
              targetRef={{ get current() { return document.getElementById(active || 'main'); } }} 
              id={active || 'main'} 
              label="this section" 
            />
            <ThemeToggle />
          </div>
          <a className="topbar__cv-btn" href="/rheana-mindo-cv.pdf" download>
            <span className="cv-btn__text">Download&nbsp;</span>
            CV
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '4px'}}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
          </a>
        </div>
      </header>

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
