'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminPaysanduSchoolsPanel from '@/components/admin/AdminPaysanduSchoolsPanel';
import { useAuth } from '@/contexts/AuthContext';
import { hasPaysanduSchoolsAccess } from '@/utils/account-permissions';
import { appPanelClass } from '@/styles/ui';

export default function AdminPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const canEdit = hasPaysanduSchoolsAccess(profile);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login?next=/admin');
      return;
    }
    if (!canEdit) {
      router.replace('/');
    }
  }, [loading, user, canEdit, router]);

  if (loading || !user) {
    return (
      <div className="mx-auto max-w-6xl px-3 py-10 text-center text-sm text-neutral-500 sm:px-4">
        Verificando sesión…
      </div>
    );
  }

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-lg px-3 py-10 sm:px-4">
        <div className={`${appPanelClass} p-5 text-center`}>
          <p className="text-sm font-semibold text-neutral-800">Sin permiso de edición</p>
          <p className="mt-2 text-sm text-neutral-500">
            Tu usuario no tiene acceso para editar escuelas de Paysandú. Pedile a un
            administrador de la Calculadora que te habilite el rol.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-2 py-4 sm:px-4 sm:py-5">
      <AdminPaysanduSchoolsPanel />
    </div>
  );
}
