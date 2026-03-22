import type { AuthProvider } from "react-admin";
import { isAuthDisabled } from "./authMode";

const apiBase = import.meta.env.VITE_API_URL ?? "/api";

export const authProvider: AuthProvider = {
  login: async ({ username, password }) => {
    if (isAuthDisabled()) {
      return Promise.resolve();
    }
    if (!password || typeof username !== "string") {
      return Promise.reject(new Error("Email and password required"));
    }
    const res = await fetch(`${apiBase}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: username.trim(), password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return Promise.reject(new Error((err as { error?: string }).error ?? "Login failed"));
    }
    const body = (await res.json()) as {
      accessToken: string;
      user: { role: string };
    };
    if (body.user.role !== "super_admin" && body.user.role !== "moderator") {
      return Promise.reject(new Error("This account is not an administrator"));
    }
    localStorage.setItem("accessToken", body.accessToken);
    return Promise.resolve();
  },
  logout: () => {
    if (isAuthDisabled()) {
      return Promise.resolve();
    }
    localStorage.removeItem("accessToken");
    return Promise.resolve();
  },
  checkAuth: () => {
    if (isAuthDisabled()) {
      return Promise.resolve();
    }
    return localStorage.getItem("accessToken") ? Promise.resolve() : Promise.reject(new Error("Login required"));
  },
  checkError: (error) => {
    if (isAuthDisabled()) {
      return Promise.resolve();
    }
    const s = error?.status;
    if (s === 401 || s === 403) {
      localStorage.removeItem("accessToken");
      return Promise.reject();
    }
    return Promise.resolve();
  },
  getPermissions: () => Promise.resolve("admin"),
};
