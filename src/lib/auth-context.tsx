"use client";

/**
 * Authentication Context Provider
 * Manages user authentication state with NextAuth.js v5 integration
 * 
 * This context integrates with NextAuth sessions and provides
 * a simplified interface for client-side authentication.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SessionProvider, useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from "next-auth/react";

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  avatar?: string;
  phoneNumber?: string;
  provider?: string;
  bio?: string;
  isVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: () => void;
  signOut: () => void;
  updateUser: (updates: Partial<User>) => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// INNER PROVIDER COMPONENT
// ============================================================================

function AuthContextProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Update user state when session changes
    if (session?.user) {
      setUser({
        id: (session.user as any).id || session.user.email?.split('@')[0] || '',
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        avatar: session.user.image || undefined,
        phoneNumber: (session.user as any).phoneNumber,
        provider: (session.user as any).provider,
      });
    } else {
      setUser(null);
    }

    // Loading is complete when session status is not "loading"
    setIsLoading(status === "loading");
  }, [session, status]);

  /**
   * Sign in with Google
   */
  const handleSignIn = () => {
    nextAuthSignIn("google", { callbackUrl: "/chat" });
  };

  /**
   * Sign out the user
   */
  const handleSignOut = () => {
    nextAuthSignOut({ callbackUrl: "/login" });
  };

  /**
   * Update user data (limited to client-side updates)
   */
  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!session,
        signIn: handleSignIn,
        signOut: handleSignOut,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ============================================================================
// MAIN PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextProvider>
        {children}
      </AuthContextProvider>
    </SessionProvider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook to access authentication context
 * @throws Error if used outside AuthProvider
 * @returns AuthContextType
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
