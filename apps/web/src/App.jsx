import './styles/main.scss';
import VisionGate from './components/VisionGate.jsx';
import ThemeCord from './components/ThemeCord.jsx';
import Hero from './components/Hero.jsx';
import VisitorCount from './components/VisitorCount.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';

export default function App() {
  return (
    <I18nProvider>
      {/* Brand Header */}
      <a href="/" className="brand-anchor">
        <img src="/petal.webp" alt="Hydrangea Logo" className="brand-logo" />
        <span className="brand-name">Rheana Mindo</span>
      </a>

      <VisitorCount />
      <ThemeCord />

      <div className="site-bg"></div>

      <Hero />
      <VisionGate />
    </I18nProvider>
  );
}


