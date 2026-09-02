import { useState } from 'react';
import './styles/main.scss';
import VisionGate from './components/VisionGate.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';

const SCENES = ['house', 'balloon'];

export default function App() {
  const [sceneIndex, setSceneIndex] = useState(0);

  const prevScene = () => setSceneIndex((i) => (i === 0 ? SCENES.length - 1 : i - 1));
  const nextScene = () => setSceneIndex((i) => (i === SCENES.length - 1 ? 0 : i + 1));

  return (
    <I18nProvider>
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
