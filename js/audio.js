// Música de inicio. Se reproduce solo tras una interacción (botón de inicio).
import { CONFIG } from './config.js';
let el = null, enabled = true;
export const isSoundEnabled = () => enabled;
export function setSoundEnabled(v) { enabled = !!v; if (!enabled) stopMusic(); }
export async function playMusic() {
  if (!enabled) return;
  try {
    el ??= new Audio(CONFIG.assets.music);
    el.volume = 0.6; el.currentTime = 0;
    await el.play();
  } catch { /* archivo ausente o bloqueado: se ignora sin romper el sistema */ }
}
export function stopMusic() { try { el?.pause(); } catch {} }
