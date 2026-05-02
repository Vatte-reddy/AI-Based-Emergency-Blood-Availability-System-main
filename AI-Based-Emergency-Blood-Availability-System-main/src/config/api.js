export function apiUrl(path) {
  const base = import.meta.env.VITE_API_URL;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}