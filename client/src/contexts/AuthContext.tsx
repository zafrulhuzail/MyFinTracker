import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  
  // Fetch current user session
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/auth/me");
        return response.json();
      } catch {
        // Swallow the error, user is not authenticated
        return null;
      }
    },
    retry: false,
  });
  
  const isAuthenticated = !!user;
  const isAdmin = user?.role === "admin";
  
  // Redirect to login if not authenticated for protected routes
  useEffect(() => {
    const currentPath = window.location.pathname;
    const publicRoutes = ["/login", "/register"];
    const adminRoutes = ["/admin"];
    
    if (!isLoading) {
      if (!isAuthenticated && !publicRoutes.includes(currentPath)) {
        setLocation("/login");
      }
      
      if (isAuthenticated && publicRoutes.includes(currentPath)) {
        setLocation("/");
      }
      
      if (isAuthenticated && !isAdmin && adminRoutes.some(route => currentPath.startsWith(route))) {
        setLocation("/");
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, setLocation]);
  
  // Login function
  const login = async (username: string, password: string) => {
    const response = await apiRequest("POST", "/api/auth/login", { username, password });
    const userData = await response.json();
    queryClient.setQueryData(["/api/auth/me"], userData);
    return userData;
  };
  
  // Logout function
  const logout = async () => {
    await apiRequest("POST", "/api/auth/logout");
    queryClient.setQueryData(["/api/auth/me"], null);
    queryClient.invalidateQueries();
    setLocation("/login");
  };
  
  // Register function
  const register = async (userData: any) => {
    const response = await apiRequest("POST", "/api/users", userData);
    return await response.json();
  };
  
  const value = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    register,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
