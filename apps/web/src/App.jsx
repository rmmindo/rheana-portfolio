import resume from './content/resume.json';
import ThemeToggle from './components/ThemeToggle.jsx';
import PetalBurst from './components/PetalBurst.jsx';
import VisionGate from './components/VisionGate.jsx';
import VisitorCount from './components/VisitorCount.jsx';
import Petal from './components/Petal.jsx';
import { SpeechProvider } from './components/SpeechProvider.jsx';
import { I18nProvider, useI18n } from './hooks/useI18n.jsx';
import { useActiveSection } from './hooks/useActiveSection.js';
import Hero from './sections/Hero.jsx';
import TrustBar from './sections/TrustBar.jsx';
import VideoResume from './sections/VideoResume.jsx';
import Entries from './sections/Entries.jsx';
import Work from './sections/Work.jsx';
import Baybayin from './sections/Baybayin.jsx';
import Proof from './sections/Proof.jsx';
import Skills from './sections/Skills.jsx';
import Roots from './sections/Roots.jsx';
import WriteToMe from './sections/WriteToMe.jsx';

const byId = id => resume.sections.find(s => s.id === id);

// Nav order is the page order. Keeping the two in sync by hand is how they
// drift, so this array is the single definition: it drives the links AND the
// scroll-spy, and the sections below are rendered in the same sequence.
const NAV = [
  { id: 'video', key: 'nav.video' },
  { id: 'experience', key: 'nav.experience' },
  { id: 'projects', key: 'nav.projects' },
  { id: 'volunteering', key: 'nav.volunteering' },
  { id: 'baybayin', key: 'nav.play' },
  { id: 'proof', key: 'nav.proof' },
  { id: 'skills', key: 'nav.skills' },
];
const NAV_IDS = NAV.map(n => n.id);

function Page() {
  const { t } = useI18n();
  const active = useActiveSection(NAV_IDS);

  const experience = byId('experience');
  const projects = byId('projects');
  const volunteering = byId('volunteering');
  const education = byId('education');
  const skills = byId('skills');

  return (
    <>
      <a className="skip-link" href="#main">{t('skip')}</a>
      <PetalBurst />
      <VisionGate />

      <header className="topbar">
        <a className="topbar__brand" href="#main">
          <Petal size={26} />
          {/* The real monogram, not the letters R and M set in a body font.
              alt is empty because the adjacent visually-hidden text already
              names the link, and a screen reader should hear it once. */}
          <img className="topbar__logo" src="/img/rheana-mindo-rm-monogram-96.webp"
               alt="" width="36" height="36" />
          <span className="visually-hidden">{t('home')}</span>
        </a>

        <nav className="topbar__nav" aria-label={t('nav.label')}>
          <ul className="topbar__links" role="list">
            {NAV.map(item => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`topbar__link${active === item.id ? ' is-current' : ''}`}
                  // aria-current tells a screen reader which section is in view,
                  // so the highlight is not purely visual.
                  aria-current={active === item.id ? 'true' : undefined}
                >
                  {t(item.key)}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* A separate group with its own divider. Display controls are a
            different kind of thing from navigation, and sitting them flush
            against the links made them read as more nav items. */}
        <div className="topbar__controls" role="group" aria-label={t('nav.controls')}>
          <ThemeToggle />
        </div>
      </header>

      <main id="main" className="garden">
        <Hero profile={resume.profile} />
        <TrustBar experience={experience} />
        <VideoResume />
        <Work />
        {projects && (
          <Entries section={projects} id="projects" titleKey="section.projects"
                   stage={{ n: 3, nameKey: 'stage.harvest', season: 'summer', hue: 'red' }}
                   accent={['mint', 'yellow', 'powder']} />
        )}
        {volunteering && (
          <Entries section={volunteering} id="volunteering" titleKey="section.volunteering"
                   stage={{ n: 4, nameKey: 'stage.share', season: 'summer', hue: 'mint' }}
                   accent={['mint', 'pink', 'yellow']} />
        )}
        <Baybayin />
        <Proof />
        {skills && <Skills section={skills} />}
        <Roots />
        <WriteToMe email={resume.profile.contact.find(c => c.label.includes('@'))?.label ?? ''} />
      </main>

      <footer className="footer">
        <div className="section__inner">
          <p>{t('footer.font')}</p>
          <p className="footer__meta">{t('footer.source')}</p>
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
