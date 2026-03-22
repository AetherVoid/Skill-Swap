/** When true, API calls work without login (backend DISABLE_AUTH + seeded demo user). */
export function isAuthDisabled(): boolean {
  return import.meta.env.VITE_DISABLE_AUTH === "true";
}
