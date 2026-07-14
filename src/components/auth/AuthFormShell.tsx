'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { appPageTitleClass, appPanelElevatedClass } from '@/styles/ui';

interface AuthFormShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export default function AuthFormShell({
  title,
  subtitle,
  children,
  footer,
}: AuthFormShellProps) {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-2 py-6 sm:px-4 sm:py-8">
      <div className={`${appPanelElevatedClass} p-4 sm:p-8`}>
        <div className="mb-5 text-center sm:mb-6">
          <h1 className={`${appPageTitleClass} text-balance text-xl leading-tight sm:text-2xl md:text-3xl`}>
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-balance text-xs leading-relaxed text-neutral-500 sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>

        {children}

        {footer ? (
          <div className="mt-6 border-t border-surface-border pt-5 text-center text-sm text-neutral-500">
            {footer}
          </div>
        ) : null}
      </div>

      <p className="mt-6 text-center">
        <Link
          href="/"
          prefetch={false}
          className="text-sm font-medium text-neutral-400 transition-colors hover:text-primary-dark"
        >
          ← Volver al inicio
        </Link>
      </p>
    </div>
  );
}
