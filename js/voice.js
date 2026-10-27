// Capa de voz independiente. API pública: speak(text, lang), stopSpeaking(), setVoiceEnabled(bool).
// Motor provisional: Web Speech API (voz del dispositivo, NO es tu voz).
// Para voz.json: crear un motor con {supports(lang), speak(text,lang), stop()} y llamar a registerEngine().
const LOCALES = {
  'en': ['en-US', l => l.startsWith('en')], 'es-ES': ['es-ES', l => l === 'es-ES'],
  'es-419': ['es-MX', l => l.startsWith('es-') && l !== 'es-ES'], 'pt-PT': ['pt-PT', l => l === 'pt-PT'],
  'fr': ['fr-FR', l => l.startsWith('fr')], 'de': ['de-DE', l => l.startsWith('de')],
  'zh-CN': ['zh-CN', l => l.startsWith('zh-CN') || l === 'zh_CN' || l === 'zh-Hans'], 'ru': ['ru-RU', l => l.startsWith('ru')],
  'ja': ['ja-JP', l => l.startsWith('ja')]
  // 'val': sin entrada a propósito: nunca se lee con una voz de otro idioma.
};

class WebSpeechEngine {
  get available() { return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window; }
  #voice(lang) {
    const [, match] = LOCALES[lang] ?? [];
    if (!match) return undefined;
    const voices = speechSynthesis.getVoices();
    if (!voices.length) return null; // lista aún sin cargar: dejar que el navegador elija por utterance.lang
    return voices.find(v => match(v.lang.replace('_', '-'))) ?? undefined;
  }
  supports(lang) { return this.available && !!LOCALES[lang] && this.#voice(lang) !== undefined; }
  speak(text, lang) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LOCALES[lang][0];
    const v = this.#voice(lang); if (v) u.voice = v;
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  }
  stop() { if (this.available) speechSynthesis.cancel(); }
}

let engine = new WebSpeechEngine();
let enabled = true;

export const registerEngine = e => { engine = e; };
export const isSupported = () => !!engine.available;
export const isVoiceEnabled = () => enabled;
export function setVoiceEnabled(v) { enabled = !!v; if (!enabled) stopSpeaking(); }
export function stopSpeaking() { try { engine.stop(); } catch {} }

// Devuelve: 'spoken' | 'disabled' | 'unsupported' | 'no-voice'
export function speak(text, lang) {
  if (!enabled) return 'disabled';
  if (!engine.available) return 'unsupported';
  if (!engine.supports(lang)) return 'no-voice';
  try { engine.speak(text, lang); return 'spoken'; } catch { return 'unsupported'; }
}
