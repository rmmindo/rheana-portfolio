import './styles/main.scss';
import VisionGate from './components/VisionGate.jsx';
import ThemeCord from './components/ThemeCord.jsx';
import Hero from './components/Hero.jsx';
import VisitorCount from './components/VisitorCount.jsx';
import HeaderHUD from './components/HeaderHUD.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';

export default function App() {
  return (
    <I18nProvider>
      {/* Brand Header */}
      <HeaderHUD />

      <VisitorCount />
      <ThemeCord />

      <div className="site-bg"></div>

      <Hero />
      <VisionGate />
    </I18nProvider>
  );
}


