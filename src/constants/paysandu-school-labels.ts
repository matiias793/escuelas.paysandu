import type {
  PaysanduSchoolArea,
  PaysanduSchoolComensalSecundaria,
  PaysanduSchoolServicio,
  PaysanduSchoolTipo,
} from '@/types/paysandu-school';

export const PAYSANDU_SCHOOL_DEPARTMENT = 'Paysandú';

export const PAYSANDU_SCHOOL_AREA_LABELS: Record<PaysanduSchoolArea, string> = {
  urbana: 'Urbana',
  rural: 'Rural',
};

export const PAYSANDU_SCHOOL_TIPO_LABELS: Record<PaysanduSchoolTipo, string> = {
  comun: 'Común (1 turno)',
  doble_turno: 'Doble turno',
  tiempo_completo: 'Tiempo completo',
  tiempo_extendido: 'Tiempo extendido',
  jardin: 'Jardín',
  escuela_tipo_especial: 'Escuela tipo especial',
  internado_rural: 'Internado rural',
};

export const PAYSANDU_SCHOOL_SERVICIO_LABELS: Record<PaysanduSchoolServicio, string> = {
  solo_copa_leche: 'Solo copa de leche',
  doble_copa_leche: 'Doble copa de leche',
  copa_y_almuerzo: 'Copa de leche y almuerzo',
  doble_copa_y_almuerzo: 'Doble copa de leche y almuerzo',
  internado_4_tiempos: 'Doble copa de leche, almuerzo y cena',
  solo_almuerzo: 'Solo almuerzo',
};

export const PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_LABELS: Record<
  PaysanduSchoolComensalSecundaria,
  string
> = {
  cbr: 'CBR (Ciclo Básico Rural)',
  liceo: 'Liceo',
  utu: 'UTU',
  cei: 'CEI (Centro Educativo Integrado)',
};

export const PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_ORDER: PaysanduSchoolComensalSecundaria[] = [
  'cbr',
  'liceo',
  'utu',
  'cei',
];

export function labelArea(area: PaysanduSchoolArea | null | undefined): string {
  if (!area) return '—';
  return PAYSANDU_SCHOOL_AREA_LABELS[area];
}

export function labelTipo(tipo: PaysanduSchoolTipo | null | undefined): string {
  if (!tipo) return '—';
  return PAYSANDU_SCHOOL_TIPO_LABELS[tipo];
}

export function labelServicio(servicio: PaysanduSchoolServicio | null | undefined): string {
  if (!servicio) return '—';
  return PAYSANDU_SCHOOL_SERVICIO_LABELS[servicio];
}

export function normalizeComensalesSecundaria(
  value: unknown,
): PaysanduSchoolComensalSecundaria[] {
  if (!Array.isArray(value)) return [];
  const allowed = new Set<PaysanduSchoolComensalSecundaria>(
    PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_ORDER,
  );
  const filtered = value.filter(
    (v): v is PaysanduSchoolComensalSecundaria =>
      typeof v === 'string' && allowed.has(v as PaysanduSchoolComensalSecundaria),
  );
  const first = PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_ORDER.find((t) => filtered.includes(t));
  return first ? [first] : [];
}
