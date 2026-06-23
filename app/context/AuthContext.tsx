'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  _id?: string; // Standardize for MongoDB variant schemas
  name: string;
  email: string;
  role: 'user' | 'artist' | 'admin';
  profilePicture?: string;
  photoUrl?: string; 
  subscriptionTier?: string; // 🌟 Explicit tier tracker
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; 
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  loginWithGoogle: (idToken: string) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => void;
  refreshUserSession: () => Promise<void>; // 🌟 ADDED: Allows checkout pages to force-update state immediately
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Synchronize state mutations with localStorage cleanly
  const updateUserAndStorage = (updater: React.SetStateAction<User | null>) => {
    setUser((prevUser) => {
      const nextUser = typeof updater === 'function' ? updater(prevUser) : updater;
      if (nextUser) {
        localStorage.setItem('user', JSON.stringify(nextUser));
      } else {
        localStorage.removeItem('user');
      }
      return nextUser;
    });
  };

  // 🌟 HELPER FUNCTION: Fetch freshest user status data directly from database
  const refreshUserSession = async () => {
    const currentToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (!currentToken || !storedUser) return;

    try {
      const parsedUser = JSON.parse(storedUser);
      const userId = parsedUser.id || parsedUser._id;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

      const response = await fetch(`${apiUrl}/api/auth/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const freshUser = data.user || data;
        if (freshUser) {
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        }
      }
    } catch (err) {
      console.error("Failed to automatically synchronize subscription profile matrix:", err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          const initialUser = JSON.parse(storedUser);
          setUser(initialUser);

          // 🌟 CRITICAL FIX: Instantly verify live database status upon state initialization
          // This avoids using stale cached user values from local storage
          const userId = initialUser.id || initialUser._id;
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
          
          const response = await fetch(`${apiUrl}/api/auth/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            const freshUser = data.user || data;
            if (freshUser) {
              setUser(freshUser);
              localStorage.setItem('user', JSON.stringify(freshUser));
            }
          }
        }
      } catch (error) {
        console.error("Error restoring auth state:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        return { success: true, role: data.user.role };
      } else {
        throw new Error(data.message || "Google routing failed");
      }
    } catch (error: any) {
      console.error("Google Auth Dispatch Error:", error.message);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser: updateUserAndStorage, 
      token, 
      isLoading, 
      login, 
      loginWithGoogle, 
      logout,
      refreshUserSession 
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