import type { PaysanduSchoolExportFilter, PaysanduSchoolRow } from '@/types/paysandu-school';

export function matchesExportFilter(
  row: PaysanduSchoolRow,
  filter: PaysanduSchoolExportFilter,
): boolean {
  switch (filter) {
    case 'todas':
      return true;
    case 'urbanas':
      return row.area === 'urbana';
    case 'rurales':
      return row.area === 'rural';
    case 'solo_copa_leche':
      return row.servicio_alimentacion === 'solo_copa_leche';
    case 'doble_copa_leche':
      return row.servicio_alimentacion === 'doble_copa_leche';
    case 'copa_y_almuerzo':
      return row.servicio_alimentacion === 'copa_y_almuerzo';
    case 'doble_copa_y_almuerzo':
      return row.servicio_alimentacion === 'doble_copa_y_almuerzo';
    case 'tiempo_completo':
      return row.tipo === 'tiempo_completo';
    case 'comun':
      return row.tipo === 'comun';
    case 'tiempo_extendido':
      return row.tipo === 'tiempo_extendido';
    case 'agua_mineral':
      return row.recibe_partida_agua_mineral;
    case 'comensales_secundaria':
      return (row.comensales_secundaria?.length ?? 0) > 0;
    case 'comensales_cbr':
      return row.comensales_secundaria?.includes('cbr') ?? false;
    case 'comensales_liceo':
      return row.comensales_secundaria?.includes('liceo') ?? false;
    case 'comensales_utu':
      return row.comensales_secundaria?.includes('utu') ?? false;
    case 'comensales_cei':
      return row.comensales_secundaria?.includes('cei') ?? false;
    default:
      return true;
  }
}
