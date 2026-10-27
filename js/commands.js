// Registro modular de comandos. Para añadir uno: register({...}) con su definición.
// Los comandos son independientes del idioma; solo cambian las respuestas (i18n).
// Nunca se usa eval ni se interpreta la entrada como código.
const registry = new Map();

export function register(def) {
  if (!/^[a-z0-9_-]+$/.test(def.id)) throw new Error('Invalid command id');
  registry.set(def.id, {
    params: [], processingMs: null, speak: true, deps: [], requiresData: false, ...def
  });
}
export const resolve = name => registry.get(name) ?? null;

export function parse(raw) {
  const parts = raw.trim().split(/\s+/).filter(Boolean);
  return { name: (parts[0] ?? '').toLowerCase(), args: parts.slice(1) };
}

// Ejecuta la lógica de un comando. Nunca lanza: los errores se convierten en respuesta.
export async function execute(def, ctx) {
  try {
    const res = await def.run(ctx);
    const lines = Array.isArray(res?.lines) ? res.lines : [String(res?.lines ?? '')];
    return { ok: true, lines };
  } catch (err) {
    console.error(`[command:${def.id}]`, err);
    const key = err?.code === 'offline' ? 'offline' : 'error';
    return { ok: false, lines: [ctx.t(key)] };
  }
}

// ---- Único comando de la primera versión ----
register({
  id: 'help',
  async run({ t }) { return { lines: t('help') }; }
});
