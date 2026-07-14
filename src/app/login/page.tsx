'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, Suspense, useEffect, useState } from 'react';
import AuthFormShell from '@/components/auth/AuthFormShell';
import { useAuth } from '@/contexts/AuthContext';
import { appAuthInputClass, appAuthLabelClass, plannerBtnPrimary } from '@/styles/ui';
import { supabase } from '@/lib/supabase/client';
import {
  INVALID_CREDENTIALS_MSG,
  RATE_LIMIT_MSG,
  RPC_ERROR_MSG,
  resolveLoginEmail,
} from '@/lib/supabase/resolve-login-email';
import { hasPaysanduSchoolsAccess } from '@/utils/account-permissions';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next')?.startsWith('/')
    ? searchParams.get('next')!
    : '/admin';
  const { user, profile, loading: authLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    if (hasPaysanduSchoolsAccess(profile)) {
      router.replace(nextPath);
      return;
    }
    router.replace('/');
  }, [authLoading, router, user, profile, nextPath]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const resolved = await resolveLoginEmail(identifier);

    if (!resolved.ok) {
      setLoading(false);
      setError(
        resolved.reason === 'rate_limit'
          ? RATE_LIMIT_MSG
          : resolved.reason === 'rpc_error'
            ? RPC_ERROR_MSG
            : INVALID_CREDENTIALS_MSG,
      );
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: resolved.email,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(
        signInError.message === 'Invalid login credentials'
          ? INVALID_CREDENTIALS_MSG
          : signInError.message,
      );
      return;
    }

    router.replace(nextPath);
    router.refresh();
  };

  return (
    <AuthFormShell
      title="Ingresar"
      subtitle="Usá las mismas credenciales que en la Calculadora de ingredientes"
      footer={
        <>
          <Link href="/" prefetch={false} className="font-semibold text-primary-dark hover:text-primary">
            Volver a la galería
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" autoComplete="on">
        <div>
          <label htmlFor="identifier" className={appAuthLabelClass}>
            Correo o usuario
          </label>
          <input
            id="identifier"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className={appAuthInputClass}
            placeholder="Usuario o correo electrónico"
          />
        </div>

        <div>
          <label htmlFor="password" className={appAuthLabelClass}>
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={appAuthInputClass}
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className={`${plannerBtnPrimary} mt-1 w-full justify-center py-3 text-sm`}
        >
          {loading ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </AuthFormShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center text-sm text-neutral-500">Cargando…</div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
