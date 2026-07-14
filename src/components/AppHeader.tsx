'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaSignOutAlt, FaEdit, FaImages } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { hasPaysanduSchoolsAccess } from '@/utils/account-permissions';

export default function AppHeader() {
  const pathname = usePathname();
  const { user, profile, loading, signOut } = useAuth();
  const canEdit = hasPaysanduSchoolsAccess(profile);
  const onAdmin = pathname?.startsWith('/admin');
  const onLogin = pathname?.startsWith('/login');

  if (onLogin) return null;

  // Visitante: solo acceso discreto al login
  if (loading || !user || !canEdit) {
    if (loading) return null;
    if (user && !canEdit) {
      return (
        <header className="pointer-events-none fixed right-0 top-0 z-40 p-3 sm:p-4">
          <button
            type="button"
            onClick={() => void signOut()}
            className="pointer-events-auto rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/80 hover:text-neutral-600"
          >
            Salir
          </button>
        </header>
      );
    }
    return (
      <header className="pointer-events-none fixed right-0 top-0 z-40 p-3 sm:p-4">
        <Link
          href="/login"
          className="pointer-events-auto rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition-colors hover:bg-white/80 hover:text-primary-dark"
        >
          Iniciar sesión
        </Link>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-primary/15 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4">
        <Link
          href="/"
          className="text-sm font-bold text-primary-dark hover:text-primary sm:text-base"
        >
          Escuelas de Paysandú
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold touch-manipulation sm:text-sm ${
              !onAdmin
                ? 'bg-primary/15 text-primary-dark'
                : 'text-neutral-600 hover:bg-primary/10'
            }`}
          >
            <FaImages className="text-[11px]" aria-hidden />
            Galería
          </Link>

          <Link
            href="/admin"
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold touch-manipulation sm:text-sm ${
              onAdmin
                ? 'bg-primary text-white'
                : 'text-neutral-600 hover:bg-primary/10'
            }`}
          >
            <FaEdit className="text-[11px]" aria-hidden />
            Editar
          </Link>

          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-1.5 rounded-full border border-surface-border bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 touch-manipulation hover:bg-neutral-50 sm:text-sm"
            title={profile?.username ? `Salir (${profile.username})` : 'Salir'}
          >
            <FaSignOutAlt className="text-[11px]" aria-hidden />
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
