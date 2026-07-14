import { supabase } from '@/lib/supabase/client';
import { normalizeComensalesSecundaria } from '@/constants/paysandu-school-labels';
import type {
  PaysanduSchoolCreatePayload,
  PaysanduSchoolListFilters,
  PaysanduSchoolRow,
  PaysanduSchoolUpdatePayload,
} from '@/types/paysandu-school';

const CRUD_SQL_HINT =
  'Ejecutá supabase/paysandu_schools_crud.sql en Supabase → SQL Editor y recargá la página.';

const TIPO_UPDATE_SQL_HINT =
  'Ejecutá supabase/paysandu_schools_tipo_update.sql en Supabase → SQL Editor y recargá la página.';

function mapPaysanduRpcError(message: string): string {
  const lower = message.toLowerCase();
  if (
    lower.includes('invalid tipo') ||
    lower.includes('paysandu_schools_tipo_check') ||
    (lower.includes('check constraint') && lower.includes('tipo'))
  ) {
    return `El tipo de escuela aún no está habilitado en Supabase. ${TIPO_UPDATE_SQL_HINT}`;
  }
  if (
    lower.includes('invalid nombre') ||
    (lower.includes('could not find the function') && lower.includes('p_nombre'))
  ) {
    return `Falta habilitar localidad en Supabase. Ejecutá supabase/paysandu_schools_localidad.sql y recargá la página.`;
  }
  return message;
}

function isRpcMissing(message: string): boolean {
  return (
    message.includes('Could not find the function') ||
    message.includes('schema cache') ||
    message.includes('does not exist')
  );
}

function normalizeSchoolNombre(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed || null;
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

export async function fetchAdminPaysanduSchools(
  filters?: PaysanduSchoolListFilters,
): Promise<PaysanduSchoolRow[]> {
  const { data, error } = await supabase.rpc('get_admin_paysandu_schools', {
    p_area: filters?.area ?? null,
    p_tipo: filters?.tipo ?? null,
    p_servicio_alimentacion: filters?.servicio_alimentacion ?? null,
    p_recibe_partida_agua_mineral: filters?.recibe_partida_agua_mineral ?? null,
  });

  if (error) {
    throw new Error(
      error.message.includes('does not exist')
        ? 'Falta configurar Supabase. Ejecutá supabase/paysandu_schools.sql y el seed en SQL Editor.'
        : error.message,
    );
  }

  return (data ?? []).map((row: PaysanduSchoolRow) => normalizeRow(row));
}

/** Galería pública (anon + autenticados). No incluye observaciones de visita. */
export async function fetchPublicPaysanduSchools(): Promise<PaysanduSchoolRow[]> {
  const { data, error } = await supabase.rpc('get_public_paysandu_schools');

  if (error) {
    throw new Error(
      isRpcMissing(error.message)
        ? 'Falta configurar la galería pública. Ejecutá supabase/paysandu_schools_public_gallery.sql en Supabase → SQL Editor.'
        : error.message,
    );
  }

  return (data ?? []).map((row: PaysanduSchoolRow) => normalizeRow(row));
}

export async function adminUpdatePaysanduSchool(
  payload: PaysanduSchoolUpdatePayload,
): Promise<{ ok: boolean; error?: string; row?: PaysanduSchoolRow }> {
  const { data, error } = await supabase.rpc('admin_update_paysandu_school', {
    p_school_number: payload.school_number,
    p_area: payload.area,
    p_tipo: payload.tipo,
    p_servicio_alimentacion: payload.servicio_alimentacion,
    p_recibe_partida_agua_mineral: payload.recibe_partida_agua_mineral,
    p_comparte_comedor_con: payload.comparte_comedor_con,
    p_comensales_secundaria: payload.comensales_secundaria ?? [],
    p_comedor_administrado_por: payload.comedor_administrado_por ?? null,
    p_nombre: normalizeSchoolNombre(payload.nombre),
  });

  if (error) {
    return { ok: false, error: mapPaysanduRpcError(error.message) };
  }

  return { ok: true, row: normalizeRow(data as PaysanduSchoolRow) };
}

const PUBLIC_INFO_SQL_HINT =
  'Ejecutá supabase/paysandu_schools_public_info.sql en Supabase → SQL Editor y recargá la página.';

export async function adminSetPaysanduSchoolPublicInfo(
  schoolNumber: number,
  publicInfo: string | null,
): Promise<{ ok: boolean; error?: string; row?: PaysanduSchoolRow }> {
  const { data, error } = await supabase.rpc('admin_set_paysandu_school_public_info', {
    p_school_number: schoolNumber,
    p_public_info: publicInfo,
  });

  if (error) {
    return {
      ok: false,
      error:
        isRpcMissing(error.message) || error.message.includes('public_info')
          ? PUBLIC_INFO_SQL_HINT
          : mapPaysanduRpcError(error.message),
    };
  }

  return { ok: true, row: normalizeRow(data as PaysanduSchoolRow) };
}

async function createPaysanduSchoolFallback(
  payload: PaysanduSchoolCreatePayload,
): Promise<{ ok: boolean; error?: string; row?: PaysanduSchoolRow }> {
  const { data, error } = await supabase
    .from('paysandu_schools')
    .insert({
      school_number: payload.school_number,
      departamento: 'Paysandú',
      area: payload.area ?? null,
      tipo: payload.tipo ?? null,
      servicio_alimentacion: payload.servicio_alimentacion ?? null,
      recibe_partida_agua_mineral: payload.recibe_partida_agua_mineral ?? false,
      comparte_comedor_con: payload.comparte_comedor_con ?? null,
      comedor_administrado_por: payload.comedor_administrado_por ?? null,
      comensales_secundaria: payload.comensales_secundaria ?? [],
      nombre: normalizeSchoolNombre(payload.nombre),
    })
    .select()
    .single();

  if (error) {
    const msg =
      error.message.includes('duplicate') || error.code === '23505'
        ? `Ya existe la escuela Nº ${payload.school_number}.`
        : error.message;
    return { ok: false, error: mapPaysanduRpcError(msg) };
  }

  return { ok: true, row: normalizeRow(data as PaysanduSchoolRow) };
}

export async function adminCreatePaysanduSchool(
  payload: PaysanduSchoolCreatePayload,
): Promise<{ ok: boolean; error?: string; row?: PaysanduSchoolRow }> {
  const { data, error } = await supabase.rpc('admin_create_paysandu_school', {
    p_school_number: payload.school_number,
    p_area: payload.area ?? null,
    p_tipo: payload.tipo ?? null,
    p_servicio_alimentacion: payload.servicio_alimentacion ?? null,
    p_recibe_partida_agua_mineral: payload.recibe_partida_agua_mineral ?? false,
    p_comparte_comedor_con: payload.comparte_comedor_con ?? null,
    p_comensales_secundaria: payload.comensales_secundaria ?? [],
    p_comedor_administrado_por: payload.comedor_administrado_por ?? null,
    p_nombre: normalizeSchoolNombre(payload.nombre),
  });

  if (!error) {
    return { ok: true, row: normalizeRow(data as PaysanduSchoolRow) };
  }

  if (!isRpcMissing(error.message)) {
    const msg =
      error.message.includes('already exists') || error.message.includes('unique')
        ? `Ya existe la escuela Nº ${payload.school_number}.`
        : mapPaysanduRpcError(error.message);
    return { ok: false, error: msg };
  }

  return createPaysanduSchoolFallback(payload);
}

async function deletePaysanduSchoolFallback(
  schoolNumber: number,
): Promise<{ ok: boolean; error?: string }> {
  const { error: refError } = await supabase
    .from('paysandu_schools')
    .update({ comparte_comedor_con: null })
    .eq('comparte_comedor_con', schoolNumber);

  if (refError) {
    return { ok: false, error: refError.message };
  }

  const { error: delError } = await supabase
    .from('paysandu_schools')
    .delete()
    .eq('school_number', schoolNumber);

  if (delError) {
    return { ok: false, error: delError.message };
  }

  return { ok: true };
}

export async function adminDeletePaysanduSchool(
  schoolNumber: number,
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await supabase.rpc('admin_delete_paysandu_school', {
    p_school_number: schoolNumber,
  });

  if (!error) {
    return { ok: true };
  }

  if (!isRpcMissing(error.message)) {
    return { ok: false, error: error.message };
  }

  const fallback = await deletePaysanduSchoolFallback(schoolNumber);
  if (!fallback.ok) {
    return { ok: false, error: `${fallback.error} ${CRUD_SQL_HINT}` };
  }

  return fallback;
}
