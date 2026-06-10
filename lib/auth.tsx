"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { users, CURRENT_USER_ID, type User } from "./mock-data";

interface AuthValue {
  user: User | null;
  loggedIn: boolean;
  logout: () => void;
  login: () => void;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock auth: start logged in as the hardcoded ADMIN user.
  const [loggedIn, setLoggedIn] = useState(true);
  const current = users.find((u) => u.id === CURRENT_USER_ID) ?? null;

  const value: AuthValue = {
    user: loggedIn ? current : null,
    loggedIn,
    logout: () => setLoggedIn(false),
    login: () => setLoggedIn(true),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
