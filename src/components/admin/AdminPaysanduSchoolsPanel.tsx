'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaComment, FaExternalLinkAlt, FaFilePdf, FaInfoCircle, FaPlus, FaSave, FaSearch, FaSearchPlus, FaSyncAlt, FaTimes, FaTrash } from 'react-icons/fa';
import {
  appAuthInputClass,
  appAuthLabelClass,
  appAuthSelectClass,
  appPanelClass,
  adminMobileFieldLabelClass,
  adminToolbarBtnClass,
  adminToolbarBtnSecondaryClass,
  adminToolbarFieldClass,
  adminToolbarPanelClass,
  plannerBtnPrimary,
  plannerBtnSecondary,
} from '@/styles/ui';
import {
  COMENSALES_SECUNDARIA_SELECT_OPTIONS,
  PAYSANDU_SCHOOL_AREA_LABELS,
  PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_LABELS,
  PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_ORDER,
  PAYSANDU_SCHOOL_EXPORT_FILTER_LABELS,
  PAYSANDU_SCHOOL_SERVICIO_ADMIN_LABELS,
  PAYSANDU_SCHOOL_SERVICIO_LABELS,
  PAYSANDU_SCHOOL_TIPO_LABELS,
  comensalesSecundariaFromSelect,
  comensalesSecundariaSelectValue,
} from '@/constants/paysandu-school-labels';
import PaysanduSchoolCommentsModal from '@/components/admin/PaysanduSchoolCommentsModal';
import PaysanduSchoolPublicInfoModal from '@/components/admin/PaysanduSchoolPublicInfoModal';
import PublicPaysanduSchoolsGalleryLinkSection from '@/components/admin/PublicPaysanduSchoolsGalleryLinkSection';
import {
  adminCreatePaysanduSchool,
  adminDeletePaysanduSchool,
  adminUpdatePaysanduSchool,
  fetchAdminPaysanduSchools,
} from '@/services/paysandu-schools';
import {
  adminSetPaysanduSchoolMapsUrl,
  getPaysanduFacadePublicUrl,
  isValidGoogleMapsUrl,
  removePaysanduSchoolFacade,
  uploadPaysanduSchoolFacade,
} from '@/services/paysandu-school-media';
import type {
  PaysanduSchoolArea,
  PaysanduSchoolComensalSecundaria,
  PaysanduSchoolExportFilter,
  PaysanduSchoolRow,
  PaysanduSchoolServicio,
  PaysanduSchoolTipo,
} from '@/types/paysandu-school';
import { exportPaysanduSchoolsPdf } from '@/utils/export-paysandu-schools-pdf';
import { matchesExportFilter } from '@/utils/paysandu-school-catalog';
import {
  buildComedorPairPatches,
  getComedorAdministradoPor,
  getComedorPartner,
} from '@/utils/paysandu-school-comedor';

type DraftRow = PaysanduSchoolRow & { dirty?: boolean };

const EXPORT_FILTERS = Object.keys(PAYSANDU_SCHOOL_EXPORT_FILTER_LABELS) as PaysanduSchoolExportFilter[];

function emptyToNull<T extends string>(value: string): T | null {
  return (value || null) as T | null;
}

function normalizeSchoolNombre(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
}

function schoolMatchesSearch(row: DraftRow, rawQuery: string): boolean {
  const query = rawQuery.trim();
  if (!query) return true;

  const qLower = query.toLowerCase();

  if (/^\d+$/.test(query)) {
    return String(row.school_number).startsWith(query);
  }

  const nombre = row.nombre?.trim().toLowerCase() ?? '';
  if (nombre.includes(qLower)) return true;

  return String(row.school_number).includes(query);
}

const fieldSelectClass =
  'w-full min-w-0 rounded-md border border-surface-border bg-white px-2.5 py-2.5 text-sm leading-snug min-h-[2.75rem] sm:min-h-0 sm:px-2.5 sm:py-2 sm:text-sm';

/** Fila 1 en PC: ya no se usa como grilla de tabla; se mantiene por compatibilidad mínima. */
const DESKTOP_FIELDS_GRID =
  'grid grid-cols-2 gap-x-4 gap-y-3 xl:grid-cols-3';

const desktopFieldLabelClass =
  'mb-1 block text-[10px] font-semibold uppercase tracking-wide text-neutral-500';

const desktopSectionTitleClass =
  'mb-2 text-[11px] font-bold uppercase tracking-wide text-neutral-500';

type SchoolRowActionsProps = {
  schoolNumber: number;
  dirty: boolean;
  saving: boolean;
  deleting: boolean;
  onOpenComments: () => void;
  onOpenInfo: () => void;
  onSave: () => void;
  onDelete: () => void;
  className?: string;
};

function SchoolRowActions({
  schoolNumber,
  dirty,
  saving,
  deleting,
  onOpenComments,
  onOpenInfo,
  onSave,
  onDelete,
  className = '',
}: SchoolRowActionsProps) {
  const baseBtnClass =
    'inline-flex items-center justify-center gap-1.5 rounded-lg border font-semibold transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40';
  const mobileBtnClass = `${baseBtnClass} min-h-[2.75rem] w-full flex-col gap-1 px-1.5 py-2 text-[10px] leading-tight sm:h-9 sm:w-auto sm:flex-row sm:px-3 sm:py-0 sm:text-xs`;

  return (
    <div
      className={`grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-2 ${className}`}
    >
      <button
        type="button"
        onClick={onOpenInfo}
        className={`${mobileBtnClass} border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm hover:border-emerald-300 hover:bg-emerald-100`}
        title="Información pública para la galería"
        aria-label={`Info pública escuela ${schoolNumber}`}
      >
        <FaInfoCircle className="text-sm text-emerald-700 sm:text-[13px]" aria-hidden />
        <span>Info</span>
      </button>
      <button
        type="button"
        onClick={onOpenComments}
        className={`${mobileBtnClass} border-surface-border bg-white text-neutral-700 shadow-sm hover:border-neutral-300 hover:bg-neutral-50`}
        title="Observaciones de visita"
        aria-label={`Observaciones escuela ${schoolNumber}`}
      >
        <FaComment className="text-sm text-sky-600 sm:text-[13px]" aria-hidden />
        <span>Notas</span>
      </button>
      <button
        type="button"
        disabled={!dirty || saving || deleting}
        onClick={onSave}
        className={`${mobileBtnClass} border-primary/30 bg-primary/10 text-primary-dark hover:bg-primary/20`}
        title={dirty ? 'Guardar cambios' : 'Sin cambios'}
      >
        <FaSave className="text-sm sm:text-[13px]" aria-hidden />
        <span>Guardar</span>
      </button>
      <button
        type="button"
        disabled={saving || deleting}
        onClick={onDelete}
        className={`${mobileBtnClass} border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50`}
        title="Eliminar escuela"
        aria-label={`Eliminar escuela ${schoolNumber}`}
      >
        <FaTrash className="text-sm sm:text-[13px]" aria-hidden />
        <span>Eliminar</span>
      </button>
    </div>
  );
}

type ComensalesSecundariaSelectProps = {
  value: PaysanduSchoolComensalSecundaria[];
  schoolNumber: number;
  onChange: (next: PaysanduSchoolComensalSecundaria[]) => void;
};

function ComensalesSecundariaSelect({
  value,
  schoolNumber,
  onChange,
}: ComensalesSecundariaSelectProps) {
  return (
    <select
      className={fieldSelectClass}
      aria-label={`Secundaria escuela ${schoolNumber}`}
      value={comensalesSecundariaSelectValue(value)}
      onChange={(e) => onChange(comensalesSecundariaFromSelect(e.target.value))}
    >
      {COMENSALES_SECUNDARIA_SELECT_OPTIONS.map((opt) => (
        <option key={opt.value || 'none'} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

type SchoolFacadeMapsFieldsProps = {
  row: DraftRow;
  uploading: boolean;
  onUpdateMapsUrl: (url: string | null) => void;
  onFacadeSynced: (row: PaysanduSchoolRow) => void;
  onError: (message: string) => void;
  onUploadingChange: (uploading: boolean) => void;
  /** full = móvil; photo = solo miniatura PC; maps = solo URL PC */
  variant?: 'full' | 'photo' | 'maps';
};

function SchoolFacadeMapsFields({
  row,
  uploading,
  onUpdateMapsUrl,
  onFacadeSynced,
  onError,
  onUploadingChange,
  variant = 'full',
}: SchoolFacadeMapsFieldsProps) {
  const photoUrl = getPaysanduFacadePublicUrl(row.facade_photo_path);
  const mapsUrl = row.google_maps_url?.trim() || '';
  const [isZoomed, setIsZoomed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isZoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsZoomed(false);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [isZoomed]);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    onUploadingChange(true);
    onError('');
    const result = await uploadPaysanduSchoolFacade(
      row.school_number,
      file,
      row.facade_photo_path,
    );
    onUploadingChange(false);
    if (!result.ok || !result.row) {
      onError(result.error ?? 'No se pudo subir la foto.');
      return;
    }
    onFacadeSynced(result.row);
  };

  const handleRemovePhoto = async () => {
    if (!window.confirm(`¿Quitar la foto de fachada de la escuela Nº ${row.school_number}?`)) {
      return;
    }
    onUploadingChange(true);
    onError('');
    const result = await removePaysanduSchoolFacade(row.school_number, row.facade_photo_path);
    onUploadingChange(false);
    if (!result.ok || !result.row) {
      onError(result.error ?? 'No se pudo quitar la foto.');
      return;
    }
    onFacadeSynced(result.row);
  };

  const zoomModal =
    mounted &&
    isZoomed &&
    photoUrl &&
    createPortal(
      <div
        className="fixed inset-0 z-[250] flex flex-col items-center justify-center px-4 py-8 touch-manipulation"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.94)' }}
        onClick={() => setIsZoomed(false)}
        role="dialog"
        aria-modal="true"
        aria-label={`Fachada ampliada escuela ${row.school_number}`}
      >
        <button
          type="button"
          className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-neutral-900 text-white shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            setIsZoomed(false);
          }}
          aria-label="Cerrar"
        >
          <FaTimes size={20} />
        </button>
        <p className="mb-3 max-w-sm text-center text-xs font-semibold text-amber-100">
          Tocá el fondo oscuro para cerrar
        </p>
        <div
          className="relative mx-auto flex max-h-[min(70vh,560px)] w-full max-w-3xl items-center justify-center overflow-hidden rounded-xl bg-neutral-950"
          onClick={(e) => e.stopPropagation()}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt={`Fachada escuela ${row.school_number}`}
            className="max-h-[min(70vh,560px)] w-auto max-w-full object-contain"
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-white">
          Escuela Nº {row.school_number}
          {row.nombre?.trim() ? ` · ${row.nombre.trim()}` : ''}
        </p>
      </div>,
      document.body,
    );

  const photoBlock = (
    <div className={`flex flex-col gap-2 ${variant === 'photo' ? 'w-full' : 'items-center'}`}>
      <div
        className={`relative overflow-hidden rounded-lg border border-surface-border bg-neutral-100 ${
          variant === 'photo' ? 'aspect-[4/3] w-full' : 'h-28 w-full max-w-[9rem] sm:h-28 sm:max-w-none sm:w-full'
        }`}
      >
        {photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={`Fachada escuela ${row.school_number}`}
              className="h-full w-full cursor-zoom-in object-cover"
              onClick={() => setIsZoomed(true)}
            />
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="absolute right-1.5 top-1.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary-dark text-white shadow-md"
              title="Ampliar imagen"
              aria-label={`Ampliar foto escuela ${row.school_number}`}
            >
              <FaSearchPlus className="text-xs" aria-hidden />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center px-2 text-center text-[11px] leading-snug text-neutral-400">
            Sin foto
          </div>
        )}
      </div>
      <label className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-primary/30 bg-primary/10 px-2 py-1.5 text-[11px] font-semibold text-primary-dark hover:bg-primary/20">
        {uploading ? 'Subiendo…' : photoUrl ? 'Cambiar foto' : 'Subir foto'}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            void handleFile(file);
          }}
        />
      </label>
      {photoUrl ? (
        <button
          type="button"
          disabled={uploading}
          onClick={() => void handleRemovePhoto()}
          className="text-[11px] font-medium text-red-600 hover:underline disabled:opacity-40"
        >
          Quitar foto
        </button>
      ) : null}
      {zoomModal}
    </div>
  );

  const mapsBlock = (
    <div className="min-w-0 space-y-1.5">
      {variant !== 'maps' ? (
        <span className={adminMobileFieldLabelClass}>Google Maps</span>
      ) : (
        <span className={desktopFieldLabelClass}>Google Maps</span>
      )}
      <div className="flex gap-2">
        <input
          type="url"
          className={fieldSelectClass}
          value={mapsUrl}
          onChange={(e) => onUpdateMapsUrl(e.target.value === '' ? null : e.target.value)}
          placeholder="https://maps.app.goo.gl/… o https://www.google.com/maps/…"
          aria-label={`Google Maps escuela ${row.school_number}`}
          maxLength={500}
        />
        {mapsUrl && isValidGoogleMapsUrl(mapsUrl) ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-[2.75rem] w-11 shrink-0 items-center justify-center rounded-md border border-surface-border bg-white text-sky-600 hover:bg-sky-50 sm:h-auto sm:min-h-[2.5rem]"
            title="Abrir en Google Maps"
            aria-label={`Abrir Google Maps escuela ${row.school_number}`}
          >
            <FaExternalLinkAlt className="text-xs" aria-hidden />
          </a>
        ) : null}
      </div>
      {variant === 'full' ? (
        <p className="text-[11px] leading-snug text-neutral-500">
          Pegá el enlace de Maps. La foto se comprime al subir (~150 KB).
        </p>
      ) : null}
    </div>
  );

  if (variant === 'photo') return photoBlock;
  if (variant === 'maps') return mapsBlock;

  return (
    <div className="grid gap-3 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-3">
      {photoBlock}
      {mapsBlock}
    </div>
  );
}

type ComedorParAdminFieldProps = {
  row: DraftRow;
  allRows: DraftRow[];
  onPartnerLink: (partner: number | null) => void;
  onAdminChange: (admin: number | null) => void;
};

function ComedorParAdminField({
  row,
  allRows,
  onPartnerLink,
  onAdminChange,
}: ComedorParAdminFieldProps) {
  const partner = getComedorPartner(row.school_number, allRows);
  const admin = getComedorAdministradoPor(row, partner);

  if (partner != null) {
    const pairNumbers = [row.school_number, partner].sort((a, b) => a - b);
    return (
      <select
        className={fieldSelectClass}
        aria-label={`Administrador comedor escuela ${row.school_number}`}
        title="Quién administra el comedor (solo las 2 escuelas del par; podés invertir cada año)"
        value={admin ?? ''}
        onChange={(e) => {
          const raw = e.target.value.trim();
          onAdminChange(raw ? Number(raw) : null);
        }}
      >
        <option value="">— elegir —</option>
        {pairNumbers.map((n) => (
          <option key={n} value={n}>
            Nº {n} administra
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type="number"
      min={1}
      max={999}
      className={`${fieldSelectClass} w-full min-w-[2.5rem]`}
      value={row.comparte_comedor_con ?? ''}
      onChange={(e) => {
        const raw = e.target.value.trim();
        onPartnerLink(raw ? Number(raw) : null);
      }}
      placeholder="Nº pareja"
      aria-label={`Vincular comedor compartido escuela ${row.school_number}`}
      title="Nº de la escuela pareja (al vincular, elegís quién administra)"
    />
  );
}

type SchoolRowProps = {
  row: DraftRow;
  allRows: DraftRow[];
  saving: boolean;
  deleting: boolean;
  uploadingFacade: boolean;
  onUpdate: (patch: Partial<DraftRow>) => void;
  onComedorPartnerLink: (partner: number | null) => void;
  onComedorAdminChange: (admin: number | null) => void;
  onSave: () => void;
  onDelete: () => void;
  onOpenComments: () => void;
  onOpenInfo: () => void;
  onFacadeSynced: (row: PaysanduSchoolRow) => void;
  onError: (message: string) => void;
  onUploadingFacadeChange: (uploading: boolean) => void;
};

function SchoolEditRow({
  row,
  allRows,
  saving,
  deleting,
  uploadingFacade,
  onUpdate,
  onComedorPartnerLink,
  onComedorAdminChange,
  onSave,
  onDelete,
  onOpenComments,
  onOpenInfo,
  onFacadeSynced,
  onError,
  onUploadingFacadeChange,
}: SchoolRowProps) {
  const cardSurfaceClass = row.dirty
    ? 'border-sky-400 bg-sky-50/50 ring-2 ring-sky-200'
    : 'border-neutral-300 bg-white';

  const mediaProps = {
    row,
    uploading: uploadingFacade,
    onUpdateMapsUrl: (google_maps_url: string | null) => onUpdate({ google_maps_url }),
    onFacadeSynced,
    onError,
    onUploadingChange: onUploadingFacadeChange,
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border-2 shadow-lg sm:mb-0 sm:border sm:shadow-md ${cardSurfaceClass}`}
    >
      {/* ── Móvil ── */}
      <div className="flex flex-col gap-3.5 p-3.5 sm:hidden">
        <div className="rounded-xl bg-neutral-800 px-3 py-2.5 text-white">
          <p className="text-base font-bold">Escuela Nº {row.school_number}</p>
          {row.nombre?.trim() ? (
            <p className="mt-0.5 text-xs font-medium text-neutral-300">{row.nombre.trim()}</p>
          ) : null}
        </div>
        <div>
          <SchoolRowActions
            schoolNumber={row.school_number}
            dirty={!!row.dirty}
            saving={saving}
            deleting={deleting}
            onOpenComments={onOpenComments}
            onOpenInfo={onOpenInfo}
            onSave={onSave}
            onDelete={onDelete}
          />
        </div>

        <SchoolFacadeMapsFields {...mediaProps} variant="full" />

        <div className="min-w-0">
          <span className={adminMobileFieldLabelClass}>Localidad</span>
          <input
            type="text"
            className={fieldSelectClass}
            value={row.nombre ?? ''}
            onChange={(e) =>
              onUpdate({ nombre: e.target.value === '' ? null : e.target.value })
            }
            placeholder="Localidad (ej. Sauce de Buricayupí)"
            aria-label={`Localidad escuela ${row.school_number}`}
            maxLength={120}
          />
        </div>

        <div className="min-w-0">
          <span className={adminMobileFieldLabelClass}>Área</span>
          <select
            className={fieldSelectClass}
            aria-label={`Área escuela ${row.school_number}`}
            value={row.area ?? ''}
            onChange={(e) => onUpdate({ area: emptyToNull<PaysanduSchoolArea>(e.target.value) })}
          >
            <option value="">—</option>
            {(Object.keys(PAYSANDU_SCHOOL_AREA_LABELS) as PaysanduSchoolArea[]).map((k) => (
              <option key={k} value={k}>
                {PAYSANDU_SCHOOL_AREA_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <span className={adminMobileFieldLabelClass}>Tipo</span>
          <select
            className={fieldSelectClass}
            aria-label={`Tipo escuela ${row.school_number}`}
            value={row.tipo ?? ''}
            onChange={(e) => onUpdate({ tipo: emptyToNull<PaysanduSchoolTipo>(e.target.value) })}
          >
            <option value="">—</option>
            {(Object.keys(PAYSANDU_SCHOOL_TIPO_LABELS) as PaysanduSchoolTipo[]).map((k) => (
              <option key={k} value={k}>
                {PAYSANDU_SCHOOL_TIPO_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <span className={adminMobileFieldLabelClass}>Servicio</span>
          <select
            className={fieldSelectClass}
            aria-label={`Servicio escuela ${row.school_number}`}
            value={row.servicio_alimentacion ?? ''}
            onChange={(e) =>
              onUpdate({
                servicio_alimentacion: emptyToNull<PaysanduSchoolServicio>(e.target.value),
              })
            }
          >
            <option value="">—</option>
            {(Object.keys(PAYSANDU_SCHOOL_SERVICIO_LABELS) as PaysanduSchoolServicio[]).map((k) => (
              <option key={k} value={k}>
                {PAYSANDU_SCHOOL_SERVICIO_ADMIN_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0">
          <span className={adminMobileFieldLabelClass}>Secundaria</span>
          <ComensalesSecundariaSelect
            value={row.comensales_secundaria ?? []}
            schoolNumber={row.school_number}
            onChange={(comensales_secundaria) => onUpdate({ comensales_secundaria })}
          />
        </div>

        <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-3 rounded-lg border border-surface-border/70 bg-white px-3 py-2.5 shadow-sm">
          <input
            type="checkbox"
            className="h-5 w-5 shrink-0 cursor-pointer"
            checked={row.recibe_partida_agua_mineral}
            onChange={(e) => onUpdate({ recibe_partida_agua_mineral: e.target.checked })}
            aria-label={`Agua mineral escuela ${row.school_number}`}
          />
          <span className="text-sm font-medium text-neutral-700">Partida agua mineral</span>
        </label>

        <div className="min-w-0">
          <span className={adminMobileFieldLabelClass}>Comedor compartido</span>
          <ComedorParAdminField
            row={row}
            allRows={allRows}
            onPartnerLink={onComedorPartnerLink}
            onAdminChange={onComedorAdminChange}
          />
        </div>
      </div>

      {/* ── PC: ficha con cabecera + cuerpo en columnas ── */}
      <div className="hidden sm:block">
        <header className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-neutral-50/90 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="inline-flex h-10 min-w-[3rem] items-center justify-center rounded-xl bg-neutral-800 px-2.5 text-base font-extrabold tabular-nums text-white">
              {row.school_number}
            </span>
            <div className="min-w-0 flex-1">
              <span className={desktopFieldLabelClass}>Localidad</span>
              <input
                type="text"
                className={`${fieldSelectClass} max-w-md bg-white font-medium`}
                value={row.nombre ?? ''}
                onChange={(e) =>
                  onUpdate({ nombre: e.target.value === '' ? null : e.target.value })
                }
                placeholder="Localidad"
                aria-label={`Localidad escuela ${row.school_number}`}
                maxLength={120}
              />
            </div>
            {row.dirty ? (
              <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold text-sky-800">
                Sin guardar
              </span>
            ) : null}
          </div>
          <SchoolRowActions
            schoolNumber={row.school_number}
            dirty={!!row.dirty}
            saving={saving}
            deleting={deleting}
            onOpenComments={onOpenComments}
            onOpenInfo={onOpenInfo}
            onSave={onSave}
            onDelete={onDelete}
            className="justify-end"
          />
        </header>

        <div className="grid gap-5 p-4 lg:grid-cols-[11rem_minmax(0,1fr)]">
          <aside className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/60 p-3">
            <p className={desktopSectionTitleClass}>Fachada</p>
            <SchoolFacadeMapsFields {...mediaProps} variant="photo" />
          </aside>

          <div className="min-w-0 space-y-4">
            <section>
              <p className={desktopSectionTitleClass}>Datos de la escuela</p>
              <div className={DESKTOP_FIELDS_GRID}>
                <div className="min-w-0">
                  <span className={desktopFieldLabelClass}>Área</span>
                  <select
                    className={fieldSelectClass}
                    aria-label={`Área escuela ${row.school_number}`}
                    value={row.area ?? ''}
                    onChange={(e) =>
                      onUpdate({ area: emptyToNull<PaysanduSchoolArea>(e.target.value) })
                    }
                  >
                    <option value="">—</option>
                    {(Object.keys(PAYSANDU_SCHOOL_AREA_LABELS) as PaysanduSchoolArea[]).map(
                      (k) => (
                        <option key={k} value={k}>
                          {PAYSANDU_SCHOOL_AREA_LABELS[k]}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="min-w-0">
                  <span className={desktopFieldLabelClass}>Tipo</span>
                  <select
                    className={fieldSelectClass}
                    aria-label={`Tipo escuela ${row.school_number}`}
                    value={row.tipo ?? ''}
                    onChange={(e) =>
                      onUpdate({ tipo: emptyToNull<PaysanduSchoolTipo>(e.target.value) })
                    }
                  >
                    <option value="">—</option>
                    {(Object.keys(PAYSANDU_SCHOOL_TIPO_LABELS) as PaysanduSchoolTipo[]).map(
                      (k) => (
                        <option key={k} value={k}>
                          {PAYSANDU_SCHOOL_TIPO_LABELS[k]}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="min-w-0">
                  <span className={desktopFieldLabelClass}>Servicio</span>
                  <select
                    className={fieldSelectClass}
                    aria-label={`Servicio escuela ${row.school_number}`}
                    value={row.servicio_alimentacion ?? ''}
                    onChange={(e) =>
                      onUpdate({
                        servicio_alimentacion: emptyToNull<PaysanduSchoolServicio>(
                          e.target.value,
                        ),
                      })
                    }
                  >
                    <option value="">—</option>
                    {(Object.keys(PAYSANDU_SCHOOL_SERVICIO_LABELS) as PaysanduSchoolServicio[]).map(
                      (k) => (
                        <option key={k} value={k}>
                          {PAYSANDU_SCHOOL_SERVICIO_ADMIN_LABELS[k]}
                        </option>
                      ),
                    )}
                  </select>
                </div>

                <div className="min-w-0">
                  <span className={desktopFieldLabelClass}>Secundaria</span>
                  <ComensalesSecundariaSelect
                    value={row.comensales_secundaria ?? []}
                    schoolNumber={row.school_number}
                    onChange={(comensales_secundaria) => onUpdate({ comensales_secundaria })}
                  />
                </div>

                <div className="min-w-0">
                  <span className={desktopFieldLabelClass}>Comedor compartido</span>
                  <ComedorParAdminField
                    row={row}
                    allRows={allRows}
                    onPartnerLink={onComedorPartnerLink}
                    onAdminChange={onComedorAdminChange}
                  />
                </div>

                <label className="flex min-h-[2.75rem] cursor-pointer items-center gap-2.5 self-end rounded-lg border border-surface-border bg-white px-3 py-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 cursor-pointer"
                    checked={row.recibe_partida_agua_mineral}
                    onChange={(e) => onUpdate({ recibe_partida_agua_mineral: e.target.checked })}
                    aria-label={`Agua mineral escuela ${row.school_number}`}
                  />
                  <span className="text-sm font-medium text-neutral-700">Agua mineral</span>
                </label>
              </div>
            </section>

            <section className="rounded-xl border border-neutral-100 bg-neutral-50/50 p-3">
              <p className={desktopSectionTitleClass}>Ubicación</p>
              <SchoolFacadeMapsFields {...mediaProps} variant="maps" />
            </section>
          </div>
        </div>
      </div>
    </article>
  );
}

const emptyDraft = (): DraftRow => ({
  school_number: 0,
  departamento: 'Paysandú',
  nombre: null,
  area: null,
  tipo: null,
  servicio_alimentacion: null,
  recibe_partida_agua_mineral: false,
  comparte_comedor_con: null,
  comedor_administrado_por: null,
  comensales_secundaria: [],
  facade_photo_path: null,
  google_maps_url: null,
  public_info: null,
  dirty: true,
});

type AddSchoolModalProps = {
  open: boolean;
  draft: DraftRow;
  saving: boolean;
  usedNumbers: Set<number>;
  onChange: (patch: Partial<DraftRow>) => void;
  onClose: () => void;
  onCreate: () => void;
};

function AddSchoolModal({
  open,
  draft,
  saving,
  usedNumbers,
  onChange,
  onClose,
  onCreate,
}: AddSchoolModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const numberTaken =
    draft.school_number > 0 && usedNumbers.has(draft.school_number);
  const numberInvalid = draft.school_number < 1 || draft.school_number > 999;
  const canCreate = !saving && !numberInvalid && !numberTaken;

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[250] flex items-end justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8 sm:items-center sm:px-4 sm:py-8"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-school-title"
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl"
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
          <h3 id="add-school-title" className="text-lg font-bold text-neutral-800">
            Agregar escuela
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            El número de escuela no se puede cambiar después de crearla.
          </p>
        </div>

        <div className="space-y-3 overflow-y-auto px-5 py-4">
          <div>
            <label className={appAuthLabelClass} htmlFor="new-school-number">
              Nº de escuela
            </label>
            <input
              id="new-school-number"
              type="number"
              min={1}
              max={999}
              className={appAuthSelectClass}
              value={draft.school_number || ''}
              onChange={(e) => {
                const raw = e.target.value.trim();
                onChange({ school_number: raw ? Number(raw) : 0 });
              }}
              placeholder="Ej. 118"
            />
            {numberTaken ? (
              <p className="mt-1 text-xs text-red-600">
                Ya existe la escuela Nº {draft.school_number} en el listado.
              </p>
            ) : numberInvalid && draft.school_number !== 0 ? (
              <p className="mt-1 text-xs text-red-600">Indicá un número entre 1 y 999.</p>
            ) : null}
          </div>

          <div>
            <label className={appAuthLabelClass} htmlFor="new-school-localidad">
              Localidad
            </label>
            <input
              id="new-school-localidad"
              type="text"
              className={appAuthSelectClass}
              value={draft.nombre ?? ''}
              onChange={(e) =>
                onChange({ nombre: e.target.value === '' ? null : e.target.value })
              }
              placeholder="Ej. Sauce de Buricayupí"
              maxLength={120}
            />
          </div>

          <div>
            <label className={appAuthLabelClass} htmlFor="new-school-maps">
              Google Maps (opcional)
            </label>
            <input
              id="new-school-maps"
              type="url"
              className={appAuthSelectClass}
              value={draft.google_maps_url ?? ''}
              onChange={(e) =>
                onChange({
                  google_maps_url: e.target.value === '' ? null : e.target.value,
                })
              }
              placeholder="https://maps.app.goo.gl/…"
              maxLength={500}
            />
            <p className="mt-1 text-xs text-neutral-500">
              La foto de fachada se puede subir después de crear la escuela.
            </p>
          </div>

          <div>
            <label className={appAuthLabelClass} htmlFor="new-school-area">
              Área
            </label>
            <select
              id="new-school-area"
              className={appAuthSelectClass}
              value={draft.area ?? ''}
              onChange={(e) => onChange({ area: emptyToNull<PaysanduSchoolArea>(e.target.value) })}
            >
              <option value="">— Sin definir —</option>
              {(Object.keys(PAYSANDU_SCHOOL_AREA_LABELS) as PaysanduSchoolArea[]).map((k) => (
                <option key={k} value={k}>
                  {PAYSANDU_SCHOOL_AREA_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={appAuthLabelClass} htmlFor="new-school-tipo">
              Tipo
            </label>
            <select
              id="new-school-tipo"
              className={appAuthSelectClass}
              value={draft.tipo ?? ''}
              onChange={(e) => onChange({ tipo: emptyToNull<PaysanduSchoolTipo>(e.target.value) })}
            >
              <option value="">— Sin definir —</option>
              {(Object.keys(PAYSANDU_SCHOOL_TIPO_LABELS) as PaysanduSchoolTipo[]).map((k) => (
                <option key={k} value={k}>
                  {PAYSANDU_SCHOOL_TIPO_LABELS[k]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={appAuthLabelClass} htmlFor="new-school-servicio">
              Servicio de alimentación
            </label>
            <select
              id="new-school-servicio"
              className={appAuthSelectClass}
              value={draft.servicio_alimentacion ?? ''}
              onChange={(e) =>
                onChange({
                  servicio_alimentacion: emptyToNull<PaysanduSchoolServicio>(e.target.value),
                })
              }
            >
              <option value="">— Sin definir —</option>
              {(Object.keys(PAYSANDU_SCHOOL_SERVICIO_LABELS) as PaysanduSchoolServicio[]).map(
                (k) => (
                  <option key={k} value={k}>
                    {PAYSANDU_SCHOOL_SERVICIO_LABELS[k]}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className={appAuthLabelClass} htmlFor="new-school-secundaria">
              Secundaria (CBR / Liceo / UTU / CEI)
            </label>
            <select
              id="new-school-secundaria"
              className={appAuthSelectClass}
              value={comensalesSecundariaSelectValue(draft.comensales_secundaria)}
              onChange={(e) =>
                onChange({
                  comensales_secundaria: comensalesSecundariaFromSelect(e.target.value),
                })
              }
            >
              {COMENSALES_SECUNDARIA_SELECT_OPTIONS.map((opt) => (
                <option key={opt.value || 'none'} value={opt.value}>
                  {opt.label === '—' ? '— Ninguno —' : opt.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Elegí una sola opción: CBR, Liceo, UTU o CEI (no se pueden combinar).
            </p>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-2.5 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={draft.recibe_partida_agua_mineral}
              onChange={(e) => onChange({ recibe_partida_agua_mineral: e.target.checked })}
            />
            <span>Recibe partida agua mineral</span>
          </label>

          <div>
            <label className={appAuthLabelClass} htmlFor="new-school-comedor">
              Comparte comedor con Nº
            </label>
            <input
              id="new-school-comedor"
              type="number"
              min={1}
              max={999}
              className={appAuthSelectClass}
              value={draft.comparte_comedor_con ?? ''}
              onChange={(e) => {
                const raw = e.target.value.trim();
                onChange({ comparte_comedor_con: raw ? Number(raw) : null });
              }}
              placeholder="—"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-2 border-t border-surface-border px-5 py-4">
          <button type="button" onClick={onClose} disabled={saving} className={plannerBtnSecondary}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={onCreate}
            disabled={!canCreate}
            className={`${plannerBtnPrimary} disabled:opacity-40`}
            title={numberTaken ? 'Ese número ya existe' : undefined}
          >
            <FaPlus />
            {saving ? 'Creando…' : 'Crear escuela'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function AdminPaysanduSchoolsPanel() {
  const [rows, setRows] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingNumber, setSavingNumber] = useState<number | null>(null);
  const [deletingNumber, setDeletingNumber] = useState<number | null>(null);
  const [uploadingFacadeNumber, setUploadingFacadeNumber] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addDraft, setAddDraft] = useState<DraftRow>(() => emptyDraft());
  const [exportFilter, setExportFilter] = useState<PaysanduSchoolExportFilter>('todas');

  const [filterArea, setFilterArea] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [filterServicio, setFilterServicio] = useState('');
  const [filterAgua, setFilterAgua] = useState('');
  const [filterComensal, setFilterComensal] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [commentsSchoolNumber, setCommentsSchoolNumber] = useState<number | null>(null);
  const [infoSchoolNumber, setInfoSchoolNumber] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPaysanduSchools();
      setRows(data.map((r) => ({ ...r, dirty: false })));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el listado.');
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (filterArea && r.area !== filterArea) return false;
      if (filterTipo && r.tipo !== filterTipo) return false;
      if (filterServicio && r.servicio_alimentacion !== filterServicio) return false;
      if (filterAgua === 'si' && !r.recibe_partida_agua_mineral) return false;
      if (filterAgua === 'no' && r.recibe_partida_agua_mineral) return false;
      if (filterComensal && !(r.comensales_secundaria ?? []).includes(filterComensal as PaysanduSchoolComensalSecundaria)) {
        return false;
      }
      if (!schoolMatchesSearch(r, searchQuery)) return false;
      return true;
    });
  }, [rows, filterArea, filterTipo, filterServicio, filterAgua, filterComensal, searchQuery]);

  const exportRows = useMemo(
    () => rows.filter((r) => matchesExportFilter(r, exportFilter)),
    [rows, exportFilter],
  );

  const usedSchoolNumbers = useMemo(
    () => new Set(rows.map((r) => r.school_number)),
    [rows],
  );

  const updateRow = (schoolNumber: number, patch: Partial<DraftRow>) => {
    setRows((prev) =>
      prev.map((r) =>
        r.school_number === schoolNumber ? { ...r, ...patch, dirty: true } : r,
      ),
    );
  };

  const linkComedorPartner = (schoolNumber: number, partner: number | null) => {
    updateRow(schoolNumber, {
      comparte_comedor_con: partner,
      comedor_administrado_por: null,
    });
  };

  const changeComedorAdmin = (schoolNumber: number, admin: number | null) => {
    const partner = getComedorPartner(schoolNumber, rows);
    if (partner == null) return;
    const patches = buildComedorPairPatches(schoolNumber, partner, admin);
    setRows((prev) =>
      prev.map((r) => {
        const patch = patches[r.school_number];
        if (!patch) return r;
        return { ...r, ...patch, dirty: true };
      }),
    );
  };

  const rowToPayload = (row: DraftRow) => ({
    school_number: row.school_number,
    area: row.area,
    tipo: row.tipo,
    servicio_alimentacion: row.servicio_alimentacion,
    recibe_partida_agua_mineral: row.recibe_partida_agua_mineral,
    comparte_comedor_con: row.comparte_comedor_con,
    comedor_administrado_por: row.comedor_administrado_por ?? null,
    comensales_secundaria: row.comensales_secundaria ?? [],
    nombre: normalizeSchoolNombre(row.nombre),
  });

  const saveRow = async (row: DraftRow) => {
    if (!isValidGoogleMapsUrl(row.google_maps_url)) {
      setError('La URL de Google Maps no es válida. Debe empezar con https://');
      return;
    }

    setSavingNumber(row.school_number);
    setError(null);

    const partner = getComedorPartner(row.school_number, rows);
    const partnerRow =
      partner != null ? rows.find((r) => r.school_number === partner) : undefined;
    const rowsToSave =
      partnerRow?.dirty && partnerRow.school_number !== row.school_number
        ? [row, partnerRow]
        : [row];

    const saved = new Map<number, PaysanduSchoolRow>();
    for (const draft of rowsToSave) {
      const result = await adminUpdatePaysanduSchool(rowToPayload(draft));
      if (!result.ok) {
        setSavingNumber(null);
        setError(result.error ?? 'No se pudo guardar.');
        return;
      }

      const mapsResult = await adminSetPaysanduSchoolMapsUrl(
        draft.school_number,
        draft.google_maps_url ?? null,
      );
      if (!mapsResult.ok) {
        setSavingNumber(null);
        setError(mapsResult.error ?? 'No se pudo guardar el enlace de Google Maps.');
        return;
      }

      const merged: PaysanduSchoolRow = {
        ...(mapsResult.row ?? result.row!),
        facade_photo_path:
          mapsResult.row?.facade_photo_path ??
          result.row?.facade_photo_path ??
          draft.facade_photo_path ??
          null,
        google_maps_url:
          mapsResult.row?.google_maps_url ?? draft.google_maps_url ?? null,
      };
      saved.set(draft.school_number, merged);
    }

    setSavingNumber(null);
    setRows((prev) =>
      prev.map((r) => {
        const updated = saved.get(r.school_number);
        return updated ? { ...updated, dirty: false } : r;
      }),
    );
  };

  const syncFacadeRow = (updated: PaysanduSchoolRow) => {
    setRows((prev) =>
      prev.map((r) =>
        r.school_number === updated.school_number
          ? {
              ...r,
              facade_photo_path: updated.facade_photo_path ?? null,
              google_maps_url: updated.google_maps_url ?? r.google_maps_url ?? null,
              public_info: updated.public_info ?? r.public_info ?? null,
              dirty: r.dirty,
            }
          : r,
      ),
    );
  };

  const syncPublicInfoRow = (updated: PaysanduSchoolRow) => {
    setRows((prev) =>
      prev.map((r) =>
        r.school_number === updated.school_number
          ? {
              ...r,
              public_info: updated.public_info ?? null,
              dirty: r.dirty,
            }
          : r,
      ),
    );
  };

  const deleteRow = async (row: DraftRow) => {
    if (
      !window.confirm(
        `¿Eliminar la escuela Nº ${row.school_number}? Las referencias de comedor compartido se limpiarán.`,
      )
    ) {
      return;
    }

    setDeletingNumber(row.school_number);
    setError(null);

    if (row.facade_photo_path) {
      await removePaysanduSchoolFacade(row.school_number, row.facade_photo_path);
    }

    const result = await adminDeletePaysanduSchool(row.school_number);
    setDeletingNumber(null);

    if (!result.ok) {
      setError(result.error ?? 'No se pudo eliminar.');
      return;
    }

    setRows((prev) => prev.filter((r) => r.school_number !== row.school_number));
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setAddDraft(emptyDraft());
  };

  const createSchool = async () => {
    if (addDraft.school_number < 1 || addDraft.school_number > 999) {
      setError('Indicá un número de escuela entre 1 y 999.');
      return;
    }
    if (usedSchoolNumbers.has(addDraft.school_number)) {
      setError(`Ya existe la escuela Nº ${addDraft.school_number}.`);
      return;
    }
    if (!isValidGoogleMapsUrl(addDraft.google_maps_url)) {
      setError('La URL de Google Maps no es válida. Debe empezar con https://');
      return;
    }

    setCreating(true);
    setError(null);
    const result = await adminCreatePaysanduSchool({
      school_number: addDraft.school_number,
      area: addDraft.area,
      tipo: addDraft.tipo,
      servicio_alimentacion: addDraft.servicio_alimentacion,
      recibe_partida_agua_mineral: addDraft.recibe_partida_agua_mineral,
      comparte_comedor_con: addDraft.comparte_comedor_con,
      comedor_administrado_por: addDraft.comedor_administrado_por ?? null,
      comensales_secundaria: addDraft.comensales_secundaria ?? [],
      nombre: normalizeSchoolNombre(addDraft.nombre),
    });

    if (!result.ok || !result.row) {
      setCreating(false);
      setError(result.error ?? 'No se pudo crear la escuela.');
      return;
    }

    let created = result.row;
    if (addDraft.google_maps_url?.trim()) {
      const mapsResult = await adminSetPaysanduSchoolMapsUrl(
        addDraft.school_number,
        addDraft.google_maps_url,
      );
      if (!mapsResult.ok) {
        setCreating(false);
        setError(
          mapsResult.error ??
            'La escuela se creó, pero no se pudo guardar el enlace de Google Maps.',
        );
        setRows((prev) =>
          [...prev, { ...created, dirty: false }].sort(
            (a, b) => a.school_number - b.school_number,
          ),
        );
        closeAddModal();
        return;
      }
      if (mapsResult.row) created = mapsResult.row;
    }

    setCreating(false);
    setRows((prev) =>
      [...prev, { ...created, dirty: false }].sort(
        (a, b) => a.school_number - b.school_number,
      ),
    );
    closeAddModal();
  };

  const openAddModal = () => {
    const nextFree =
      Array.from({ length: 999 }, (_, i) => i + 1).find((n) => !usedSchoolNumbers.has(n)) ?? 1;
    setAddDraft({ ...emptyDraft(), school_number: nextFree });
    setAddModalOpen(true);
  };

  return (
    <div className="space-y-4">

      <PublicPaysanduSchoolsGalleryLinkSection idPrefix="admin-schools-gallery" />

      <div className={`${appPanelClass} p-3 sm:p-4`}>
        <label className={appAuthLabelClass} htmlFor="paysandu-school-search">
          Buscar escuela
        </label>
        <div className="relative mt-1">
          <FaSearch
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400"
            aria-hidden
          />
          <input
            id="paysandu-school-search"
            type="search"
            className={`${appAuthInputClass} min-h-[2.75rem] pl-9 pr-10 sm:min-h-0`}
            placeholder="Nº o localidad (ej. 118, Cerro Chato)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          {searchQuery.trim() ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
              onClick={() => setSearchQuery('')}
              aria-label="Limpiar búsqueda"
              title="Limpiar búsqueda"
            >
              <FaTimes className="text-sm" />
            </button>
          ) : null}
        </div>
        {searchQuery.trim() ? (
          <p className="mt-2 text-xs text-neutral-500">
            {filteredRows.length === 0
              ? `Sin resultados para “${searchQuery.trim()}”.`
              : `${filteredRows.length} escuela${filteredRows.length === 1 ? '' : 's'} encontrada${filteredRows.length === 1 ? '' : 's'}.`}
          </p>
        ) : null}
      </div>

      <div className={adminToolbarPanelClass}>
        <div className={adminToolbarFieldClass}>
          <label className={appAuthLabelClass}>Área</label>
          <select
            className={appAuthSelectClass}
            value={filterArea}
            onChange={(e) => setFilterArea(e.target.value)}
          >
            <option value="">Todas</option>
            {(Object.keys(PAYSANDU_SCHOOL_AREA_LABELS) as PaysanduSchoolArea[]).map((k) => (
              <option key={k} value={k}>
                {PAYSANDU_SCHOOL_AREA_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div className={adminToolbarFieldClass}>
          <label className={appAuthLabelClass}>Tipo</label>
          <select
            className={appAuthSelectClass}
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="">Todos</option>
            {(Object.keys(PAYSANDU_SCHOOL_TIPO_LABELS) as PaysanduSchoolTipo[]).map((k) => (
              <option key={k} value={k}>
                {PAYSANDU_SCHOOL_TIPO_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <div className={adminToolbarFieldClass}>
          <label className={appAuthLabelClass}>Servicio</label>
          <select
            className={appAuthSelectClass}
            value={filterServicio}
            onChange={(e) => setFilterServicio(e.target.value)}
          >
            <option value="">Todos</option>
            {(Object.keys(PAYSANDU_SCHOOL_SERVICIO_LABELS) as PaysanduSchoolServicio[]).map(
              (k) => (
                <option key={k} value={k}>
                  {PAYSANDU_SCHOOL_SERVICIO_LABELS[k]}
                </option>
              ),
            )}
          </select>
        </div>
        <div className={adminToolbarFieldClass}>
          <label className={appAuthLabelClass}>Agua mineral</label>
          <select
            className={appAuthSelectClass}
            value={filterAgua}
            onChange={(e) => setFilterAgua(e.target.value)}
          >
            <option value="">Todas</option>
            <option value="si">Con partida</option>
            <option value="no">Sin partida</option>
          </select>
        </div>
        <div className={adminToolbarFieldClass}>
          <label className={appAuthLabelClass}>Secundaria</label>
          <select
            className={appAuthSelectClass}
            value={filterComensal}
            onChange={(e) => setFilterComensal(e.target.value)}
          >
            <option value="">Todos</option>
            {PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_ORDER.map((k) => (
              <option key={k} value={k}>
                {PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_LABELS[k]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className={adminToolbarBtnSecondaryClass}
        >
          <FaSyncAlt />
          Actualizar
        </button>
        <button type="button" onClick={openAddModal} className={adminToolbarBtnClass}>
          <FaPlus />
          Agregar escuela
        </button>
      </div>

      <div className={adminToolbarPanelClass}>
        <div className={adminToolbarFieldClass}>
          <label className={appAuthLabelClass}>Exportar PDF</label>
          <select
            className={appAuthSelectClass}
            value={exportFilter}
            onChange={(e) => setExportFilter(e.target.value as PaysanduSchoolExportFilter)}
          >
            {EXPORT_FILTERS.map((f) => (
              <option key={f} value={f}>
                {PAYSANDU_SCHOOL_EXPORT_FILTER_LABELS[f]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className={adminToolbarBtnClass}
          onClick={() => exportPaysanduSchoolsPdf(exportFilter, exportRows)}
          disabled={exportRows.length === 0}
        >
          <FaFilePdf />
          Imprimir ({exportRows.length})
        </button>
      </div>

      {error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <AddSchoolModal
        open={addModalOpen}
        draft={addDraft}
        saving={creating}
        usedNumbers={usedSchoolNumbers}
        onChange={(patch) => setAddDraft((prev) => ({ ...prev, ...patch }))}
        onClose={closeAddModal}
        onCreate={() => void createSchool()}
      />

      <PaysanduSchoolCommentsModal
        open={commentsSchoolNumber != null}
        schoolNumber={commentsSchoolNumber}
        onClose={() => setCommentsSchoolNumber(null)}
      />

      <PaysanduSchoolPublicInfoModal
        open={infoSchoolNumber != null}
        schoolNumber={infoSchoolNumber}
        initialInfo={
          infoSchoolNumber != null
            ? (rows.find((r) => r.school_number === infoSchoolNumber)?.public_info ?? null)
            : null
        }
        schoolNombre={
          infoSchoolNumber != null
            ? (rows.find((r) => r.school_number === infoSchoolNumber)?.nombre ?? null)
            : null
        }
        onClose={() => setInfoSchoolNumber(null)}
        onSaved={syncPublicInfoRow}
      />

      {loading ? (
        <p className="text-sm text-neutral-500">Cargando escuelas…</p>
      ) : (
        <div className="rounded-none bg-neutral-100/90 sm:rounded-none sm:bg-transparent">
          <div className="flex flex-col gap-5 p-2 sm:gap-5 sm:p-0">
            {filteredRows.map((row) => (
                  <SchoolEditRow
                    key={row.school_number}
                    row={row}
                    allRows={rows}
                    saving={savingNumber === row.school_number}
                    deleting={deletingNumber === row.school_number}
                    uploadingFacade={uploadingFacadeNumber === row.school_number}
                    onUpdate={(patch) => updateRow(row.school_number, patch)}
                    onComedorPartnerLink={(partner) => linkComedorPartner(row.school_number, partner)}
                    onComedorAdminChange={(admin) => changeComedorAdmin(row.school_number, admin)}
                    onSave={() => void saveRow(row)}
                    onDelete={() => void deleteRow(row)}
                    onOpenComments={() => setCommentsSchoolNumber(row.school_number)}
                    onOpenInfo={() => setInfoSchoolNumber(row.school_number)}
                    onFacadeSynced={syncFacadeRow}
                    onError={(message) => setError(message ? message : null)}
                    onUploadingFacadeChange={(uploading) =>
                      setUploadingFacadeNumber(uploading ? row.school_number : null)
                    }
                  />
                ))}
              </div>
              {filteredRows.length === 0 ? (
                <p className="py-6 text-center text-sm text-neutral-500">
                  No hay escuelas con esos filtros.
                </p>
              ) : (
                <p className="px-2 py-3 text-[10px] text-neutral-500 sm:mt-2 sm:px-0 sm:text-[11px]">
                  Mostrando {filteredRows.length} de {rows.length} escuelas
                  {searchQuery.trim() ? ` · búsqueda: “${searchQuery.trim()}”` : ''}.
                </p>
              )}
        </div>
      )}
    </div>
  );
}
