// Sistema de traducciones. Cada idioma vive en js/lang/<id>.js, separado de la lógica.
import { CONFIG } from './config.js';

let current = CONFIG.defaultLang;
let dict = {};
const cache = {};

export const initialIds = () => CONFIG.initialLanguages.map(l => l.id);
export const isAvailable = id => initialIds().includes(id) || CONFIG.unlockableLanguages.includes(id);

export async function setLanguage(id) {
  if (!isAvailable(id)) throw new Error('Unknown language: ' + id);
  if (!cache[id]) cache[id] = (await import(`./lang/${id}.js`)).default;
  dict = cache[id]; current = id;
  document.documentElement.lang = id === 'val' ? 'ca-ES-valencia' : id;
  return id;
}
export const lang = () => current;

// t('help'), t('ui.voice'), t('unknown', {cmd:'x'}). Si falta la clave devuelve la propia clave.
export function t(path, vars = {}) {
  let v = path.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
  if (v == null) return path;
  const sub = s => String(s).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
  return Array.isArray(v) ? v.map(sub) : sub(v);
}
