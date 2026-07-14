'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaFilePdf, FaTimes, FaTrash } from 'react-icons/fa';
import {
  appAuthLabelClass,
  plannerBtnPrimary,
  plannerBtnSecondary,
} from '@/styles/ui';
import { useAuth } from '@/contexts/AuthContext';
import {
  createPaysanduSchoolComment,
  deletePaysanduSchoolComment,
  fetchPaysanduSchoolComments,
} from '@/services/paysandu-school-comments';
import type { PaysanduSchoolComment } from '@/types/paysandu-school-comment';
import { exportPaysanduSchoolCommentsPdf } from '@/utils/export-paysandu-school-comments-pdf';

const MAX_LENGTH = 2000;

function formatCommentDate(iso: string): string {
  return new Intl.DateTimeFormat('es-UY', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

type Props = {
  open: boolean;
  schoolNumber: number | null;
  onClose: () => void;
};

function authorLabelFromProfile(
  profile: { nombre: string | null; apellido: string | null; username: string } | null,
): string {
  if (!profile) return 'Yo';
  const full = [profile.nombre, profile.apellido].filter(Boolean).join(' ').trim();
  return full || profile.username || 'Yo';
}

export default function PaysanduSchoolCommentsModal({ open, schoolNumber, onClose }: Props) {
  const { profile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [comments, setComments] = useState<PaysanduSchoolComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadComments = useCallback(async () => {
    if (schoolNumber == null) return;
    setLoading(true);
    setError(null);
    const result = await fetchPaysanduSchoolComments(schoolNumber);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      setComments([]);
      return;
    }
    setComments(result.comments);
  }, [schoolNumber]);

  useEffect(() => {
    if (!open || schoolNumber == null) return;
    setDraft('');
    setError(null);
    void loadComments();
  }, [open, schoolNumber, loadComments]);

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

  const handleSubmit = async () => {
    if (schoolNumber == null) return;
    const text = draft.trim();
    if (!text) {
      setError('Escribí una observación antes de guardar.');
      return;
    }

    setSaving(true);
    setError(null);
    const result = await createPaysanduSchoolComment(schoolNumber, text);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setDraft('');
    setComments((prev) => [
      { ...result.comment, author_label: authorLabelFromProfile(profile) },
      ...prev,
    ]);
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('¿Eliminar este comentario?')) return;

    setDeletingId(commentId);
    setError(null);
    const result = await deletePaysanduSchoolComment(commentId);
    setDeletingId(null);

    if (!result.ok) {
      setError(result.error ?? 'No se pudo eliminar.');
      return;
    }

    setComments((prev) => prev.filter((c) => c.id !== commentId));
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
      aria-labelledby="school-comments-title"
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
          <h3 id="school-comments-title" className="text-lg font-bold text-neutral-800">
            Observaciones — Escuela Nº {schoolNumber}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Notas de visita u observaciones internas. Solo visible para admin y coordinador PAE.
          </p>
          <button
            type="button"
            onClick={() => exportPaysanduSchoolCommentsPdf(schoolNumber, comments)}
            disabled={loading || comments.length === 0}
            className={`${plannerBtnSecondary} mt-3 w-full justify-center text-xs sm:w-auto sm:text-sm disabled:opacity-40`}
            title={comments.length === 0 ? 'No hay observaciones para imprimir' : undefined}
          >
            <FaFilePdf />
            Imprimir PDF
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {error ? (
            <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="py-6 text-center text-sm text-neutral-500">Cargando comentarios…</p>
          ) : comments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-center text-sm text-neutral-500">
              Todavía no hay observaciones para esta escuela.
            </p>
          ) : (
            <ul className="space-y-3">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-xl border border-surface-border bg-neutral-50/80 px-3 py-3 sm:px-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap break-words">
                        {comment.body}
                      </p>
                      <p className="mt-2 text-[11px] text-neutral-500">
                        <span className="font-semibold text-neutral-600">{comment.author_label}</span>
                        {' · '}
                        {formatCommentDate(comment.created_at)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDelete(comment.id)}
                      disabled={deletingId === comment.id}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40"
                      title="Eliminar comentario"
                      aria-label="Eliminar comentario"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-surface-border bg-white px-5 py-4">
          <label className={appAuthLabelClass} htmlFor="school-comment-draft">
            Nueva observación
          </label>
          <textarea
            id="school-comment-draft"
            rows={3}
            maxLength={MAX_LENGTH}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ej.: No tiene cocina habilitada."
            className="mt-1 w-full resize-y rounded-xl border border-surface-border bg-white px-3 py-2.5 text-sm text-neutral-800 placeholder:text-neutral-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-1 flex items-center justify-between gap-2 text-[11px] text-neutral-400">
            <span>{remaining} caracteres restantes</span>
          </div>
          <div className="mt-3 flex flex-wrap justify-end gap-2">
            <button type="button" onClick={onClose} disabled={saving} className={plannerBtnSecondary}>
              Cerrar
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={saving || !draft.trim()}
              className={`${plannerBtnPrimary} disabled:opacity-40`}
            >
              {saving ? 'Guardando…' : 'Guardar observación'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
