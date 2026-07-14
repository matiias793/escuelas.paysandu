'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaExternalLinkAlt,
  FaInfoCircle,
  FaSearch,
  FaSearchPlus,
  FaTimes,
} from 'react-icons/fa';
import {
  appAuthInputClass,
  appAuthLabelClass,
  appPanelClass,
} from '@/styles/ui';
import {
  PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_LABELS,
  PAYSANDU_SCHOOL_DEPARTMENT,
  labelArea,
  labelServicio,
  labelTipo,
} from '@/constants/paysandu-school-labels';
import { getPaysanduFacadePublicUrl, isValidGoogleMapsUrl } from '@/services/paysandu-school-media';
import { fetchPublicPaysanduSchools } from '@/services/paysandu-schools';
import type { PaysanduSchoolArea, PaysanduSchoolRow } from '@/types/paysandu-school';

function schoolMatchesNumber(row: PaysanduSchoolRow, rawQuery: string): boolean {
  const query = rawQuery.trim();
  if (!query) return true;
  const digits = query.replace(/\D/g, '');
  if (!digits) return true;
  return String(row.school_number).startsWith(digits);
}

function SchoolGalleryCard({
  row,
  onZoom,
  onOpenInfo,
}: {
  row: PaysanduSchoolRow;
  onZoom: (row: PaysanduSchoolRow) => void;
  onOpenInfo: (row: PaysanduSchoolRow) => void;
}) {
  const photoUrl = getPaysanduFacadePublicUrl(row.facade_photo_path);
  const mapsUrl = row.google_maps_url?.trim() || '';
  const mapsOk = mapsUrl && isValidGoogleMapsUrl(mapsUrl);
  const secundaria = row.comensales_secundaria ?? [];

  const chips: string[] = [];
  if (row.area) chips.push(labelArea(row.area));
  if (row.tipo) chips.push(labelTipo(row.tipo));
  if (row.servicio_alimentacion) chips.push(labelServicio(row.servicio_alimentacion));
  if (row.recibe_partida_agua_mineral) chips.push('Agua mineral');
  if (row.comparte_comedor_con) {
    chips.push(`Comedor con Nº ${row.comparte_comedor_con}`);
  }
  for (const key of secundaria) {
    chips.push(PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_LABELS[key]);
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-surface-border bg-white shadow-sm ring-1 ring-surface-ring">
      <div className="relative aspect-[4/3] bg-neutral-100">
        {photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={`Fachada escuela ${row.school_number}`}
              className="h-full w-full cursor-zoom-in object-cover"
              onClick={() => onZoom(row)}
            />
            <button
              type="button"
              onClick={() => onZoom(row)}
              className="absolute right-2 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-primary-dark text-white shadow-md"
              title="Ampliar imagen"
              aria-label={`Ampliar foto escuela ${row.school_number}`}
            >
              <FaSearchPlus className="text-sm" aria-hidden />
            </button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center text-sm text-neutral-400">
            <span className="text-2xl font-bold tabular-nums text-neutral-300">
              {row.school_number}
            </span>
            <span>Sin foto de fachada</span>
          </div>
        )}
      </div>

      <div className="space-y-2.5 p-3.5">
        <div>
          <h2 className="text-base font-bold text-neutral-900">
            Escuela Nº {row.school_number}
          </h2>
          {row.nombre?.trim() ? (
            <p className="mt-0.5 text-sm font-medium text-neutral-600">{row.nombre.trim()}</p>
          ) : (
            <p className="mt-0.5 text-sm text-neutral-400">Sin localidad</p>
          )}
        </div>

        {chips.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {chips.map((chip) => (
              <li
                key={chip}
                className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-medium text-neutral-700"
              >
                {chip}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-neutral-400">Sin datos adicionales cargados.</p>
        )}

        {mapsOk ? (
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:underline"
          >
            <FaExternalLinkAlt size={11} aria-hidden />
            Ver en Google Maps
          </a>
        ) : null}

        {row.public_info?.trim() ? (
          <button
            type="button"
            onClick={() => onOpenInfo(row)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/10 px-3 py-2.5 text-sm font-semibold text-primary-dark hover:bg-primary/15"
          >
            <FaInfoCircle aria-hidden />
            Ver información de escuela
          </button>
        ) : null}
      </div>
    </article>
  );
}

export default function SchoolsGallery() {
  const [rows, setRows] = useState<PaysanduSchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<PaysanduSchoolArea | null>(null);
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(false);
  const [zoomRow, setZoomRow] = useState<PaysanduSchoolRow | null>(null);
  const [infoRow, setInfoRow] = useState<PaysanduSchoolRow | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublicPaysanduSchools();
      setRows(data);
    } catch (e) {
      setRows([]);
      setError(e instanceof Error ? e.message : 'No se pudo cargar la galería.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!zoomRow && !infoRow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomRow(null);
        setInfoRow(null);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [zoomRow, infoRow]);

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (areaFilter && row.area !== areaFilter) return false;
      if (onlyWithPhoto && !row.facade_photo_path?.trim()) return false;
      return schoolMatchesNumber(row, searchQuery);
    });
  }, [rows, searchQuery, onlyWithPhoto, areaFilter]);

  const zoomUrl = zoomRow ? getPaysanduFacadePublicUrl(zoomRow.facade_photo_path) : null;

  const zoomModal =
    mounted &&
    zoomRow &&
    zoomUrl &&
    createPortal(
      <div
        className="fixed inset-0 z-[250] flex flex-col items-center justify-center px-4 py-8 touch-manipulation"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.94)' }}
        onClick={() => setZoomRow(null)}
        role="dialog"
        aria-modal="true"
        aria-label={`Fachada ampliada escuela ${zoomRow.school_number}`}
      >
        <button
          type="button"
          className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-neutral-900 text-white shadow-lg"
          onClick={(e) => {
            e.stopPropagation();
            setZoomRow(null);
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
            src={zoomUrl}
            alt={`Fachada escuela ${zoomRow.school_number}`}
            className="max-h-[min(70vh,560px)] w-auto max-w-full object-contain"
          />
        </div>
        <p className="mt-3 text-sm font-semibold text-white">
          Escuela Nº {zoomRow.school_number}
          {zoomRow.nombre?.trim() ? ` · ${zoomRow.nombre.trim()}` : ''}
        </p>
      </div>,
      document.body,
    );

  const infoModal =
    mounted &&
    infoRow &&
    infoRow.public_info?.trim() &&
    createPortal(
      <div
        className="fixed inset-0 z-[250] flex items-end justify-center px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8 touch-manipulation sm:items-center sm:px-4 sm:py-8"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        onClick={() => setInfoRow(null)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-school-info-title"
      >
        <div
          className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            onClick={() => setInfoRow(null)}
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>
          <div className="border-b border-surface-border px-5 pb-3 pt-5 pr-12">
            <h2 id="gallery-school-info-title" className="text-lg font-bold text-neutral-800">
              Escuela Nº {infoRow.school_number}
            </h2>
            {infoRow.nombre?.trim() ? (
              <p className="mt-0.5 text-sm text-neutral-500">{infoRow.nombre.trim()}</p>
            ) : null}
          </div>
          <div className="overflow-y-auto px-5 py-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
              {infoRow.public_info.trim()}
            </p>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="mx-auto w-full max-w-6xl px-2 py-6 sm:px-4 sm:py-8">
      <div className="mb-5 text-center sm:mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary-dark sm:tracking-[0.2em]">
          Departamento de {PAYSANDU_SCHOOL_DEPARTMENT}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-neutral-800 sm:text-3xl">
          {PAYSANDU_SCHOOL_DEPARTMENT}
        </h1>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAreaFilter((prev) => (prev === 'urbana' ? null : 'urbana'))}
          className={`min-h-[3.25rem] rounded-2xl border-2 px-3 py-3 text-base font-bold touch-manipulation transition-colors sm:min-h-[3.75rem] sm:text-lg ${
            areaFilter === 'urbana'
              ? 'border-primary bg-primary/15 text-primary-dark shadow-sm'
              : 'border-surface-border bg-white text-neutral-700 hover:border-primary/40 hover:bg-primary/5'
          }`}
          aria-pressed={areaFilter === 'urbana'}
        >
          Urbanas
        </button>
        <button
          type="button"
          onClick={() => setAreaFilter((prev) => (prev === 'rural' ? null : 'rural'))}
          className={`min-h-[3.25rem] rounded-2xl border-2 px-3 py-3 text-base font-bold touch-manipulation transition-colors sm:min-h-[3.75rem] sm:text-lg ${
            areaFilter === 'rural'
              ? 'border-primary bg-primary/15 text-primary-dark shadow-sm'
              : 'border-surface-border bg-white text-neutral-700 hover:border-primary/40 hover:bg-primary/5'
          }`}
          aria-pressed={areaFilter === 'rural'}
        >
          Rurales
        </button>
      </div>

      <div className={`${appPanelClass} mb-5 space-y-3 p-3 sm:p-4`}>
        <div>
          <label className={appAuthLabelClass} htmlFor="gallery-school-search">
            Buscar por número de escuela
          </label>
          <div className="relative mt-1">
            <FaSearch
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400"
              aria-hidden
            />
            <input
              id="gallery-school-search"
              type="search"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`${appAuthInputClass} min-h-[2.75rem] pl-9 pr-10 sm:min-h-0`}
              placeholder="Ej. 42"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.replace(/\D/g, ''))}
              autoComplete="off"
            />
            {searchQuery.trim() ? (
              <button
                type="button"
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
              >
                <FaTimes className="text-sm" />
              </button>
            ) : null}
          </div>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 text-sm text-neutral-700">
          <input
            type="checkbox"
            className="h-4 w-4 cursor-pointer"
            checked={onlyWithPhoto}
            onChange={(e) => setOnlyWithPhoto(e.target.checked)}
          />
          Solo escuelas con foto
        </label>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Cargando escuelas…</p>
      ) : filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          No hay escuelas con esos filtros.
        </p>
      ) : (
        <>
          <p className="mb-3 text-xs text-neutral-500">
            Mostrando {filtered.length} de {rows.length} escuelas
            {areaFilter === 'urbana' ? ' · urbanas' : ''}
            {areaFilter === 'rural' ? ' · rurales' : ''}
            {searchQuery.trim() ? ` · Nº ${searchQuery.trim()}` : ''}.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((row) => (
              <SchoolGalleryCard
                key={row.school_number}
                row={row}
                onZoom={setZoomRow}
                onOpenInfo={setInfoRow}
              />
            ))}
          </div>
        </>
      )}

      {zoomModal}
      {infoModal}
    </div>
  );
}
