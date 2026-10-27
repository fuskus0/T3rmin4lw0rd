// Ejecutar: node tests/logic.test.mjs  (pruebas de lógica sin navegador)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CONFIG } from '../js/config.js';
import { parse, resolve, execute } from '../js/commands.js';
import { FRAMES } from '../js/spinner.js';
import { copyrightYears } from '../js/boot.js';
let n = 0; const ok = (name) => console.log('PASS', name, ++n);

const ids = CONFIG.initialLanguages.map(l => l.id);
assert.deepEqual(ids, ['en','es-ES','es-419','pt-PT','fr','de','zh-CN','ru','ja']); ok('nueve idiomas con ids correctos');
assert.ok(!ids.includes('val') && CONFIG.unlockableLanguages.includes('val')); ok('val fuera del selector, registrado como desbloqueable');

const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v)) ? flat(v, p + k + '.') : [p + k]);
const base = flat((await import('../js/lang/en.js')).default).sort();
for (const id of ids) {
  const d = (await import(`../js/lang/${id}.js`)).default;
  assert.deepEqual(flat(d).sort(), base, id);
  assert.equal(d.boot.length, 4); assert.equal(d.help.length, 5);
  assert.ok(d.help.some(l => l.includes('help')) && d.help[0] === 'T3rmin4lw0rd SYSTEM');
  assert.ok(d.unknown.includes('{cmd}'));
  assert.ok(!/retro|199|simula/i.test(d.help.join(' ')));
}
ok('9 idiomas con las mismas claves, help y arranque completos');

assert.equal(copyrightYears(new Date('2026-06-01')), '2026-2026');
assert.equal(copyrightYears(new Date('2027-01-01')), '2026-2027'); ok('copyright dinámico con año de creación fijo');
assert.deepEqual(FRAMES, ['|','/','-','\\']); ok('spinner de 4 fotogramas de texto');

assert.deepEqual(parse('  HELP  x '), { name: 'help', args: ['x'] });
assert.ok(resolve('help') && !resolve('foo') && !resolve('__proto__')); ok('parse/resolve de comandos');

const t = k => k;
const r = await execute(resolve('help'), { t: () => ['a','b'] }); assert.deepEqual(r, { ok: true, lines: ['a','b'] });
const bad = await execute({ id: 'x', run: () => { throw new Error('boom'); } }, { t });
assert.equal(bad.ok, false); assert.deepEqual(bad.lines, ['error']); ok('un fallo de comando se convierte en mensaje, sin lanzar');

const off = await execute({ id: 'x', run: async () => { throw Object.assign(new Error(), { code: 'offline' }); } }, { t });
assert.deepEqual(off.lines, ['offline']); ok('error sin conexión controlado');

for (const f of ['assets/logo.png','assets/startup.mp3',...ids.map(i => `assets/flags/${i}.svg`)]) assert.ok(fs.existsSync(f), f);
ok('archivos provisionales presentes');
const html = fs.readFileSync('index.html', 'utf8') + fs.readFileSync('css/terminal.css', 'utf8');
assert.ok(!/(src|href)="\//.test(html) && !/url\(\//.test(html)); ok('sin rutas absolutas (válido bajo subdirectorio)');
const src = ['main','terminal','commands','boot','i18n'].map(f => fs.readFileSync(`js/${f}.js`, 'utf8')).join();
assert.ok(!/\beval\s*\(|new Function|innerHTML/.test(src)); ok('sin eval/Function/innerHTML');
