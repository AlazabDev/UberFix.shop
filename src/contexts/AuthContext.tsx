import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getStoredFacebookSession, FacebookUserData } from '@/lib/facebookAuth';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider: 'supabase' | 'facebook';
  supabaseUser?: User;
  facebookUser?: FacebookUserData;
  emailConfirmed?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapSupabaseSession = useCallback((s: Session): AuthUser => ({
    id: s.user.id,
    email: s.user.email,
    name: s.user.user_metadata?.full_name || s.user.email,
    avatarUrl: s.user.user_metadata?.avatar_url,
    provider: 'supabase',
    supabaseUser: s.user,
    emailConfirmed: !!s.user.email_confirmed_at,
  }), []);

  const mapFacebookUser = useCallback((fb: FacebookUserData): AuthUser => ({
    id: fb.id,
    email: fb.email,
    name: fb.name,
    avatarUrl: fb.picture?.data?.url,
    provider: 'facebook',
    facebookUser: fb,
    emailConfirmed: true,
  }), []);

  useEffect(() => {
    let isMounted = true;

    // 1. Set up auth state listener FIRST (Supabase best practice)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;

        console.log('[Auth] State changed:', event, !!newSession?.user);

        if (newSession?.user) {
          setSession(newSession);
          setUser(mapSupabaseSession(newSession));
          // ضمان أن isLoading يصبح false عند تسجيل دخول جديد
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          const fbSession = getStoredFacebookSession();
          if (fbSession) {
            setUser(mapFacebookUser(fbSession.user));
          } else {
            setUser(null);
          }
          setSession(null);
          setIsLoading(false);
        }
      }
    );

    // 2. THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          console.error('Session error:', error.message);
          if (error.message.includes('invalid') || error.message.includes('expired')) {
            await supabase.auth.signOut();
          }
        }

        if (currentSession?.user) {
          setSession(currentSession);
          setUser(mapSupabaseSession(currentSession));
        } else {
          const fbSession = getStoredFacebookSession();
          if (fbSession && isMounted) {
            setUser(mapFacebookUser(fbSession.user));
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [mapSupabaseSession, mapFacebookUser]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    try { localStorage.removeItem('facebook_session'); } catch {}
    setUser(null);
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
