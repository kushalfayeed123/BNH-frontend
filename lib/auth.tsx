"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, refreshSession, setTokens, User } from "./api";

type Ctx = { user: User | null; loading: boolean; login: (e: string, p: string) => Promise<void>; logout: () => Promise<void> };
const AuthCtx = createContext<Ctx>(null!);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { if (await refreshSession()) setUser(await api<User>("/auth/me")); } catch {}
      setLoading(false);
    })();
  }, []);
  const login = async (email: string, password: string) => {
    const d = await api<{ access_token: string; refresh_token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    setTokens(d.access_token, d.refresh_token); setUser(d.user);
  };
  const logout = async () => {
    const rt = localStorage.getItem("bnh_rt");
    try { await api("/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token: rt }) }); } catch {}
    setTokens(null, null); setUser(null);
  };
  return <AuthCtx.Provider value={{ user, loading, login, logout }}>{children}</AuthCtx.Provider>;
}
