'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { FaDownload, FaShareAlt, FaTimes } from 'react-icons/fa';

const IOS_TIP_DISMISS_KEY = 'paysandu-pwa-ios-tip-dismissed';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

function isStandaloneDisplay(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return Boolean(nav.standalone);
}

function isIosSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const iOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!iOS) return false;
  if (/CriOS|FxiOS|EdgiOS|OPiOS|OPT\//.test(ua)) return false;
  return /Safari/.test(ua);
}

/**
 * Botón Instalar (Chrome/Android via beforeinstallprompt) + tip iOS (Compartir → Agregar a inicio).
 */
export default function PwaInstallHint() {
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosTip, setShowIosTip] = useState(false);
  const [installing, setInstalling] = useState(false);

  const hideOnRoute =
    pathname?.startsWith('/admin') || pathname?.startsWith('/login');

  useEffect(() => {
    if (isStandaloneDisplay()) return;

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowIosTip(false);
    };
    window.addEventListener('beforeinstallprompt', onBip);

    const dismissed = localStorage.getItem(IOS_TIP_DISMISS_KEY) === '1';
    if (!dismissed && isIosSafari()) {
      setShowIosTip(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', onBip);
  }, []);

  const handleInstall = async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } finally {
      setDeferred(null);
      setInstalling(false);
    }
  };

  const dismissIos = () => {
    localStorage.setItem(IOS_TIP_DISMISS_KEY, '1');
    setShowIosTip(false);
  };

  if (hideOnRoute) return null;

  if (deferred) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={() => void handleInstall()}
          disabled={installing}
          className="pointer-events-auto inline-flex min-h-11 items-center gap-2 rounded-2xl border border-primary/25 bg-white/95 px-4 py-2.5 text-sm font-semibold text-primary-dark shadow-lg backdrop-blur-sm touch-manipulation hover:bg-primary/5 disabled:opacity-60"
        >
          <FaDownload className="text-primary" aria-hidden />
          {installing ? 'Instalando…' : 'Instalar app'}
        </button>
      </div>
    );
  }

  if (showIosTip) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex max-w-sm items-start gap-2 rounded-2xl border border-primary/20 bg-white/95 px-3 py-3 text-left shadow-lg backdrop-blur-sm">
          <FaShareAlt className="mt-0.5 shrink-0 text-primary" aria-hidden />
          <p className="flex-1 text-xs leading-snug text-neutral-700">
            Para agregar a inicio: tocá <strong>Compartir</strong> y luego{' '}
            <strong>Agregar a pantalla de inicio</strong>.
          </p>
          <button
            type="button"
            onClick={dismissIos}
            className="shrink-0 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Cerrar"
          >
            <FaTimes className="text-sm" />
          </button>
        </div>
      </div>
    );
  }

  return null;
}
