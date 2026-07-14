export type PaysanduSchoolArea = 'urbana' | 'rural';

export type PaysanduSchoolTipo =
  | 'comun'
  | 'doble_turno'
  | 'tiempo_completo'
  | 'tiempo_extendido'
  | 'jardin'
  | 'escuela_tipo_especial'
  | 'internado_rural';

export type PaysanduSchoolServicio =
  | 'solo_copa_leche'
  | 'doble_copa_leche'
  | 'copa_y_almuerzo'
  | 'doble_copa_y_almuerzo'
  | 'internado_4_tiempos'
  | 'solo_almuerzo';

/** Secundaria en la escuela: CBR, Liceo, UTU o CEI. */
export type PaysanduSchoolComensalSecundaria = 'cbr' | 'liceo' | 'utu' | 'cei';

export interface PaysanduSchoolRow {
  school_number: number;
  departamento: string;
  area: PaysanduSchoolArea | null;
  tipo: PaysanduSchoolTipo | null;
  servicio_alimentacion: PaysanduSchoolServicio | null;
  recibe_partida_agua_mineral: boolean;
  comparte_comedor_con: number | null;
  /** Escuela del par que administra el comedor (puede invertirse cada año). */
  comedor_administrado_por: number | null;
  comensales_secundaria: PaysanduSchoolComensalSecundaria[];
  nombre: string | null;
  /** Ruta en Storage (bucket paysandu-school-facades). */
  facade_photo_path: string | null;
  /** Enlace de Google Maps (https://...). */
  google_maps_url: string | null;
  /** Texto público para la galería (resumen, año de fundación, etc.). */
  public_info: string | null;
  updated_at?: string;
}

export type PaysanduSchoolUpdatePayload = {
  school_number: number;
  area: PaysanduSchoolArea | null;
  tipo: PaysanduSchoolTipo | null;
  servicio_alimentacion: PaysanduSchoolServicio | null;
  recibe_partida_agua_mineral: boolean;
  comparte_comedor_con: number | null;
  /** Escuela del par que administra el comedor (puede invertirse cada año). */
  comedor_administrado_por: number | null;
  comensales_secundaria: PaysanduSchoolComensalSecundaria[];
  nombre: string | null;
  google_maps_url?: string | null;
};

export type PaysanduSchoolCreatePayload = {
  school_number: number;
  area?: PaysanduSchoolArea | null;
  tipo?: PaysanduSchoolTipo | null;
  servicio_alimentacion?: PaysanduSchoolServicio | null;
  recibe_partida_agua_mineral?: boolean;
  comparte_comedor_con?: number | null;
  comedor_administrado_por?: number | null;
  comensales_secundaria?: PaysanduSchoolComensalSecundaria[];
  nombre?: string | null;
  google_maps_url?: string | null;
};

export type PaysanduSchoolListFilters = {
  area?: PaysanduSchoolArea | null;
  tipo?: PaysanduSchoolTipo | null;
  servicio_alimentacion?: PaysanduSchoolServicio | null;
  recibe_partida_agua_mineral?: boolean | null;
};

export type PaysanduSchoolExportFilter =
  | 'todas'
  | 'urbanas'
  | 'rurales'
  | 'solo_copa_leche'
  | 'doble_copa_leche'
  | 'copa_y_almuerzo'
  | 'doble_copa_y_almuerzo'
  | 'tiempo_completo'
  | 'comun'
  | 'tiempo_extendido'
  | 'agua_mineral'
  | 'comensales_secundaria'
  | 'comensales_cbr'
  | 'comensales_liceo'
  | 'comensales_utu'
  | 'comensales_cei';
