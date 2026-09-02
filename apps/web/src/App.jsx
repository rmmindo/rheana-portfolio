import './styles/main.scss';
import VisionGate from './components/VisionGate.jsx';
import { I18nProvider } from './hooks/useI18n.jsx';

export default function App() {
  return (
    <I18nProvider>
      <div className="site-bg"></div>
      <VisionGate />
    </I18nProvider>
  );
}
