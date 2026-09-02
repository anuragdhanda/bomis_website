import { useState, useEffect } from "react";
import { getAdminToken, setAdminToken, clearAdminToken } from "./auth";

// Simple event-based auth store (no zustand needed)
type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notify() {
  listeners.forEach((l) => l());
}

export const adminAuth = {
  isLoggedIn: () => !!getAdminToken(),
  login: (token: string) => {
    setAdminToken(token);
    notify();
  },
  logout: () => {
    clearAdminToken();
    notify();
  },
  subscribe: (fn: Listener): (() => void) => {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  },
};

export function useAdminAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => adminAuth.isLoggedIn());

  useEffect(() => {
    const unsub = adminAuth.subscribe(() => {
      setIsLoggedIn(adminAuth.isLoggedIn());
    });
    return unsub;
  }, []);

  return {
    isLoggedIn,
    login: adminAuth.login,
    logout: adminAuth.logout,
  };
}
