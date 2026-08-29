import resume from './content/resume.json';
import ThemeToggle from './components/ThemeToggle.jsx';
import PetalBurst from './components/PetalBurst.jsx';
import { SpeechProvider } from './components/SpeechProvider.jsx';
import { I18nProvider, useI18n } from './hooks/useI18n.jsx';
import LangToggle from './components/LangToggle.jsx';
import VisitorCount from './components/VisitorCount.jsx';
import Petal from './components/Petal.jsx';
import Hero from './sections/Hero.jsx';
import TrustBar from './sections/TrustBar.jsx';
import VideoResume from './sections/VideoResume.jsx';
import Proof from './sections/Proof.jsx';
import Baybayin from './sections/Baybayin.jsx';
import Entries from './sections/Entries.jsx';
import Skills from './sections/Skills.jsx';
import Education from './sections/Education.jsx';

const byType = type => resume.sections.find(s => s.type === type);

function Page() {
  const { t } = useI18n();
  const experience = byType('experience');
  const projects = byType('projects');
  const education = byType('education');
  const skills = byType('skills');

  return (
    <SpeechProvider>
      <a className="skip-link" href="#main">{t('skip')}</a>
      <PetalBurst />

      <header className="topbar">
        <a className="topbar__brand" href="#main">
          <Petal size={28} />
          <span className="topbar__mark">RM</span>
          <span className="visually-hidden">{t('home')}</span>
        </a>
        <nav className="topbar__nav" aria-label={t('nav.label')}>
          <a href="#experience">{t('nav.experience')}</a>
          <a href="#projects">{t('nav.projects')}</a>
          <a href="#video">{t('nav.video')}</a>
          <a href="#baybayin">{t('nav.play')}</a>
          <a href="#proof">{t('nav.proof')}</a>
          <a href="#skills">{t('nav.skills')}</a>
        </nav>
        <LangToggle />
        <ThemeToggle />
      </header>

      <main id="main">
        <Hero profile={resume.profile} />
        <TrustBar experience={experience} />
        <VideoResume />
        {experience && (
          <Entries section={experience} id="experience"
                   accent={['powder', 'purple', 'pink', 'mint', 'red', 'yellow']} />
        )}
        {projects && (
          <Entries section={projects} id="projects"
                   accent={['mint', 'yellow', 'powder']} />
        )}
        <Baybayin />
        <Proof />
        {skills && <Skills section={skills} />}
        {education && <Education section={education} />}
      </main>

      <footer className="footer">
        <div className="section__inner">
          <p>{t('footer.font')}</p>
          <p className="footer__meta">{t('footer.source')}</p>
          <VisitorCount />
        </div>
      </footer>
    </SpeechProvider>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <Page />
    </I18nProvider>
  );
}
