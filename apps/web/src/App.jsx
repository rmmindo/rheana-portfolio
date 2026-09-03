import { useState } from 'react';
import './styles/main.scss';
import VisionGate from './components/VisionGate.jsx';
import ThemeCord from './components/ThemeCord.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';

const SCENES = ['house', 'balloon'];

export default function App() {
  const [sceneIndex, setSceneIndex] = useState(0);

  const prevScene = () => setSceneIndex((i) => (i === 0 ? SCENES.length - 1 : i - 1));
  const nextScene = () => setSceneIndex((i) => (i === SCENES.length - 1 ? 0 : i + 1));

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
        <img src="/petal.png" alt="Hydrangea Logo" className="brand-logo" style={{ width: '32px', height: '32px' }} />
        <span className="brand-name" style={{ 
          fontWeight: 'bold', 
          fontSize: '1.25rem', 
          letterSpacing: '0.05em',
          mixBlendMode: 'difference',
          color: '#FFFFFF'
        }}>Rheana Mindo</span>
      </a>
      <ThemeCord />

      <div className={`site-bg scene-${SCENES[sceneIndex]}`}></div>
      <div className="site-mask"></div>
      
      <button className="scene-nav scene-nav--prev" onClick={prevScene} aria-label="Previous scene">
        &lsaquo;
      </button>
      <button className="scene-nav scene-nav--next" onClick={nextScene} aria-label="Next scene">
        &rsaquo;
      </button>

      <VisionGate />
    </I18nProvider>
  );
}
