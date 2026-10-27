// Capa de datos opcional (Supabase vía REST). Sin configuración, todo sigue funcionando en local.
import { CONFIG } from './config.js';
let cfg = null;
export async function init() {
  if (!CONFIG.supabaseEnabled) return false;
  try { cfg = (await import('../config/supabase.config.js')).SUPABASE; } catch { cfg = null; }
  return isConfigured();
}
export const isConfigured = () => !!(cfg?.url && cfg?.anonKey && !cfg.url.includes('TU-PROYECTO'));

// Solo lectura. Las escrituras quedan bloqueadas por RLS (ver sql/supabase_schema.sql).
export async function select(table, { eq = {}, limit = 50 } = {}) {
  if (!isConfigured()) throw Object.assign(new Error('Database not configured'), { code: 'nodb' });
  if (!/^[a-z_][a-z0-9_]*$/.test(table)) throw new Error('Invalid table');
  const q = new URLSearchParams({ select: '*', limit: String(limit) });
  for (const [k, v] of Object.entries(eq)) q.set(k, `eq.${v}`);
  try {
    const r = await fetch(`${cfg.url}/rest/v1/${table}?${q}`, { headers: { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}` } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (e) {
    if (e instanceof TypeError) throw Object.assign(new Error('offline'), { code: 'offline' });
    throw e;
  }
}
