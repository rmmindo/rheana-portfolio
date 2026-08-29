import resume from './content/resume.json';
import ThemeToggle from './components/ThemeToggle.jsx';
import PetalBurst from './components/PetalBurst.jsx';
import { SpeechProvider } from './components/SpeechProvider.jsx';
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

export default function App() {
  const experience = byType('experience');
  const projects = byType('projects');
  const education = byType('education');
  const skills = byType('skills');

  return (
    <SpeechProvider>
      <a className="skip-link" href="#main">Skip to content</a>
      <PetalBurst />

      <header className="topbar">
        <a className="topbar__brand" href="#main">
          <Petal size={28} />
          <span className="topbar__mark">RM</span>
          <span className="visually-hidden">Rheana Mindo, home</span>
        </a>
        <nav className="topbar__nav" aria-label="Sections">
          <a href="#experience">Experience</a>
          <a href="#projects">Projects</a>
          <a href="#video">Video</a>
          <a href="#baybayin">Play</a>
          <a href="#proof">Recommendations</a>
          <a href="#skills">Skills</a>
        </nav>
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
          <p>
            Set in <strong>Atkinson Hyperlegible</strong>, designed by the Braille
            Institute for readers with low vision.
          </p>
          <p className="footer__meta">
            Built by Rheana Mindo. Every fact on this page is generated from one
            source, so the r&eacute;sum&eacute; and this site cannot disagree.
          </p>
          <VisitorCount />
        </div>
      </footer>
    </SpeechProvider>
  );
}
