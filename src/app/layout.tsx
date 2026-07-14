import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import AppHeader from '@/components/AppHeader';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Escuelas de Paysandú',
  description: 'Galería de escuelas públicas del departamento de Paysandú.',
  applicationName: 'Escuelas de Paysandú',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/favicon-16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icons/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5B59B5',
};

function MburucuyaPattern() {
  return (
    <svg
      className="mburucuya-pattern"
      aria-hidden
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="mburucuya-tile"
          width="280"
          height="280"
          patternUnits="userSpaceOnUse"
        >
          {/* Flor line-art centrada, con espacio alrededor */}
          <g transform="translate(140 130)" fill="none">
            {/* Hoja suave */}
            <path
              d="M28 36c12 4 22 14 24 26-10-2-20-10-26-20 0-2 1-4 2-6z"
              stroke="#C4B5A0"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M-30 38c-12 4-22 14-24 26 10-2 20-10 26-20 0-2-1-4-2-6z"
              stroke="#C4B5A0"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Petalos (contorno) */}
            <g stroke="#8B89C9" strokeWidth="1.35" strokeLinecap="round">
              <ellipse cx="0" cy="-34" rx="9" ry="20" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(36)" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(72)" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(108)" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(144)" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(180)" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(216)" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(252)" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(288)" />
              <ellipse cx="0" cy="-34" rx="9" ry="20" transform="rotate(324)" />
            </g>

            {/* Corona delicada */}
            <circle r="16" stroke="#A5A3D4" strokeWidth="1" />
            <g stroke="#A5A3D4" strokeWidth="1" strokeLinecap="round">
              <line x1="0" y1="0" x2="0" y2="-15" />
              <line x1="0" y1="0" x2="11" y2="-10" />
              <line x1="0" y1="0" x2="15" y2="2" />
              <line x1="0" y1="0" x2="9" y2="12" />
              <line x1="0" y1="0" x2="-9" y2="12" />
              <line x1="0" y1="0" x2="-15" y2="2" />
              <line x1="0" y1="0" x2="-11" y2="-10" />
              <line x1="0" y1="0" x2="6" y2="-14" />
              <line x1="0" y1="0" x2="14" y2="-6" />
              <line x1="0" y1="0" x2="13" y2="8" />
              <line x1="0" y1="0" x2="0" y2="15" />
              <line x1="0" y1="0" x2="-13" y2="8" />
              <line x1="0" y1="0" x2="-14" y2="-6" />
              <line x1="0" y1="0" x2="-6" y2="-14" />
            </g>

            {/* Pistilos */}
            <g stroke="#5B59B5" strokeWidth="1.15" strokeLinecap="round">
              <line x1="0" y1="-2" x2="0" y2="-14" />
              <line x1="-2" y1="-1" x2="-9" y2="-11" />
              <line x1="2" y1="-1" x2="9" y2="-11" />
            </g>
            <circle cx="0" cy="-14" r="1.6" fill="#5B59B5" stroke="none" />
            <circle cx="-9" cy="-11" r="1.6" fill="#5B59B5" stroke="none" />
            <circle cx="9" cy="-11" r="1.6" fill="#5B59B5" stroke="none" />
            <circle r="3.2" fill="#E5A87A" stroke="none" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mburucuya-tile)" />
    </svg>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <div className="mburucuya-backdrop" aria-hidden />
        <MburucuyaPattern />
        <div className="app-shell">
          <Providers>
            <AppHeader />
            {children}
          </Providers>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
