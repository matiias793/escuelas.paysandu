import type {
  PaysanduSchoolArea,
  PaysanduSchoolComensalSecundaria,
  PaysanduSchoolExportFilter,
  PaysanduSchoolServicio,
  PaysanduSchoolTipo,
} from '@/types/paysandu-school';

export const PAYSANDU_SCHOOL_DEPARTMENT = 'Paysandú';

export const PAYSANDU_SCHOOL_MAX_NUMBER = 117;

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

/** Texto compacto para el listado admin (PDF y filtros usan las etiquetas completas). */
export const PAYSANDU_SCHOOL_SERVICIO_ADMIN_LABELS: Record<PaysanduSchoolServicio, string> = {
  solo_copa_leche: 'Solo copa leche',
  doble_copa_leche: 'Doble copa leche',
  copa_y_almuerzo: 'Copa de leche y almuerzo',
  doble_copa_y_almuerzo: 'Doble copa de leche y almuerzo',
  internado_4_tiempos: 'Doble copa de leche, almuerzo y cena',
  solo_almuerzo: 'Solo almuerzo',
};

/** CBR, Liceo, UTU o CEI vinculados a la escuela. */
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

/** Opciones únicas del desplegable (sin combinaciones). */
export const COMENSALES_SECUNDARIA_SELECT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '—' },
  { value: 'cbr', label: 'CBR (Ciclo Básico Rural)' },
  { value: 'liceo', label: 'Liceo' },
  { value: 'utu', label: 'UTU' },
  { value: 'cei', label: 'CEI (Centro Educativo Integrado)' },
];

export const PAYSANDU_SCHOOL_EXPORT_FILTER_LABELS: Record<PaysanduSchoolExportFilter, string> = {
  todas: 'Todas las escuelas',
  urbanas: 'Escuelas urbanas',
  rurales: 'Escuelas rurales',
  solo_copa_leche: 'Solo copa de leche',
  doble_copa_leche: 'Doble copa de leche',
  copa_y_almuerzo: 'Copa de leche y almuerzo',
  doble_copa_y_almuerzo: 'Doble copa de leche y almuerzo',
  tiempo_completo: 'Tiempo completo',
  comun: 'Común (1 turno)',
  tiempo_extendido: 'Tiempo extendido',
  agua_mineral: 'Partida por agua mineral',
  comensales_secundaria: 'Con secundaria (CBR, Liceo, UTU o CEI)',
  comensales_cbr: 'CBR (Ciclo Básico Rural)',
  comensales_liceo: 'Secundaria — Liceo',
  comensales_utu: 'Secundaria — UTU',
  comensales_cei: 'CEI (Centro Educativo Integrado)',
};

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

export function labelComensalesSecundaria(
  tipos: PaysanduSchoolComensalSecundaria[] | null | undefined,
): string {
  const single = normalizeComensalesSecundaria(tipos);
  if (!single.length) return '—';
  return PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_LABELS[single[0]];
}

/** Frases legibles para la ficha pública de una escuela. */
export function buildSchoolDetailSentences(row: {
  area: PaysanduSchoolArea | null;
  tipo: PaysanduSchoolTipo | null;
  servicio_alimentacion: PaysanduSchoolServicio | null;
  recibe_partida_agua_mineral: boolean;
  comparte_comedor_con: number | null;
  comedor_administrado_por?: number | null;
  comensales_secundaria: PaysanduSchoolComensalSecundaria[] | null | undefined;
}): string[] {
  const sentences: string[] = [];

  // Área / modalidad: internado tiene frase propia; el resto solo menciona rural.
  if (row.tipo === 'internado_rural' || row.servicio_alimentacion === 'internado_4_tiempos') {
    sentences.push('Es un internado rural.');
  } else if (row.area === 'rural') {
    sentences.push('Es una escuela rural.');
  }

  if (row.servicio_alimentacion === 'internado_4_tiempos') {
    sentences.push(
      'Esta escuela cuenta con servicio de alimentación en 4 tiempos: desayuno, almuerzo, merienda y cena.',
    );
  } else if (row.servicio_alimentacion) {
    const servicioLabel: Record<
      Exclude<PaysanduSchoolServicio, 'internado_4_tiempos'>,
      string
    > = {
      solo_copa_leche: 'Copa de leche',
      doble_copa_leche: 'Doble copa de leche',
      copa_y_almuerzo: 'Copa de leche y almuerzo',
      doble_copa_y_almuerzo: 'Doble copa de leche y almuerzo',
      solo_almuerzo: 'Almuerzo',
    };
    sentences.push(
      `Esta escuela cuenta con servicio de alimentación: ${servicioLabel[row.servicio_alimentacion]}.`,
    );
  }

  if (row.recibe_partida_agua_mineral) {
    sentences.push('Cuentan con partida de agua mineral.');
  }

  const secundaria = normalizeComensalesSecundaria(row.comensales_secundaria);
  for (const key of secundaria) {
    sentences.push(`Cuentan con ${PAYSANDU_SCHOOL_COMENSAL_SECUNDARIA_LABELS[key]}.`);
  }

  if (row.comparte_comedor_con) {
    let sentence = `Comparte comedor con la escuela Nº ${row.comparte_comedor_con}.`;
    if (row.comedor_administrado_por) {
      sentence += ` El comedor lo administra la escuela Nº ${row.comedor_administrado_por}.`;
    }
    sentences.push(sentence);
  }

  return sentences;
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

/** Valor del select en el listado admin (una sola opción). */
export function comensalesSecundariaSelectValue(
  tipos: PaysanduSchoolComensalSecundaria[] | null | undefined,
): '' | PaysanduSchoolComensalSecundaria {
  const single = normalizeComensalesSecundaria(tipos);
  return single[0] ?? '';
}

export function comensalesSecundariaFromSelect(
  value: string,
): PaysanduSchoolComensalSecundaria[] {
  if (value === 'cbr' || value === 'liceo' || value === 'utu' || value === 'cei') {
    return [value];
  }
  return [];
}
