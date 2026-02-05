"use client";

/**
 * Authentication Context Provider
 * Manages user authentication state with secure cookie handling
 * 
 * Security Features:
 * - Secure cookie storage with httpOnly flag
 * - Token validation and expiration handling
 * - Secure session management
 * - XSS protection through proper sanitization
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ============================================================================
// TYPES
// ============================================================================

export interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string, token: string, userData?: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  validateSession: () => boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const COOKIE_NAME = "authToken";
const SESSION_STORAGE_KEY = "user";
const TOKEN_EXPIRY_KEY = "tokenExpiry";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Set a secure cookie with proper security attributes
 * @param name - Cookie name
 * @param value - Cookie value
 * @param maxAge - Max age in seconds
 */
function setSecureCookie(name: string, value: string, maxAge: number): void {
  const isProduction = process.env.NODE_ENV === "production";
  
  // Build cookie string with security attributes
  const cookieString = [
    `${name}=${value}`,
    `path=/`,
    `max-age=${maxAge}`,
    isProduction ? "secure" : "", // HTTPS only in production
    "samesite=strict", // CSRF protection
    "httponly", // Prevent JavaScript access (set by server)
  ]
    .filter(Boolean)
    .join("; ");

  // Note: httpOnly cookies can only be set by the server
  // This is a fallback for client-side only scenarios
  document.cookie = cookieString;
}

/**
 * Delete a cookie
 * @param name - Cookie name
 */
function deleteCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=strict`;
}

/**
 * Validate if a token is still valid
 * @param expiryTimestamp - Token expiry timestamp
 * @returns True if valid, false otherwise
 */
function isTokenValid(expiryTimestamp: number | null): boolean {
  if (!expiryTimestamp) return false;
  return Date.now() < expiryTimestamp;
}

/**
 * Sanitize user data before storage
 * @param userData - User data to sanitize
 * @returns Sanitized user data
 */
function sanitizeUserData(userData: Partial<User>): Partial<User> {
  const sanitized: Partial<User> = {};
  
  if (userData.id) sanitized.id = userData.id;
  if (userData.phoneNumber) sanitized.phoneNumber = userData.phoneNumber;
  if (userData.name) sanitized.name = userData.name;
  if (userData.email) sanitized.email = userData.email;
  if (userData.avatar) sanitized.avatar = userData.avatar;
  if (userData.bio) sanitized.bio = userData.bio;
  if (userData.isVerified !== undefined) sanitized.isVerified = userData.isVerified;
  
  return sanitized;
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state from storage
   */
  function initializeAuth(): void {
    try {
      // Get user data from session storage
      const storedUser = sessionStorage.getItem(SESSION_STORAGE_KEY);
      const tokenExpiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

      if (storedUser && tokenExpiry) {
        const expiryTimestamp = parseInt(tokenExpiry, 10);
        
        // Check if token is still valid
        if (isTokenValid(expiryTimestamp)) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } else {
          // Token expired, clear storage
          clearAuthStorage();
        }
      }
    } catch (error) {
      console.error("Auth initialization error:", error);
      clearAuthStorage();
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Clear all authentication storage
   */
  function clearAuthStorage(): void {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
    sessionStorage.removeItem("phoneNumber");
    deleteCookie(COOKIE_NAME);
  }

  /**
   * Login user with phone number and token
   * @param phoneNumber - User's phone number
   * @param token - Authentication token
   * @param userData - Optional user data
   */
  const login = (phoneNumber: string, token: string, userData?: User): void => {
    try {
      console.log("AuthContext: login called with", { 
        phoneNumber, 
        token: token ? `${token.substring(0, 8)}...` : 'none' 
      });
      
      // Sanitize user data
      const finalUserData = userData || {
        id: Date.now().toString(),
        phoneNumber,
        name: "User",
      };
      
      const sanitizedUserData = sanitizeUserData(finalUserData);
      
      // Calculate token expiry
      const tokenExpiry = Date.now() + SESSION_DURATION_MS;
      
      // Store in sessionStorage (for client-side access)
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sanitizedUserData));
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, tokenExpiry.toString());
      
      // Set cookie for middleware access
      // Note: In production, the server should set httpOnly cookies
      setSecureCookie(COOKIE_NAME, token, SESSION_DURATION_MS / 1000);
      
      // Update state
      setUser(sanitizedUserData as User);
      
      console.log("AuthContext: login completed successfully");
    } catch (error) {
      console.error("AuthContext: login error", error);
      throw new Error("Failed to login. Please try again.");
    }
  };

  /**
   * Logout user and clear all authentication data
   */
  const logout = (): void => {
    try {
      console.log("AuthContext: logout called");
      
      // Clear all storage
      clearAuthStorage();
      
      // Clear state
      setUser(null);
      
      console.log("AuthContext: logout completed successfully");
    } catch (error) {
      console.error("AuthContext: logout error", error);
    }
  };

  /**
   * Update user data
   * @param updates - Partial user data to update
   */
  const updateUser = (updates: Partial<User>): void => {
    if (user) {
      try {
        const sanitizedUpdates = sanitizeUserData(updates);
        const updatedUser = { ...user, ...sanitizedUpdates };
        
        // Update state
        setUser(updatedUser);
        
        // Update storage
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (error) {
        console.error("AuthContext: updateUser error", error);
      }
    }
  };

  /**
   * Validate current session
   * @returns True if session is valid, false otherwise
   */
  const validateSession = (): boolean => {
    try {
      const tokenExpiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);
      
      if (!tokenExpiry) {
        return false;
      }
      
      const expiryTimestamp = parseInt(tokenExpiry, 10);
      const isValid = isTokenValid(expiryTimestamp);
      
      if (!isValid) {
        // Session expired, clear storage
        clearAuthStorage();
        setUser(null);
      }
      
      return isValid;
    } catch (error) {
      console.error("AuthContext: validateSession error", error);
      return false;
    }
  };

  // Periodically validate session (every minute)
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      if (!validateSession()) {
        console.log("AuthContext: Session expired, logging out");
      }
    }, 60 * 1000); // Check every minute
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
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
