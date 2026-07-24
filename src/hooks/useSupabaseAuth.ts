import { useState, useEffect, useCallback, useRef } from 'react';
import { Session, User, AuthChangeEvent, AuthError } from '@supabase/supabase-js';
import { supabase } from '../supabase';

export interface RouteGuardOptions {
  requireAuth?: boolean;
  requireAdmin?: boolean;
  adminEmails?: string[];
  redirectTo?: string;
}

export interface RouteGuardResult {
  canAccess: boolean;
  isLoading: boolean;
  redirectReason: string | null;
  targetRedirect: string | null;
}

export interface UseSupabaseAuthReturn {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  authEvent: AuthChangeEvent | null;
  signOut: () => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<Session | null>;
  getUser: () => User | null;
  checkRoutePermission: (options?: RouteGuardOptions) => RouteGuardResult;
}

/**
 * Custom Hook: useSupabaseAuth
 * 
 * Handles Supabase session persistence, active session retrieval via `supabase.auth.getSession()`
 * before any route guarding, real-time auth state updates, robust structured logging,
 * and a loading state layer (`isLoading`) to prevent early redirects during initial checks.
 */
export const useSupabaseAuth = (): UseSupabaseAuthReturn => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);

  const isMounted = useRef<boolean>(true);

  // Structured Logging Helper
  const logAuth = useCallback((level: 'info' | 'warn' | 'error' | 'debug', message: string, meta?: any) => {
    const timestamp = new Date().toISOString();
    const prefix = `%c[SupabaseAuth][${timestamp}]`;
    const style = level === 'error' 
      ? 'color: #ff4d4f; font-weight: bold;'
      : level === 'warn'
      ? 'color: #faad14; font-weight: bold;'
      : level === 'debug'
      ? 'color: #722ed1;'
      : 'color: #52c41a; font-weight: bold;';

    if (meta !== undefined) {
      console[level](`${prefix} ${message}`, style, meta);
    } else {
      console[level](`${prefix} ${message}`, style);
    }
  }, []);

  // Initial Session Retrieval & Verification
  const initializeSession = useCallback(async () => {
    logAuth('info', '🚀 Initializing authentication check via supabase.auth.getSession()...');
    
    if (isMounted.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      // MANDATORY: Call getSession() before any route guarding takes place
      const { data, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        logAuth('error', '❌ Failed to retrieve active session:', {
          message: sessionError.message,
          status: sessionError.status,
          name: sessionError.name,
        });

        if (isMounted.current) {
          setError(sessionError.message);
          setSession(null);
          setUser(null);
        }
      } else if (data?.session) {
        const currentSession = data.session;
        const currentUser = currentSession.user;
        const expiresAt = currentSession.expires_at 
          ? new Date(currentSession.expires_at * 1000).toLocaleString() 
          : 'Unknown';

        logAuth('info', '✅ Session successfully restored from local persistence:', {
          userId: currentUser?.id,
          email: currentUser?.email,
          role: currentUser?.role,
          tokenExpiresAt: expiresAt,
          authProvider: currentUser?.app_metadata?.provider || 'email',
        });

        if (isMounted.current) {
          setSession(currentSession);
          setUser(currentUser ?? null);
        }
      } else {
        logAuth('info', 'ℹ️ No active session restored from storage. User is currently unauthenticated.');
        
        if (isMounted.current) {
          setSession(null);
          setUser(null);
        }
      }
    } catch (err: any) {
      logAuth('error', '💥 Unexpected error encountered during session initialization:', err);
      if (isMounted.current) {
        setError(err?.message || 'An unexpected authentication error occurred.');
        setSession(null);
        setUser(null);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
        setIsInitialized(true);
        logAuth('info', '🏁 Initial auth session check complete. Loading state layer unblocked.');
      }
    }
  }, [logAuth]);

  useEffect(() => {
    isMounted.current = true;

    // 1. Fetch initial session immediately on mount
    initializeSession();

    // 2. Subscribe to real-time auth state events
    logAuth('info', '🎧 Setting up supabase.auth.onAuthStateChange listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, newSession: Session | null) => {
        logAuth('info', `🔄 Auth state change event received: [${event}]`, {
          hasSession: Boolean(newSession),
          userEmail: newSession?.user?.email,
          userId: newSession?.user?.id,
        });

        if (!isMounted.current) return;

        setAuthEvent(event);

        switch (event) {
          case 'INITIAL_SESSION':
            logAuth('debug', 'State Event: INITIAL_SESSION');
            break;
          case 'SIGNED_IN':
            logAuth('info', `🔑 User signed in successfully: ${newSession?.user?.email}`);
            break;
          case 'SIGNED_OUT':
            logAuth('info', '👋 User signed out.');
            break;
          case 'TOKEN_REFRESHED':
            logAuth('info', '🔄 Access token refreshed automatically.');
            break;
          case 'USER_UPDATED':
            logAuth('info', '👤 User metadata updated.');
            break;
          case 'PASSWORD_RECOVERY':
            logAuth('warn', '🔑 Password recovery requested.');
            break;
          default:
            logAuth('debug', `Unhandled Auth event: ${event}`);
            break;
        }

        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
        setIsInitialized(true);
      }
    );

    return () => {
      isMounted.current = false;
      logAuth('info', '🧹 Cleaning up Supabase auth listener subscription.');
      subscription.unsubscribe();
    };
  }, [initializeSession, logAuth]);

  // Sign Out helper
  const signOut = useCallback(async (): Promise<{ error: AuthError | null }> => {
    logAuth('info', '🚪 Initiating sign-out process...');
    setIsLoading(true);

    try {
      const { error: signOutErr } = await supabase.auth.signOut();
      
      if (signOutErr) {
        logAuth('error', '❌ Error during sign out:', signOutErr.message);
        if (isMounted.current) setError(signOutErr.message);
        return { error: signOutErr };
      }

      logAuth('info', '✅ Signed out successfully.');
      if (isMounted.current) {
        setSession(null);
        setUser(null);
        setError(null);
      }
      return { error: null };
    } catch (err: any) {
      logAuth('error', '💥 Exception during sign out:', err);
      return { error: err as AuthError };
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [logAuth]);

  // Refresh Session helper
  const refreshSession = useCallback(async (): Promise<Session | null> => {
    logAuth('info', '🔄 Manual session refresh triggered...');
    try {
      const { data, error: refreshErr } = await supabase.auth.getSession();

      if (refreshErr) {
        logAuth('error', '❌ Manual session refresh failed:', refreshErr.message);
        return null;
      }

      const refreshed = data?.session || null;
      logAuth('info', '✅ Session refreshed successfully:', {
        userId: refreshed?.user?.id,
        expiresAt: refreshed?.expires_at,
      });

      if (isMounted.current) {
        setSession(refreshed);
        setUser(refreshed?.user ?? null);
      }
      return refreshed;
    } catch (err) {
      logAuth('error', '💥 Exception during session refresh:', err);
      return null;
    }
  }, [logAuth]);

  // Get current user getter
  const getUser = useCallback(() => user, [user]);

  // Route Guard evaluation helper (avoids early redirects during loading state)
  const checkRoutePermission = useCallback(
    (options: RouteGuardOptions = {}): RouteGuardResult => {
      const {
        requireAuth = true,
        requireAdmin = false,
        adminEmails = ['admin@grockgold.com'],
        redirectTo = '/login',
      } = options;

      // Crucial: If initial session check is still loading, block redirects!
      if (isLoading || !isInitialized) {
        logAuth('debug', '🛡️ Route guard evaluation deferred - initial authentication check is still loading.');
        return {
          canAccess: false,
          isLoading: true,
          redirectReason: 'AUTHENTICATION_LOADING',
          targetRedirect: null,
        };
      }

      const isAuthed = Boolean(session && user);

      if (requireAuth && !isAuthed) {
        logAuth('warn', '🛡️ Route guard denied access - User is unauthenticated.', { targetRedirect: redirectTo });
        return {
          canAccess: false,
          isLoading: false,
          redirectReason: 'UNAUTHENTICATED',
          targetRedirect: redirectTo,
        };
      }

      if (requireAdmin) {
        const userEmail = user?.email?.toLowerCase() || '';
        const isAdmin = adminEmails.some(email => email.toLowerCase() === userEmail);

        if (!isAdmin) {
          logAuth('warn', '🛡️ Route guard denied access - User lacks admin credentials.', { userEmail });
          return {
            canAccess: false,
            isLoading: false,
            redirectReason: 'UNAUTHORIZED_ADMIN',
            targetRedirect: redirectTo,
          };
        }
      }

      logAuth('info', '🛡️ Route guard granted access.');
      return {
        canAccess: true,
        isLoading: false,
        redirectReason: null,
        targetRedirect: null,
      };
    },
    [isLoading, isInitialized, session, user, logAuth]
  );

  return {
    session,
    user,
    isAuthenticated: Boolean(session && user),
    isLoading,
    isInitialized,
    error,
    authEvent,
    signOut,
    refreshSession,
    getUser,
    checkRoutePermission,
  };
};

export default useSupabaseAuth;
