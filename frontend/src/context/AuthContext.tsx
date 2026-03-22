import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, type UserMe } from "../api/client";
import { isAuthDisabled } from "../lib/authMode";

type AuthState = {
  user: UserMe | null;
  token: string | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setSession: (accessToken: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(() => {
    if (isAuthDisabled()) return true;
    return !!localStorage.getItem("accessToken");
  });

  const refreshUser = useCallback(async () => {
    if (isAuthDisabled()) {
      setLoading(true);
      try {
        const me = await api<UserMe>("/users/me");
        setUser(me);
        setToken(localStorage.getItem("accessToken"));
      } catch {
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!localStorage.getItem("accessToken")) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const me = await api<UserMe>("/users/me");
      setUser(me);
      setToken(localStorage.getItem("accessToken"));
    } catch {
      setUser(null);
      localStorage.removeItem("accessToken");
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const setSession = useCallback(
    async (accessToken: string) => {
      localStorage.setItem("accessToken", accessToken);
      setToken(accessToken);
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    if (isAuthDisabled()) {
      void refreshUser();
      return;
    }
    localStorage.removeItem("accessToken");
    setToken(null);
    setUser(null);
  }, [refreshUser]);

  const value = useMemo(
    () => ({ user, token, loading, refreshUser, setSession, logout }),
    [user, token, loading, refreshUser, setSession, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
