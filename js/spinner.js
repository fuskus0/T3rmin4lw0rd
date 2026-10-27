// Indicador de texto giratorio [|] [/] [-] [\ ]. Sin barras ni porcentajes.
import { CONFIG } from './config.js';
export const FRAMES = ['|', '/', '-', '\\'];

export function createSpinner(el, text) {
  let i = 0, timer = null, stopped = false;
  const draw = () => { el.textContent = `[${FRAMES[i % 4]}] ${text}`; i++; };
  draw();
  timer = setInterval(draw, CONFIG.spinnerFrameMs);
  return {
    stop(finalText = null) {
      if (stopped) return; // evita dobles paradas
      stopped = true; clearInterval(timer);
      if (finalText === null) el.remove(); else el.textContent = finalText;
    }
  };
}
