// Almacenamiento local con respaldo en memoria si localStorage no está disponible.
const P = 't3rmin4lw0rd:';
const mem = new Map();
export function get(key, fallback = null) {
  try { const v = localStorage.getItem(P + key); return v === null ? fallback : v; }
  catch { return mem.has(key) ? mem.get(key) : fallback; }
}
export function set(key, value) {
  try { localStorage.setItem(P + key, String(value)); } catch { mem.set(key, String(value)); }
}
export function remove(key) {
  try { localStorage.removeItem(P + key); } catch { mem.delete(key); }
}
