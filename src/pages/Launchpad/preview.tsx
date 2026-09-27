import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import LaunchpadPage from './LaunchpadPage';
import '@/index.css';

// This secondary HTML entry is for Vite development only, not the production build.
createRoot(document.getElementById('root')!).render(import.meta.env.DEV ?
  <HashRouter>
    <main style={{ width: '100%', maxWidth: 430, height: '100dvh', overflowY: 'auto', margin: '0 auto', background: '#0c1521' }}><LaunchpadPage /></main>
  </HashRouter>
  : <p>Preview is only available in development.</p>);
