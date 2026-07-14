import { supabase } from '@/lib/supabase/client';

const INVALID_CREDENTIALS_MSG = 'Correo/usuario o contraseña incorrectos.';
const RATE_LIMIT_MSG = 'Demasiados intentos. Esperá unos minutos e intentá de nuevo.';

export type ResolveLoginEmailResult =
  | { ok: true; email: string }
  | { ok: false; reason: 'invalid' | 'rate_limit' | 'rpc_error' };

const RPC_ERROR_MSG =
  'No se pudo verificar el usuario. Probá con tu correo electrónico o intentá en unos minutos.';

/**
 * Convierte correo o username al email de auth.users (vía RPC en Supabase).
 */
export async function resolveLoginEmail(
  identifier: string,
): Promise<ResolveLoginEmailResult> {
  const trimmed = identifier.trim();
  if (!trimmed) return { ok: false, reason: 'invalid' };

  if (trimmed.includes('@')) {
    return { ok: true, email: trimmed.toLowerCase() };
  }

  const { data, error } = await supabase.rpc('resolve_login_email', {
    identifier: trimmed,
  });

  if (error) {
    if (error.message.includes('rate limit exceeded')) {
      return { ok: false, reason: 'rate_limit' };
    }
    console.error('[Auth] resolve_login_email:', error.message);
    return { ok: false, reason: 'rpc_error' };
  }

  if (typeof data === 'string' && data.length > 0) {
    return { ok: true, email: data };
  }

  return { ok: false, reason: 'invalid' };
}

export { INVALID_CREDENTIALS_MSG, RATE_LIMIT_MSG, RPC_ERROR_MSG };
