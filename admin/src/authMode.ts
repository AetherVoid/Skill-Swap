export function isAuthDisabled(): boolean {
  return import.meta.env.VITE_DISABLE_AUTH === "true";
}
