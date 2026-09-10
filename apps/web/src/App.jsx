import './styles/main.scss';
import VisionGate from './components/VisionGate.jsx';
import ThemeCord from './components/ThemeCord.jsx';
import Hero from './components/Hero.jsx';
import BottomHUD from './components/BottomHUD.jsx';
import Experience from './components/Experience.jsx';
import HeaderHUD from './components/HeaderHUD.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';

export default function App() {
  return (
    <I18nProvider>
      {/* Brand Header */}
      <HeaderHUD />

      <BottomHUD />
      <ThemeCord />

      <div className="site-bg"></div>

      <Hero />
      <VisionGate />
      <Experience />
    </I18nProvider>
  );
}


