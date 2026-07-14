import { supabase } from '@/lib/supabase/client';

export const PAYSANDU_FACADE_BUCKET = 'paysandu-school-facades';

export function getPaysanduFacadePublicUrl(path: string | null | undefined): string | null {
  const trimmed = path?.trim();
  if (!trimmed) return null;
  const { data } = supabase.storage.from(PAYSANDU_FACADE_BUCKET).getPublicUrl(trimmed);
  return data.publicUrl || null;
}

export function isValidGoogleMapsUrl(value: string | null | undefined): boolean {
  const trimmed = value?.trim();
  if (!trimmed) return true;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
