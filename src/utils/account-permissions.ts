import type { Profile } from '@/types/profile';

export function isFullAdmin(profile: Profile | null | undefined): boolean {
  return Boolean(profile?.is_admin);
}

export function isPaeCoordinator(profile: Profile | null | undefined): boolean {
  return Boolean(profile?.is_pae_coordinator) && !profile?.is_admin;
}

export function hasPaeManagementAccess(profile: Profile | null | undefined): boolean {
  return isFullAdmin(profile) || isPaeCoordinator(profile);
}

/** Puede ver/editar el catálogo de escuelas Paysandú. */
export function hasPaysanduSchoolsAccess(profile: Profile | null | undefined): boolean {
  return hasPaeManagementAccess(profile) || Boolean(profile?.can_edit_paysandu_schools);
}
