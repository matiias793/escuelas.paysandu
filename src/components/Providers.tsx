'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import PwaInstallHint from '@/components/PwaInstallHint';
import PwaRegister from '@/components/PwaRegister';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <PwaRegister />
      {children}
      <PwaInstallHint />
    </AuthProvider>
  );
}
