'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import {
  appAuthLabelClass,
  plannerBtnPrimary,
  plannerBtnSecondary,
} from '@/styles/ui';
import { adminSetPaysanduSchoolPublicInfo } from '@/services/paysandu-schools';
import type { PaysanduSchoolRow } from '@/types/paysandu-school';

const MAX_LENGTH = 4000;

type Props = {
  open: boolean;
  schoolNumber: number | null;
  initialInfo: string | null;
  schoolNombre: string | null;
  onClose: () => void;
  onSaved: (row: PaysanduSchoolRow) => void;
};

export default function PaysanduSchoolPublicInfoModal({
  open,
  schoolNumber,
  initialInfo,
  schoolNombre,
  onClose,
  onSaved,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setDraft(initialInfo ?? '');
    setError(null);
  }, [open, initialInfo, schoolNumber]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleSave = async () => {
    if (schoolNumber == null) return;
    setSaving(true);
    setError(null);
    const result = await adminSetPaysanduSchoolPublicInfo(schoolNumber, draft);
    setSaving(false);
    if (!result.ok || !result.row) {
      setError(result.error ?? 'No se pudo guardar la información.');
      return;
    }
    onSaved(result.row);
    onClose();
  };

  if (!mounted || !open || schoolNumber == null) return null;

  const remaining = MAX_LENGTH - draft.length;

  return createPortal(
    <div
      className="fixed inset-0 z-[260] flex items-end justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8 sm:items-center sm:px-4 sm:py-8"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="school-public-info-title"
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <FaTimes />
        </button>

        <div className="border-b border-surface-border px-5 pb-3 pt-5 pr-12">
          <h2 id="school-public-info-title" className="text-lg font-bold text-neutral-800">
            Info pública · Escuela Nº {schoolNumber}
          </h2>
          {schoolNombre?.trim() ? (
            <p className="mt-0.5 text-sm text-neutral-500">{schoolNombre.trim()}</p>
          ) : null}
          <p className="mt-2 text-xs leading-relaxed text-neutral-500">
            Este texto se muestra en la galería pública. Las observaciones de visita (Notas) siguen
            siendo privadas.
          </p>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
          <label className={appAuthLabelClass} htmlFor="school-public-info-draft">
            Información de la escuela
          </label>
          <textarea
            id="school-public-info-draft"
            className="min-h-[12rem] w-full resize-y rounded-xl border border-surface-border bg-white px-3 py-2.5 text-sm leading-relaxed text-neutral-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            value={draft}
            maxLength={MAX_LENGTH}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              'Ejemplo:\nAño de fundación: 1952\nBreve historia o datos de interés para quien visita la galería…'
            }
          />
          <p className="text-right text-[11px] text-neutral-400">{remaining} caracteres</p>
          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-surface-border px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`${plannerBtnSecondary} min-h-11 w-full justify-center sm:w-auto`}
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            className={`${plannerBtnPrimary} min-h-11 w-full justify-center sm:w-auto`}
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar info'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
