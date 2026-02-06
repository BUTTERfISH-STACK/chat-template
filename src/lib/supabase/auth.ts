/**
 * Authentication Functions
 * Supabase-based registration, login, and logout
 */

import { supabase } from './client';
import { User, Session } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface RegisterParams {
  email: string;
  password: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface AuthResponse<T = unknown> {
  data: T | null;
  error: Error | null;
  success: boolean;
  message?: string;
}

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone_number: string | null;
  bio: string | null;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// REGISTRATION
// ============================================================================

/**
 * Register a new user with email and password
 */
export async function register({
  email,
  password,
  fullName,
  avatarUrl,
}: RegisterParams): Promise<AuthResponse<{ user: User; session: Session }>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          avatar_url: avatarUrl,
        },
      },
    });

    if (error) {
      return {
        data: null,
        error: new Error(error.message),
        success: false,
        message: error.message,
      };
    }

    if (!data.user) {
      return {
        data: null,
        error: new Error('Registration failed'),
        success: false,
        message: 'Registration failed. Please try again.',
      };
    }

    return {
      data: {
        user: data.user,
        session: data.session!,
      },
      error: null,
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
    };
  } catch (err) {
    console.error('Registration error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
      success: false,
      message: 'An unexpected error occurred during registration.',
    };
  }
}

// ============================================================================
// LOGIN
// ============================================================================

/**
 * Login with email and password
 */
export async function login({
  email,
  password,
}: LoginParams): Promise<AuthResponse<{ user: User; session: Session }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      let message = error.message;
      
      if (error.message.includes('Invalid login credentials')) {
        message = 'Invalid email or password. Please try again.';
      } else if (error.message.includes('Email not confirmed')) {
        message = 'Please verify your email address before logging in.';
      } else if (error.message.includes('User not found')) {
        message = 'No account found with this email.';
      }

      return {
        data: null,
        error: new Error(error.message),
        success: false,
        message,
      };
    }

    if (!data.user || !data.session) {
      return {
        data: null,
        error: new Error('Login failed'),
        success: false,
        message: 'Login failed. Please try again.',
      };
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
      success: true,
      message: 'Login successful!',
    };
  } catch (err) {
    console.error('Login error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
      success: false,
      message: 'An unexpected error occurred during login.',
    };
  }
}

// ============================================================================
// LOGOUT
// ============================================================================

/**
 * Log out the current user
 */
export async function logout(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        data: null,
        error: new Error(error.message),
        success: false,
        message: error.message,
      };
    }

    return {
      data: null,
      error: null,
      success: true,
      message: 'Logged out successfully.',
    };
  } catch (err) {
    console.error('Logout error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
      success: false,
      message: 'An unexpected error occurred during logout.',
    };
  }
}

// ============================================================================
// SESSION MANAGEMENT
// ============================================================================

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Get session error:', error);
      return null;
    }

    return session;
  } catch (err) {
    console.error('Get session error:', err);
    return null;
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error);
      return null;
    }

    return user;
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null && session.expires_at !== undefined && session.expires_at * 1000 > Date.now();
}

/**
 * Listen for auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Request a password reset email
 */
export async function resetPassword(email: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`,
    });

    if (error) {
      return {
        data: null,
        error: new Error(error.message),
        success: false,
        message: error.message,
      };
    }

    return {
      data: null,
      error: null,
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  } catch (err) {
    console.error('Reset password error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
      success: false,
      message: 'An unexpected error occurred.',
    };
  }
}

/**
 * Update user's password
 */
export async function updatePassword(newPassword: string): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return {
        data: null,
        error: new Error(error.message),
        success: false,
        message: error.message,
      };
    }

    return {
      data: null,
      error: null,
      success: true,
      message: 'Password updated successfully.',
    };
  } catch (err) {
    console.error('Update password error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
      success: false,
      message: 'An unexpected error occurred.',
    };
  }
}

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

/**
 * Get user profile from public.profiles table
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Get profile error:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Get profile error:', err);
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<AuthResponse<UserProfile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: new Error(error.message),
        success: false,
        message: error.message,
      };
    }

    return {
      data,
      error: null,
      success: true,
      message: 'Profile updated successfully.',
    };
  } catch (err) {
    console.error('Update profile error:', err);
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
      success: false,
      message: 'An unexpected error occurred.',
    };
  }
}

export default {
  register,
  login,
  logout,
  getSession,
  getCurrentUser,
  isAuthenticated,
  onAuthStateChange,
  resetPassword,
  updatePassword,
  getProfile,
  updateProfile,
};
