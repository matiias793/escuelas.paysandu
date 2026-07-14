export interface Profile {
  id: string;
  username: string;
  nombre: string | null;
  apellido: string | null;
  departamento: string;
  school_number: number | null;
  institution_type: string;
  is_admin: boolean;
  is_pae_coordinator: boolean;
  /** Usuario normal con acceso solo a Escuelas Paysandú. */
  can_edit_paysandu_schools: boolean;
  is_stock_school: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AdminProfileRow extends Profile {
  email: string;
}

export type ProfileUpdatePayload = {
  nombre: string;
  apellido: string;
  departamento: string;
  school_number: number | null;
  institution_type: string;
};

export type AdminProfileUpdatePayload = ProfileUpdatePayload & {
  user_id: string;
  username: string;
  email: string;
  is_admin: boolean;
  can_edit_paysandu_schools?: boolean;
};

export type AccountTabId =
  | 'perfil'
  | 'mis-valoraciones'
  | 'mis-favoritas'
  | 'mis-notas'
  | 'valoraciones-globales'
  | 'moderacion-comunidad'
  | 'usuarios'
  | 'stock-leche-polvo'
  | 'usuarios-leche-polvo'
  | 'escuelas-paysandu'
  | 'solicitudes-pae'
  | 'solicitudes-uniformes'
  | 'registros-sin-usuario'
  | 'registrar-stock-leche';
