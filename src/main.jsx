import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import './components/auth/AuthField.css';

// localhost can still be controlled by a worker from a previously run project.
// This Vite app does not use a service worker in development.
if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(async (registrations) => {
    const controlled = Boolean(navigator.serviceWorker.controller);
    const removed = await Promise.all(registrations.map((registration) => registration.unregister()));
    if (controlled && removed.some(Boolean)) window.location.reload();
  }).catch(() => {});
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
