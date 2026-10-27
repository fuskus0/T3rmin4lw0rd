# T3rmin4lw0rd

Terminal web multilingüe, gratuita y ampliable. HTML + CSS + JavaScript (módulos ES), sin dependencias ni paso de compilación.

## Probar en local
Los módulos ES no funcionan abriendo `index.html` con doble clic (`file://`). Usa un servidor local:

    python3 -m http.server 8000     # y abre http://localhost:8000

## Publicar en GitHub Pages
1. Crea un repositorio público y sube el contenido de esta carpeta (`index.html` en la raíz).
2. En *Settings → Pages*: *Deploy from a branch*, rama `main`, carpeta `/ (root)`.
3. En unos minutos estará en `https://TU-USUARIO.github.io/NOMBRE-REPO/`. Todas las rutas son relativas, así que funciona bajo subdirectorio.
4. Para actualizar: commit y push.

## Estructura
- `index.html`, `css/terminal.css`: interfaz y estética.
- `js/config.js`: año de creación, idiomas, rutas de recursos, tiempos.
- `js/main.js`: orquestación (pantalla inicial, flujo de comandos).
- `js/boot.js`: secuencia de arranque y copyright.
- `js/terminal.js`, `js/spinner.js`: terminal, historial y cuadrado giratorio `[|] [/] [-] [\]`.
- `js/commands.js`: registro modular de comandos (hoy solo `help`).
- `js/i18n.js`, `js/lang/*.js`: traducciones, un archivo por idioma.
- `js/voice.js`, `js/audio.js`: capa de voz y música.
- `js/storage.js`, `js/database.js`: localStorage y Supabase opcional.
- `sql/`, `config/`: esquema RLS de ejemplo y configuración de ejemplo.
- `tests/`: pruebas.

## Sustituir recursos provisionales
- Logotipo: reemplaza `assets/logo.png` (o cambia la ruta en `js/config.js`).
- Música: reemplaza `assets/startup.mp3`. El actual es 1 s de silencio.
- Banderas: `assets/flags/*.svg` son **marcadores provisionales** con el código del idioma. Cambia las rutas en `initialLanguages` de `js/config.js` cuando tengas los enlaces definitivos.
- Año de creación: `creationYear` en `js/config.js`. El año final del copyright se calcula solo.

## Añadir un comando
En `js/commands.js`: `register({ id, params, processingMs, speak, deps, requiresData, run(ctx) })`. `run` recibe `{t, args, lang, db}` y devuelve `{lines:[...]}`. Los textos van en `js/lang/*.js`. Los errores se capturan y se muestran traducidos. No se usa `eval`.

## Valenciano (`val`)
La arquitectura lo reconoce como idioma desbloqueable, fuera del selector. **Pendiente:** crear `js/lang/val.js` con traducciones redactadas en valenciano normativo, y el mecanismo de desbloqueo (aún sin definir ni implementar). Mientras no exista `val.js`, `val` no puede activarse. Su voz está desactivada a propósito: el texto se mostrará, pero no se leerá con una voz de otro idioma.

## Voz
- Provisional: Web Speech API del navegador. Depende del dispositivo, navegador y voces instaladas; **no es tu voz**. Si no hay voz para el idioma (p. ej. `pt-PT`), la respuesta se muestra sin audio y se avisa una vez.
- `voz.json`: **no está integrado**. Hay que examinar su estructura para saber si necesita un modelo, una biblioteca (p. ej. WASM) o un servidor. Después se escribe un motor y se registra con `registerEngine()` sin tocar los comandos. No se afirma que funcione hasta probarlo con los archivos reales.
- `Esc` detiene la voz; los botones Voz y Sonido la activan o silencian y se recuerdan.

## Supabase (opcional, desactivado)
La web funciona sin él. Para activarlo: crea un proyecto, ejecuta `sql/supabase_schema.sql`, copia `config/supabase.config.example.js` a `config/supabase.config.js` con la URL y la clave `anon`, y pon `supabaseEnabled: true` en `js/config.js`. La clave `anon` es pública por diseño; la protección real son las políticas RLS (lectura pública, sin políticas de escritura). Nunca subas la clave `service_role`. No se guarda historial ni pulsaciones de los visitantes.

## Límites de los servicios gratuitos
Las cuotas cambian: **comprueba las cifras vigentes** en la documentación oficial de GitHub Pages y Supabase. En general, GitHub Pages es solo estático y tiene límites de tamaño y ancho de banda; el plan gratuito de Supabase limita almacenamiento y tráfico y puede pausar proyectos inactivos. Este proyecto no ha verificado esas cifras.

## Pruebas
    node tests/logic.test.mjs
    python3 -m http.server 8765 &   # y en otra terminal:
    python3 tests/e2e.py            # requiere playwright

## Limitaciones conocidas
Sin sonidos de pulsación (opcionales, no implementados). Las voces no se han probado en un dispositivo real. El parpadeo CRT está desactivado por defecto (`flicker` en la configuración).
