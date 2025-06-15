"use client";
import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface AuthContextProps {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, password2: string) => Promise<void>;
  googleLogin: (googleIdToken: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken) {
      setToken(storedToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleAuthSuccess = (userData: any, tokens: any) => {
    setUser(userData);
    setToken(tokens.access);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokens.access);
    api.defaults.headers.common["Authorization"] = `Bearer ${tokens.access}`;
  };

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login/", {
      username: email,
      password,
    });
    handleAuthSuccess({ email }, response.data);
    router.push("/chat");
  };

  const signup = async (username: string, email: string, password: string, password2: string) => {
    const response = await api.post("/auth/register/", {
      username,
      email,
      password,
      password2,
    });
    handleAuthSuccess(response.data.user, response.data.tokens);
    router.push("/chat");
  };

  const googleLogin = async (googleIdToken: string) => {
    const response = await api.post("/auth/google/", { id_token: googleIdToken });
    handleAuthSuccess({}, response.data.tokens);
    router.push("/chat");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, googleLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 