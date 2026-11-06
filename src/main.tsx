import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Fail fast / log warning if required environment variables are absent in production
if (import.meta.env.PROD) {
  const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
  const missing = required.filter((k) => !import.meta.env[k]);
  if (missing.length > 0) {
    console.error(`[ASSON UI Security Warning] Missing required environment variables: ${missing.join(', ')}`);
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register Progressive Web App (PWA) Service Worker for offline past question access
if ('serviceWorker' in navigator && (import.meta.env.PROD || window.location.hostname !== 'localhost')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('ASSON UI PWA Service Worker active:', reg.scope);
    }).catch(() => {
      // ignore
    });
  });
}

