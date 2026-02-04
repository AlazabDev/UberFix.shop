import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { getStoredFacebookSession, FacebookUserData } from '@/lib/facebookAuth';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  provider: 'supabase' | 'facebook';
  supabaseUser?: User;
  facebookUser?: FacebookUserData;
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

  useEffect(() => {
    // Check for existing sessions
    const initializeAuth = async () => {
      setIsLoading(true);

      // First check Supabase session
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      
      if (supabaseSession?.user) {
        setSession(supabaseSession);
        setUser({
          id: supabaseSession.user.id,
          email: supabaseSession.user.email,
          name: supabaseSession.user.user_metadata?.full_name || supabaseSession.user.email,
          avatarUrl: supabaseSession.user.user_metadata?.avatar_url,
          provider: 'supabase',
          supabaseUser: supabaseSession.user,
        });
      } else {
        // Check for Facebook session
        const fbSession = getStoredFacebookSession();
        if (fbSession) {
          setUser({
            id: fbSession.user.id,
            email: fbSession.user.email,
            name: fbSession.user.name,
            avatarUrl: fbSession.user.picture?.data?.url,
            provider: 'facebook',
            facebookUser: fbSession.user,
          });
        }
      }

      setIsLoading(false);
    };

    initializeAuth();

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, supabaseSession) => {
      if (supabaseSession?.user) {
        setSession(supabaseSession);
        setUser({
          id: supabaseSession.user.id,
          email: supabaseSession.user.email,
          name: supabaseSession.user.user_metadata?.full_name || supabaseSession.user.email,
          avatarUrl: supabaseSession.user.user_metadata?.avatar_url,
          provider: 'supabase',
          supabaseUser: supabaseSession.user,
        });
      } else if (event === 'SIGNED_OUT') {
        // Check if there's still a Facebook session
        const fbSession = getStoredFacebookSession();
        if (fbSession) {
          setUser({
            id: fbSession.user.id,
            email: fbSession.user.email,
            name: fbSession.user.name,
            avatarUrl: fbSession.user.picture?.data?.url,
            provider: 'facebook',
            facebookUser: fbSession.user,
          });
          setSession(null);
        } else {
          setUser(null);
          setSession(null);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear Facebook session
    try {
      localStorage.removeItem('facebook_session');
    } catch (e) {
      console.warn('Failed to clear Facebook session:', e);
    }

    setUser(null);
    setSession(null);
  };

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
