"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface User {
  id: string;
  phoneNumber: string;
  name?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (phoneNumber: string, token: string, userData?: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = sessionStorage.getItem("user");
    const authToken = sessionStorage.getItem("authToken");

    if (storedUser && authToken) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (e) {
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("authToken");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (phoneNumber: string, token: string, userData?: User) => {
    const finalUserData = userData || {
      id: Date.now().toString(),
      phoneNumber,
      name: "User",
    };
    
    // Store in sessionStorage
    sessionStorage.setItem("authToken", token);
    sessionStorage.setItem("user", JSON.stringify(finalUserData));
    setUser(finalUserData);
    
    // Also set as cookie for middleware access
    document.cookie = `authToken=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  };

  const logout = () => {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("phoneNumber");
    setUser(null);
    
    // Clear cookie
    document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
