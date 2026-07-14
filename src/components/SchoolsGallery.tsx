'use client';

import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { createPortal } from 'react-dom';
import {
  FaCity,
  FaExternalLinkAlt,
  FaSearch,
  FaSearchPlus,
  FaTh,
  FaThLarge,
  FaTimes,
  FaTree,
} from 'react-icons/fa';
import {
  appAuthInputClass,
  appAuthLabelClass,
  appPanelClass,
} from '@/styles/ui';
import {
  PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_LABELS,
  PAYSANDU_SCHOOL_DEPARTMENT,
  buildSchoolDetailSentences,
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

const GRID_VIEW_STORAGE_KEY = 'paysandu-gallery-grid-view';

type GridView = 'comfortable' | 'compact' | 'dense';

function DenseGridIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      aria-hidden
      width="1em"
      height="1em"
    >
      <rect x="1" y="1" width="4" height="4" rx="0.5" />
      <rect x="6" y="1" width="4" height="4" rx="0.5" />
      <rect x="11" y="1" width="4" height="4" rx="0.5" />
      <rect x="1" y="6" width="4" height="4" rx="0.5" />
      <rect x="6" y="6" width="4" height="4" rx="0.5" />
      <rect x="11" y="6" width="4" height="4" rx="0.5" />
      <rect x="1" y="11" width="4" height="4" rx="0.5" />
      <rect x="6" y="11" width="4" height="4" rx="0.5" />
      <rect x="11" y="11" width="4" height="4" rx="0.5" />
    </svg>
  );
}

const GRID_VIEW_OPTIONS: {
  id: GridView;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  { id: 'comfortable', label: 'Ampliada', Icon: FaThLarge },
  { id: 'compact', label: 'Compacta', Icon: FaTh },
  { id: 'dense', label: 'Mini', Icon: DenseGridIcon },
];

function SchoolGalleryCard({
  row,
  density,
  onZoom,
  onOpenDetail,
}: {
  row: PaysanduSchoolRow;
  density: GridView;
  onZoom: (row: PaysanduSchoolRow) => void;
  onOpenDetail: (row: PaysanduSchoolRow) => void;
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

  if (density === 'dense') {
    return (
      <article className="relative overflow-hidden rounded-lg border border-surface-border bg-white shadow-sm ring-1 ring-surface-ring transition-shadow hover:shadow-md">
        <button
          type="button"
          className="absolute inset-0 z-[1] cursor-pointer"
          onClick={() => onOpenDetail(row)}
          aria-label={`Ver detalle escuela ${row.school_number}`}
        />
        <div className="relative aspect-square bg-neutral-100">
          {photoUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photoUrl}
                alt={`Fachada escuela ${row.school_number}`}
                className="pointer-events-none h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onZoom(row);
                }}
                className="absolute right-1 top-1 z-[2] flex h-7 w-7 items-center justify-center rounded-full border border-white bg-primary-dark text-white shadow"
                title="Ampliar imagen"
                aria-label={`Ampliar foto escuela ${row.school_number}`}
              >
                <FaSearchPlus className="text-[9px]" aria-hidden />
              </button>
            </>
          ) : (
            <div className="pointer-events-none flex h-full w-full items-center justify-center text-neutral-300">
              <span className="text-base font-bold tabular-nums">{row.school_number}</span>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-1.5 pb-1.5 pt-6">
            <p className="text-[11px] font-bold leading-tight text-white">
              Nº {row.school_number}
            </p>
            {row.nombre?.trim() ? (
              <p className="mt-0.5 line-clamp-1 text-[9px] leading-tight text-white/85">
                {row.nombre.trim()}
              </p>
            ) : null}
          </div>
          {mapsOk ? (
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute bottom-1.5 right-1 z-[2] flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-accent-hover shadow"
              title="Ver en Google Maps"
              aria-label={`Maps escuela ${row.school_number}`}
              onClick={(e) => e.stopPropagation()}
            >
              <FaExternalLinkAlt size={8} aria-hidden />
            </a>
          ) : null}
        </div>
      </article>
    );
  }

  const isCompact = density === 'compact';
  const visibleChips = isCompact ? chips.slice(0, 2) : chips;

  return (
    <article
      className={`relative overflow-hidden border border-surface-border bg-white shadow-sm ring-1 ring-surface-ring transition-shadow hover:shadow-md ${
        isCompact ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      <button
        type="button"
        className="absolute inset-0 z-[1] cursor-pointer"
        onClick={() => onOpenDetail(row)}
        aria-label={`Ver detalle escuela ${row.school_number}`}
      />
      <div className={`relative bg-neutral-100 ${isCompact ? 'aspect-[5/4]' : 'aspect-[4/3]'}`}>
        {photoUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoUrl}
              alt={`Fachada escuela ${row.school_number}`}
              className="pointer-events-none h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onZoom(row);
              }}
              className={`absolute z-[2] flex items-center justify-center rounded-full border-2 border-white bg-primary-dark text-white shadow-md ${
                isCompact ? 'right-1 top-1 h-8 w-8' : 'right-2 top-2 h-9 w-9'
              }`}
              title="Ampliar imagen"
              aria-label={`Ampliar foto escuela ${row.school_number}`}
            >
              <FaSearchPlus className={isCompact ? 'text-[10px]' : 'text-sm'} aria-hidden />
            </button>
          </>
        ) : (
          <div
            className={`pointer-events-none flex h-full w-full flex-col items-center justify-center px-2 text-center text-neutral-400 ${
              isCompact ? 'gap-0.5 text-[10px]' : 'gap-1 text-sm'
            }`}
          >
            <span
              className={`font-bold tabular-nums text-neutral-300 ${
                isCompact ? 'text-lg' : 'text-2xl'
              }`}
            >
              {row.school_number}
            </span>
            {!isCompact ? <span>Sin foto de fachada</span> : null}
          </div>
        )}
      </div>

      <div
        className={`pointer-events-none relative z-0 ${isCompact ? 'space-y-1.5 p-2' : 'space-y-2.5 p-3.5'}`}
      >
        <div>
          <h2
            className={`font-bold text-neutral-900 ${isCompact ? 'text-xs leading-tight' : 'text-base'}`}
          >
            Nº {row.school_number}
          </h2>
          {row.nombre?.trim() ? (
            <p
              className={`font-medium text-neutral-600 ${
                isCompact ? 'mt-0.5 line-clamp-2 text-[10px] leading-snug' : 'mt-0.5 text-sm'
              }`}
            >
              {row.nombre.trim()}
            </p>
          ) : !isCompact ? (
            <p className="mt-0.5 text-sm text-neutral-400">Sin localidad</p>
          ) : null}
        </div>

        {visibleChips.length > 0 ? (
          <ul className={`flex flex-wrap ${isCompact ? 'gap-1' : 'gap-1.5'}`}>
            {visibleChips.map((chip) => (
              <li
                key={chip}
                className={`rounded-full bg-neutral-100 font-medium text-neutral-700 ${
                  isCompact ? 'px-1.5 py-0.5 text-[9px] leading-tight' : 'px-2.5 py-1 text-[11px]'
                }`}
              >
                {chip}
              </li>
            ))}
            {isCompact && chips.length > visibleChips.length ? (
              <li className="rounded-full bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-500">
                +{chips.length - visibleChips.length}
              </li>
            ) : null}
          </ul>
        ) : !isCompact ? (
          <p className="text-xs text-neutral-400">Sin datos adicionales cargados.</p>
        ) : null}

        {mapsOk ? (
          <p
            className={`invisible inline-flex items-center font-semibold ${
              isCompact ? 'gap-1 text-[10px]' : 'gap-1.5 text-sm'
            }`}
            aria-hidden
          >
            <FaExternalLinkAlt size={isCompact ? 9 : 11} />
            {isCompact ? 'Maps' : 'Ver en Google Maps'}
          </p>
        ) : null}
      </div>

      {mapsOk ? (
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className={`absolute z-[2] inline-flex items-center font-semibold text-accent-hover hover:underline ${
            isCompact ? 'bottom-2 left-2 gap-1 text-[10px]' : 'bottom-3.5 left-3.5 gap-1.5 text-sm'
          }`}
        >
          <FaExternalLinkAlt size={isCompact ? 9 : 11} aria-hidden />
          {isCompact ? 'Maps' : 'Ver en Google Maps'}
        </a>
      ) : null}
    </article>
  );
}

function gridClassForView(view: GridView): string {
  switch (view) {
    case 'dense':
      return 'grid grid-cols-3 gap-1.5 sm:grid-cols-4 sm:gap-2 lg:grid-cols-5 xl:grid-cols-6';
    case 'compact':
      return 'grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4';
    default:
      return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3';
  }
}

export default function SchoolsGallery() {
  const [rows, setRows] = useState<PaysanduSchoolRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState<PaysanduSchoolArea | null>(null);
  const [onlyWithPhoto, setOnlyWithPhoto] = useState(true);
  const [gridView, setGridView] = useState<GridView>('comfortable');
  const [zoomRow, setZoomRow] = useState<PaysanduSchoolRow | null>(null);
  const [detailRow, setDetailRow] = useState<PaysanduSchoolRow | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(GRID_VIEW_STORAGE_KEY);
      if (saved === 'compact' || saved === 'comfortable' || saved === 'dense') {
        setGridView(saved);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setGridViewPersisted = (view: GridView) => {
    setGridView(view);
    try {
      localStorage.setItem(GRID_VIEW_STORAGE_KEY, view);
    } catch {
      /* ignore */
    }
  };

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
    if (!zoomRow && !detailRow) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZoomRow(null);
        setDetailRow(null);
      }
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [zoomRow, detailRow]);

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

  const detailPhotoUrl = detailRow
    ? getPaysanduFacadePublicUrl(detailRow.facade_photo_path)
    : null;
  const detailMapsUrl = detailRow?.google_maps_url?.trim() || '';
  const detailMapsOk = detailMapsUrl && isValidGoogleMapsUrl(detailMapsUrl);
  const detailSentences = detailRow ? buildSchoolDetailSentences(detailRow) : [];

  const detailModal =
    mounted &&
    detailRow &&
    createPortal(
      <div
        className="fixed inset-0 z-[250] flex items-center justify-center px-3 py-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] touch-manipulation sm:px-4 sm:py-8"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        onClick={() => setDetailRow(null)}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-school-detail-title"
      >
        <div
          className="relative flex max-h-[min(88vh,calc(100dvh-2rem))] w-full max-w-lg flex-col overflow-hidden rounded-2xl border-[3px] border-[#E5A87A] bg-white shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-neutral-400 shadow-sm transition-colors hover:bg-neutral-100 hover:text-neutral-700"
            onClick={() => setDetailRow(null)}
            aria-label="Cerrar"
          >
            <FaTimes />
          </button>

          {detailPhotoUrl ? (
            <div className="relative max-h-[36vh] shrink-0 bg-neutral-100 sm:max-h-[40vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detailPhotoUrl}
                alt={`Fachada escuela ${detailRow.school_number}`}
                className="h-full max-h-[36vh] w-full object-cover sm:max-h-[40vh]"
              />
              <button
                type="button"
                onClick={() => {
                  setDetailRow(null);
                  setZoomRow(detailRow);
                }}
                className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary-dark text-white shadow-md"
                aria-label="Ampliar foto"
              >
                <FaSearchPlus aria-hidden />
              </button>
            </div>
          ) : null}

          <div className="shrink-0 border-b border-accent/40 px-5 pb-3 pt-4 pr-12">
            <h2 id="gallery-school-detail-title" className="text-lg font-bold text-neutral-800">
              Escuela Nº {detailRow.school_number}
            </h2>
            {detailRow.nombre?.trim() ? (
              <p className="mt-0.5 text-sm text-neutral-500">{detailRow.nombre.trim()}</p>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-5 py-4">
            {detailSentences.length > 0 ? (
              <ul className="space-y-2.5">
                {detailSentences.map((sentence) => (
                  <li key={sentence} className="text-sm leading-relaxed text-neutral-700">
                    {sentence}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500">Sin datos adicionales cargados.</p>
            )}

            {detailRow.public_info?.trim() ? (
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-dark">
                  Información de la escuela
                </p>
                <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                  {detailRow.public_info.trim()}
                </p>
              </div>
            ) : null}

            {detailMapsOk ? (
              <a
                href={detailMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 break-all text-sm font-semibold text-accent-hover hover:underline"
              >
                <FaExternalLinkAlt size={12} className="shrink-0" aria-hidden />
                Ver en Google Maps
              </a>
            ) : null}
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <div className="mx-auto w-full max-w-6xl px-2 pb-6 pt-14 sm:px-4 sm:pb-8 sm:pt-12">
      <div className="mb-5 pr-20 text-center sm:mb-6 sm:pr-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-primary sm:tracking-[0.2em]">
          Departamento de {PAYSANDU_SCHOOL_DEPARTMENT}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-primary-dark sm:text-3xl">
          {PAYSANDU_SCHOOL_DEPARTMENT}
        </h1>
        <div className="mx-auto mt-3 flex h-1.5 w-24 overflow-hidden rounded-full">
          <span className="flex-1 bg-primary" />
          <span className="flex-1 bg-accent" />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setAreaFilter((prev) => (prev === 'urbana' ? null : 'urbana'))}
          className={`inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 text-base font-bold touch-manipulation transition-colors sm:min-h-[3.75rem] sm:gap-2.5 sm:text-lg ${
            areaFilter === 'urbana'
              ? 'border-primary bg-primary text-white shadow-sm'
              : 'border-primary/35 bg-white text-primary-dark hover:bg-primary/10'
          }`}
          aria-pressed={areaFilter === 'urbana'}
        >
          <FaCity className="shrink-0 text-lg sm:text-xl" aria-hidden />
          Urbanas
        </button>
        <button
          type="button"
          onClick={() => setAreaFilter((prev) => (prev === 'rural' ? null : 'rural'))}
          className={`inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border-2 px-3 py-3 text-base font-bold touch-manipulation transition-colors sm:min-h-[3.75rem] sm:gap-2.5 sm:text-lg ${
            areaFilter === 'rural'
              ? 'border-accent-hover bg-accent text-neutral-900 shadow-sm'
              : 'border-accent/50 bg-white text-accent-hover hover:bg-accent-soft'
          }`}
          aria-pressed={areaFilter === 'rural'}
        >
          <FaTree className="shrink-0 text-lg sm:text-xl" aria-hidden />
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
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-primary"
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

        <div>
          <span className={appAuthLabelClass}>Vista de la galería</span>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {GRID_VIEW_OPTIONS.map(({ id, label, Icon }) => {
              const active = gridView === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setGridViewPersisted(id)}
                  className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border-2 px-1.5 py-2 text-[11px] font-semibold touch-manipulation sm:gap-1.5 sm:px-2 sm:text-sm ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-surface-border bg-white text-neutral-600 hover:border-primary/40 hover:bg-primary/5'
                  }`}
                  aria-pressed={active}
                >
                  <Icon className="shrink-0 text-xs sm:text-sm" aria-hidden />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <p className="mb-4 rounded-xl border border-flag-red/25 bg-flag-red/10 px-3 py-2 text-sm text-flag-red">
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
          <div className={gridClassForView(gridView)}>
            {filtered.map((row) => (
              <SchoolGalleryCard
                key={row.school_number}
                row={row}
                density={gridView}
                onZoom={setZoomRow}
                onOpenDetail={setDetailRow}
              />
            ))}
          </div>
        </>
      )}

      {zoomModal}
      {detailModal}
    </div>
  );
}
