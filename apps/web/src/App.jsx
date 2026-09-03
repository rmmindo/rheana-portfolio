import './styles/main.scss';
import VisionGate from './components/VisionGate.jsx';
import ThemeCord from './components/ThemeCord.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';

export default function App() {
  return (
    <I18nProvider>
      <a href="/" className="brand-anchor" style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 9000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        textDecoration: 'none'
      }}>
        <img src="/petal.png" alt="Hydrangea Logo" className="brand-logo" />
        <span className="brand-name" style={{ 
          fontWeight: 'bold', 
          fontSize: '1.25rem', 
          letterSpacing: '0.05em',
          mixBlendMode: 'difference',
          color: '#FFFFFF'
        }}>Rheana Mindo</span>
      </a>
      <ThemeCord />

      <div className="site-bg scene-balloon"></div>
      <div className="site-mask"></div>

      <VisionGate />
    </I18nProvider>
  );
}
