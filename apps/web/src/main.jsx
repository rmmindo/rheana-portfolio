import { StrictMode } from 'react';
import { hydrateRoot, createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/main.scss';

const root = document.getElementById('root');
// The build prerenders real markup into #root, so hydrate when it is populated
// and only fall back to a client render in dev, where it is empty.
if (root.hasChildNodes()) {
  hydrateRoot(root, <StrictMode><App /></StrictMode>);
} else {
  createRoot(root).render(<StrictMode><App /></StrictMode>);
}
