import { supabase } from '@/lib/supabase/client';
import { normalizeComensalesSecundaria } from '@/constants/paysandu-school-labels';
import type { PaysanduSchoolRow } from '@/types/paysandu-school';

function isRpcMissing(message: string): boolean {
  return (
    message.includes('Could not find the function') ||
    message.includes('schema cache') ||
    message.includes('does not exist')
  );
}

function normalizeRow(row: PaysanduSchoolRow & { comensales_otro_nivel?: unknown }): PaysanduSchoolRow {
  return {
    ...row,
    comedor_administrado_por: row.comedor_administrado_por ?? null,
    facade_photo_path: row.facade_photo_path ?? null,
    google_maps_url: row.google_maps_url ?? null,
    public_info: row.public_info ?? null,
    comensales_secundaria: normalizeComensalesSecundaria(
      row.comensales_secundaria ?? row.comensales_otro_nivel,
    ),
  };
}

export async function fetchPublicPaysanduSchools(): Promise<PaysanduSchoolRow[]> {
  const { data, error } = await supabase.rpc('get_public_paysandu_schools');

  if (error) {
    throw new Error(
      isRpcMissing(error.message)
        ? 'No se pudo conectar con el catálogo de escuelas. Verificá la configuración de Supabase.'
        : error.message,
    );
  }

  return (data ?? []).map((row: PaysanduSchoolRow) => normalizeRow(row));
}
