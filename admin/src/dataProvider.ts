import simpleRestProvider from "ra-data-simple-rest";
import { fetchUtils } from "react-admin";

const apiBase = import.meta.env.VITE_API_URL ?? "/api";

const httpClient = (url: string, options: fetchUtils.Options = {}) => {
  const token = localStorage.getItem("accessToken");
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetchUtils.fetchJson(url, { ...options, headers });
};

export const dataProvider = simpleRestProvider(`${apiBase}/admin`, httpClient);
