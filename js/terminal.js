// Interfaz de la terminal: salida, entrada, historial. Todo se inserta como texto (textContent).
import { CONFIG } from './config.js';
import { createSpinner } from './spinner.js';

export const sleep = ms => new Promise(r => setTimeout(r, ms));
const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export class Terminal {
  constructor({ out, input, line }) {
    Object.assign(this, { out, input, line, history: [], idx: 0, busy: true, skip: false, onSubmit: null, onEscape: null });
    input.addEventListener('keydown', e => this.#key(e));
    out.addEventListener('pointerdown', () => { this.skip = true; });
    document.addEventListener('keydown', () => { this.skip = true; }, true);
    document.getElementById('screen').addEventListener('click', () => { if (!this.busy && !getSelection().toString()) input.focus(); });
    this.setBusy(true);
  }
  #key(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (this.busy) return;
      const raw = this.input.value;
      this.input.value = '';
      if (raw.trim()) { this.history.push(raw); this.idx = this.history.length; }
      this.onSubmit?.(raw);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.idx > 0) this.input.value = this.history[--this.idx];
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.idx = Math.min(this.idx + 1, this.history.length);
      this.input.value = this.history[this.idx] ?? '';
    } else if (e.key === 'Escape') this.onEscape?.();
  }
  setBusy(b) {
    this.busy = b; this.input.disabled = b; this.line.classList.toggle('busy', b);
    if (!b) this.input.focus({ preventScroll: true });
  }
  #scroll() { this.out.scrollTop = this.out.scrollHeight; }
  addLine(text = '', cls = 'sys') {
    const d = document.createElement('div'); d.className = cls; d.textContent = text;
    this.out.appendChild(d); this.#scroll(); return d;
  }
  async print(text, { cls = 'sys', typed = false } = {}) {
    const d = this.addLine('', cls);
    if (!typed || reduced() || this.skip) { d.textContent = text; this.#scroll(); return d; }
    const chars = Array.from(text);
    for (let i = 0; i < chars.length; i += CONFIG.typeCharsPerTick) {
      if (this.skip) { d.textContent = text; break; }
      d.textContent = chars.slice(0, i + CONFIG.typeCharsPerTick).join('');
      this.#scroll(); await sleep(CONFIG.typeTickMs);
    }
    d.textContent = text; this.#scroll(); return d;
  }
  async printLines(lines, opts) { this.skip = false; for (const l of lines) await this.print(l, opts); }
  spinner(text) { return createSpinner(this.addLine('', 'sys'), text); }
  clear() { this.out.textContent = ''; }
}
