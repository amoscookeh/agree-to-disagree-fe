"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { config } from "@/lib/config";
import { getItem, setItem, removeItem } from "@/lib/storage";

const TOKEN_KEY = "token";

interface User {
  id: string;
  email?: string;
  username: string;
  max_researches: number;
  researches_used: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
  isQuotaExhausted: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async (t: string) => {
    try {
      const res = await fetch(`${config.apiUrl}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        console.warn("Auth token invalid or expired, clearing session");
        removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      // don't clear token on network errors, might be temporary
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedToken = getItem(TOKEN_KEY);
    if (savedToken) {
      setToken(savedToken);
      fetchUser(savedToken);
    } else {
      setIsLoading(false);
    }
  }, [fetchUser]);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${config.apiUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Invalid credentials");
    const data = await res.json();
    setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${config.apiUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    const data = await res.json();
    setItem(TOKEN_KEY, data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }, []);

  const checkUsername = useCallback(
    async (username: string): Promise<boolean> => {
      const res = await fetch(
        `${config.apiUrl}/api/auth/check-username?username=${encodeURIComponent(username)}`
      );
      if (!res.ok) throw new Error("Failed to check username");
      const data = await res.json();
      return data.exists;
    },
    []
  );

  const logout = useCallback(() => {
    removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (token) await fetchUser(token);
  }, [token, fetchUser]);

  const isQuotaExhausted = user
    ? user.researches_used >= user.max_researches
    : false;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        checkUsername,
        isQuotaExhausted,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
