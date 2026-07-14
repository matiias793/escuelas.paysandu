'use client';

import { useEffect } from 'react';

/** Registra el service worker de la PWA (solo en producción / HTTPS). */
export default function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    // En local http permite SW en localhost; en preview/prod es https.
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    if (process.env.NODE_ENV !== 'production' && !isLocalhost) return;

    void navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silenciar: PWA es mejora progresiva
    });
  }, []);

  return null;
}
