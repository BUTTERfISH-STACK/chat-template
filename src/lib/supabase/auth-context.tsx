"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { 
  register as supabaseRegister,
  login as supabaseLogin,
  logout as supabaseLogout,
  getSession,
  onAuthStateChange,
  getProfile,
  UserProfile,
} from '@/lib/supabase/auth';

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; message: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<{ success: boolean; message: string }>;
  refreshProfile: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial session and set up auth state listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const session = await getSession();
        
        if (mounted && session?.user) {
          setUser(session.user);
          // Load user profile
          await loadProfile(session.user.id);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      } else if (event === 'SIGNED_IN' && session) {
        setUser(session.user);
        loadProfile(session.user.id);
        setIsLoading(false);
      } else if (event === 'USER_UPDATED' && session) {
        setUser(session.user);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Load user profile
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const profileData = await getProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  // Register
  const register = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    const result = await supabaseRegister({
      email,
      password,
      fullName,
    });

    if (result.success && result.data) {
      setUser(result.data.user);
      await loadProfile(result.data.user.id);
    }

    setIsLoading(false);
    return {
      success: result.success,
      message: result.message || 'Registration failed',
    };
  };

  // Login
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    const result = await supabaseLogin({ email, password });

    if (result.success && result.data) {
      setUser(result.data.user);
      await loadProfile(result.data.user.id);
    }

    setIsLoading(false);
    return {
      success: result.success,
      message: result.message || 'Login failed',
    };
  };

  // Logout
  const logout = async (): Promise<{ success: boolean; message: string }> => {
    const result = await supabaseLogout();
    
    if (result.success) {
      setUser(null);
      setProfile(null);
    }

    return {
      success: result.success,
      message: result.message || 'Logout failed',
    };
  };

  // Update user profile
  const updateUser = useCallback(async (updates: Partial<UserProfile>) => {
    if (!user) return;
    
    const { error } = await updateProfile(user.id, updates);
    
    if (!error) {
      await loadProfile(user.id);
    }
  }, [user, loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        refreshProfile,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

export default AuthContext;
