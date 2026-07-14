import { supabase } from '@/lib/supabase/client';
import { compressImageForUpload } from '@/utils/compress-image-for-upload';
import type { PaysanduSchoolRow } from '@/types/paysandu-school';

export const PAYSANDU_FACADE_BUCKET = 'paysandu-school-facades';

const MEDIA_SQL_HINT =
  'Ejecutá supabase/paysandu_schools_facade_maps.sql en Supabase → SQL Editor y recargá la página.';

function facadeObjectPath(schoolNumber: number): string {
  return `${schoolNumber}/facade.jpg`;
}

export function getPaysanduFacadePublicUrl(path: string | null | undefined): string | null {
  const trimmed = path?.trim();
  if (!trimmed) return null;
  const { data } = supabase.storage.from(PAYSANDU_FACADE_BUCKET).getPublicUrl(trimmed);
  return data.publicUrl || null;
}

export function normalizeGoogleMapsUrl(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed;
}

export function isValidGoogleMapsUrl(value: string | null | undefined): boolean {
  const url = normalizeGoogleMapsUrl(value);
  if (!url) return true;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;
    return true;
  } catch {
    return false;
  }
}

function normalizeMediaRow(row: PaysanduSchoolRow): PaysanduSchoolRow {
  return {
    ...row,
    facade_photo_path: row.facade_photo_path ?? null,
    google_maps_url: row.google_maps_url ?? null,
    public_info: row.public_info ?? null,
  };
}

export async function adminSetPaysanduSchoolMapsUrl(
  schoolNumber: number,
  googleMapsUrl: string | null,
): Promise<{ ok: boolean; error?: string; row?: PaysanduSchoolRow }> {
  const url = normalizeGoogleMapsUrl(googleMapsUrl);
  if (url && !isValidGoogleMapsUrl(url)) {
    return { ok: false, error: 'La URL de Google Maps no es válida. Debe empezar con https://' };
  }

  const { data, error } = await supabase.rpc('admin_set_paysandu_school_maps_url', {
    p_school_number: schoolNumber,
    p_google_maps_url: url,
  });

  if (error) {
    return {
      ok: false,
      error: error.message.includes('does not exist') || error.message.includes('Could not find')
        ? MEDIA_SQL_HINT
        : error.message,
    };
  }

  return { ok: true, row: normalizeMediaRow(data as PaysanduSchoolRow) };
}

export async function adminSetPaysanduSchoolFacadePath(
  schoolNumber: number,
  path: string | null,
): Promise<{ ok: boolean; error?: string; row?: PaysanduSchoolRow }> {
  const { data, error } = await supabase.rpc('admin_set_paysandu_school_facade', {
    p_school_number: schoolNumber,
    p_facade_photo_path: path,
  });

  if (error) {
    return {
      ok: false,
      error: error.message.includes('does not exist') || error.message.includes('Could not find')
        ? MEDIA_SQL_HINT
        : error.message,
    };
  }

  return { ok: true, row: normalizeMediaRow(data as PaysanduSchoolRow) };
}

export async function uploadPaysanduSchoolFacade(
  schoolNumber: number,
  file: File,
): Promise<{ ok: boolean; error?: string; row?: PaysanduSchoolRow }> {
  try {
    const compressed = await compressImageForUpload(file);
    const path = facadeObjectPath(schoolNumber);

    const { error: uploadError } = await supabase.storage
      .from(PAYSANDU_FACADE_BUCKET)
      .upload(path, compressed, {
        upsert: true,
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      return {
        ok: false,
        error: uploadError.message.includes('Bucket not found')
          ? MEDIA_SQL_HINT
          : uploadError.message,
      };
    }

    return adminSetPaysanduSchoolFacadePath(schoolNumber, path);
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'No se pudo subir la foto.',
    };
  }
}

export async function removePaysanduSchoolFacade(
  schoolNumber: number,
  currentPath?: string | null,
): Promise<{ ok: boolean; error?: string; row?: PaysanduSchoolRow }> {
  const path = currentPath?.trim() || facadeObjectPath(schoolNumber);

  const { error: storageError } = await supabase.storage
    .from(PAYSANDU_FACADE_BUCKET)
    .remove([path]);

  // Si el objeto no existe, seguimos limpiando la columna
  if (storageError && !storageError.message.toLowerCase().includes('not found')) {
    // Continuar igual: la columna es la fuente de verdad en la UI
  }

  return adminSetPaysanduSchoolFacadePath(schoolNumber, null);
}
