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

export type PaysanduSchoolComensalSecundaria = 'cbr' | 'liceo' | 'utu' | 'cei';

export interface PaysanduSchoolRow {
  school_number: number;
  departamento: string;
  area: PaysanduSchoolArea | null;
  tipo: PaysanduSchoolTipo | null;
  servicio_alimentacion: PaysanduSchoolServicio | null;
  recibe_partida_agua_mineral: boolean;
  comparte_comedor_con: number | null;
  comedor_administrado_por: number | null;
  comensales_secundaria: PaysanduSchoolComensalSecundaria[];
  nombre: string | null;
  facade_photo_path: string | null;
  google_maps_url: string | null;
  public_info: string | null;
  updated_at?: string;
}
