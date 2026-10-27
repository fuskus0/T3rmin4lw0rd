// Configuración central de T3rmin4lw0rd. Para sustituir recursos, edita solo este archivo.
export const CONFIG = {
  projectName: 'T3rmin4lw0rd',
  creationYear: 2026,          // Año real de creación. NO cambia automáticamente.
  defaultLang: 'en',

  // Nueve idiomas iniciales (orden del selector). Banderas provisionales en assets/flags/.
  initialLanguages: [
    { id: 'en',    name: 'English',               flag: 'assets/flags/en.svg' },
    { id: 'es-ES', name: 'Español (España)',      flag: 'assets/flags/es-ES.svg' },
    { id: 'es-419',name: 'Español (Latinoamérica)',flag: 'assets/flags/es-419.svg' },
    { id: 'pt-PT', name: 'Português (Portugal)',  flag: 'assets/flags/pt-PT.svg' },
    { id: 'fr',    name: 'Français',              flag: 'assets/flags/fr.svg' },
    { id: 'de',    name: 'Deutsch',               flag: 'assets/flags/de.svg' },
    { id: 'zh-CN', name: '中文（简体）',            flag: 'assets/flags/zh-CN.svg' },
    { id: 'ru',    name: 'Русский',               flag: 'assets/flags/ru.svg' },
    { id: 'ja',    name: '日本語',                 flag: 'assets/flags/ja.svg' }
  ],
  // Idiomas desbloqueables: registrados pero fuera del selector. El mecanismo de
  // desbloqueo (comando) NO está implementado todavía.
  unlockableLanguages: ['val'],

  assets: { logo: 'assets/logo.png', music: 'assets/startup.mp3' },

  processingMs: 700,     // duración mínima por defecto del indicador giratorio
  spinnerFrameMs: 120,
  bootStepMs: 450,
  typeCharsPerTick: 2,   // escritura progresiva
  typeTickMs: 10,
  flicker: false,        // parpadeo CRT opcional

  supabaseEnabled: false, // true cuando exista config/supabase.config.js
  voice: { engine: 'webspeech', voiceJson: 'config/voz.json' }
};
