import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/main.scss';

// Scroll-reveal starts elements at opacity 0. That hidden state is scoped to
// this class so it exists ONLY when JavaScript is running to remove it again.
// Without the gate, a script error or an unsupported browser leaves the whole
// page invisible - which is exactly what happened on mobile once already.
document.documentElement.classList.add('js-reveal');

const root = document.getElementById('root');
// The build prerenders real markup into #root, so hydrate when it is populated
// and only fall back to a client render in dev, where it is empty.
if (root.hasChildNodes()) {
  hydrateRoot(root, <StrictMode><App /></StrictMode>);
} else {
  createRoot(root).render(<StrictMode><App /></StrictMode>);
}
