"use client";

import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { User, Role } from "@/types/domain";

// Auth context only holds identity + role. Server data stays in React Query.
// We keep the token out of React state entirely — it lives in an httpOnly cookie.

interface AuthState {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => Promise<void>;
  switchRoleForTesting: (r: Role) => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({
  initialUser,
  children,
}: {
  initialUser?: User | null;
  children: ReactNode;
}) {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    // Drop cached per-role data so the next login starts from a clean slate.
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  const switchRoleForTesting = useCallback(
    (r: Role) => {
      if (!user) return;
      setUser({ ...user, role: r });
    },
    [user],
  );

  const value = useMemo<AuthState>(
    () => ({ user, setUser, logout, switchRoleForTesting }),
    [user, logout, switchRoleForTesting],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
