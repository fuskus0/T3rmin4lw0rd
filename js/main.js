import { CONFIG } from './config.js';
import * as storage from './storage.js';
import * as i18n from './i18n.js';
import * as voice from './voice.js';
import * as audio from './audio.js';
import * as db from './database.js';
import { Terminal, sleep } from './terminal.js';
import { runBoot } from './boot.js';
import { parse, resolve, execute } from './commands.js';

const $ = id => document.getElementById(id);
const t = i18n.t;
let term = null, notified = false;

function labels() {
  const on = k => (k ? t('ui.on') : t('ui.off'));
  $('btn-voice').textContent = `${t('ui.voice')}: ${on(voice.isVoiceEnabled())}`;
  $('btn-sound').textContent = `${t('ui.sound')}: ${on(audio.isSoundEnabled())}`;
  $('btn-start').textContent = t('start');
  $('btn-change').textContent = t('ui.change');
  $('cmd').setAttribute('aria-label', t('ui.input'));
}

function renderLangs(selected) {
  const ul = $('langs'); ul.textContent = '';
  for (const l of CONFIG.initialLanguages) {
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-pressed', String(l.id === selected));
    const img = document.createElement('img'); img.className = 'flag'; img.src = l.flag; img.alt = '';
    const s = document.createElement('span'); s.textContent = l.name;
    b.append(img, s); b.addEventListener('click', () => choose(l.id));
    li.appendChild(b); ul.appendChild(li);
  }
}

async function choose(id) {
  await i18n.setLanguage(id);
  storage.set('lang', id);              // la preferencia se guarda al elegir
  renderLangs(id); labels(); $('bar').hidden = false;
  $('btn-start').disabled = false;
}

function showSelector(selected) { $('langs').hidden = false; $('btn-change').hidden = true; renderLangs(selected); }

async function note(key) { if (term) await term.print(t(key), { cls: 'dim' }); }

async function onSubmit(raw) {
  term.setBusy(true);
  try {
    await term.print(`> ${raw}`, { cls: 'cmd' });
    if (!raw.trim()) return;
    const { name, args } = parse(raw);
    const def = resolve(name);
    if (!def) { await term.print(t('unknown', { cmd: raw.trim().slice(0, 60) }), { cls: 'err' }); return; }
    const sp = term.spinner(t('processing'));
    let result;
    try {
      [result] = await Promise.all([execute(def, { t, args, lang: i18n.lang(), db }), sleep(def.processingMs ?? CONFIG.processingMs)]);
    } finally { sp.stop(); }
    await term.printLines(result.lines, { cls: result.ok ? 'sys' : 'err', typed: true });
    if (def.speak) {
      const r = voice.speak(result.lines.join(' '), i18n.lang());
      if ((r === 'unsupported' || r === 'no-voice') && !notified) { notified = true; await note(r === 'no-voice' ? 'voiceMsg.noVoice' : 'voiceMsg.unsupported'); }
    }
    term.addLine('');
  } catch (e) {
    console.error(e);
    await term.print(t('error'), { cls: 'err' });
  } finally { term.setBusy(false); }
}

async function start() {
  $('btn-start').disabled = true;
  await audio.playMusic();               // tras interacción del usuario
  $('splash').hidden = true; $('screen').hidden = false;
  term = new Terminal({ out: $('out'), input: $('cmd'), line: $('line') });
  term.onSubmit = onSubmit; term.onEscape = voice.stopSpeaking;
  try { await runBoot(term, t); } catch (e) { console.error(e); }
  term.setBusy(false);
}

async function init() {
  if (CONFIG.flicker) document.body.classList.add('flicker');
  $('logo').src = CONFIG.assets.logo;
  $('logo').addEventListener('error', () => { $('logo').replaceWith(Object.assign(document.createElement('h1'), { textContent: CONFIG.projectName })); }, { once: true });
  voice.setVoiceEnabled(storage.get('voice', '1') === '1');
  audio.setSoundEnabled(storage.get('sound', '1') === '1');
  db.init();                              // opcional; no bloquea el arranque

  $('btn-voice').addEventListener('click', () => {
    voice.setVoiceEnabled(!voice.isVoiceEnabled()); storage.set('voice', voice.isVoiceEnabled() ? '1' : '0');
    labels(); note(voice.isVoiceEnabled() ? 'voiceMsg.on' : 'voiceMsg.off');
  });
  $('btn-sound').addEventListener('click', () => {
    audio.setSoundEnabled(!audio.isSoundEnabled()); storage.set('sound', audio.isSoundEnabled() ? '1' : '0'); labels();
  });
  $('btn-start').addEventListener('click', start);
  $('btn-change').addEventListener('click', () => { showSelector(storage.get('lang')); });

  const saved = storage.get('lang');
  if (saved && i18n.isAvailable(saved)) {
    try { await i18n.setLanguage(saved); } catch { storage.remove('lang'); }
  }
  if (i18n.lang() && storage.get('lang')) {
    labels(); $('langs').hidden = true; $('btn-change').hidden = false; $('btn-start').disabled = false;
  } else {
    $('bar').hidden = true; showSelector(null); $('btn-start').disabled = true;
  }
}
init();
