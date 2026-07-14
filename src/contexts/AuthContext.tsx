'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types/profile';

const PROFILE_SELECT_FULL =
  'id, username, nombre, apellido, departamento, school_number, institution_type, is_admin, is_pae_coordinator, can_edit_paysandu_schools, is_stock_school';
const PROFILE_SELECT_LEGACY =
  'id, username, nombre, apellido, departamento, school_number, institution_type, is_admin, is_stock_school';
const PROFILE_SELECT_WITH_PAE =
  'id, username, nombre, apellido, departamento, school_number, institution_type, is_admin, is_pae_coordinator, is_stock_school';

type AuthContextValue = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeProfile(row: Record<string, unknown>): Profile {
  const username = typeof row.username === 'string' ? row.username : '';

  return {
    id: String(row.id),
    username,
    nombre: typeof row.nombre === 'string' ? row.nombre : null,
    apellido: typeof row.apellido === 'string' ? row.apellido : null,
    departamento: typeof row.departamento === 'string' ? row.departamento : '',
    school_number:
      typeof row.school_number === 'number'
        ? row.school_number
        : row.school_number != null
          ? Number(row.school_number)
          : null,
    institution_type:
      typeof row.institution_type === 'string' ? row.institution_type : '',
    is_admin: Boolean(row.is_admin),
    is_pae_coordinator: Boolean(row.is_pae_coordinator),
    can_edit_paysandu_schools: Boolean(row.can_edit_paysandu_schools),
    is_stock_school: Boolean(row.is_stock_school),
  };
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  let result = await supabase
    .from('profiles')
    .select(PROFILE_SELECT_FULL)
    .eq('id', userId)
    .maybeSingle();

  if (result.error?.message?.includes('can_edit_paysandu_schools')) {
    result = await supabase
      .from('profiles')
      .select(PROFILE_SELECT_WITH_PAE)
      .eq('id', userId)
      .maybeSingle();
  }

  if (
    result.error?.message?.includes('is_stock_school') ||
    result.error?.message?.includes('is_pae_coordinator')
  ) {
    result = await supabase
      .from('profiles')
      .select(PROFILE_SELECT_LEGACY)
      .eq('id', userId)
      .maybeSingle();
  }

  if (result.error) {
    console.error('[Auth] Error al cargar perfil:', result.error.message);
    return null;
  }

  if (!result.data) return null;

  return normalizeProfile(result.data as Record<string, unknown>);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setProfile(null);
      return;
    }
    setProfile(await fetchProfile(userId));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user?.id) return;
    await loadProfile(session.user.id);
  }, [loadProfile, session?.user?.id]);

  const authReady = useRef(false);

  useEffect(() => {
    let mounted = true;

    const finishInitialLoad = () => {
      if (!mounted || authReady.current) return;
      authReady.current = true;
      setLoading(false);
    };

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      void loadProfile(data.session?.user?.id).finally(finishInitialLoad);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadProfile(nextSession?.user?.id);
      finishInitialLoad();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      profile,
      loading,
      signOut,
      refreshProfile,
    }),
    [session?.user, profile, loading, signOut, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
}
