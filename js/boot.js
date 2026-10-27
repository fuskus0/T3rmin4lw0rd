// Secuencia de arranque en el idioma seleccionado.
import { CONFIG } from './config.js';
import { sleep } from './terminal.js';

export const copyrightYears = (now = new Date()) => `${CONFIG.creationYear}-${now.getFullYear()}`;

export async function runBoot(term, t) {
  term.skip = false;
  for (const msg of t('boot')) {
    const sp = term.spinner(msg);
    await sleep(CONFIG.bootStepMs);
    sp.stop(`[OK] ${msg}`);
  }
  term.addLine('');
  await term.print(CONFIG.projectName, { typed: true });
  await term.print(`${t('copyrightWord')} (C) ${copyrightYears()}`, { typed: true });
  term.addLine('');
  await term.print(t('ready'), { typed: true });
  term.addLine('');
}
