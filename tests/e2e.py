# Prueba en navegador real (Playwright/Chromium). Ejecutar con un servidor en :8765.
from playwright.sync_api import sync_playwright
import re
R=[]
def chk(name,cond): R.append((name,bool(cond))); print(('PASS' if cond else 'FAIL'),name)
with sync_playwright() as p:
    b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1000,'height':700}); pg=ctx.new_page()
    errs=[]; pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('http://localhost:8765/index.html')
    pg.wait_for_selector('#langs button')
    chk('1 abre y muestra selector en primera visita', pg.locator('#langs').is_visible())
    chk('2 nueve idiomas', pg.locator('#langs button').count()==9)
    chk('3 inicio deshabilitado hasta elegir', pg.locator('#btn-start').is_disabled())
    pg.locator('#langs button').nth(1).click()   # es-ES
    chk('4 preferencia guardada', pg.evaluate("localStorage.getItem('t3rmin4lw0rd:lang')")=='es-ES')
    chk('5 botón de inicio en español', pg.inner_text('#btn-start')=='Iniciar sistema')
    pg.click('#btn-start')
    pg.wait_for_function("document.querySelector('#out').innerText.includes('[|]')||document.querySelector('#out').innerText.includes('[/]')||document.querySelector('#out').innerText.includes('[-]')",timeout=3000)
    first=pg.inner_text('#out')
    chk('6 primer mensaje de arranque en español, con cuadrado giratorio', 'Inicializando terminal' in first and not re.search('Initializ',first))
    pg.wait_for_selector('#cmd:not([disabled])',timeout=15000)
    out=pg.inner_text('#out')
    chk('7 copyright 2026-2026', 'Copyright (C) 2026-2026' in out)
    pg.fill('#cmd','help'); pg.press('#cmd','Enter')
    pg.wait_for_function("document.querySelector('#out').innerText.includes('[')",timeout=2000)
    frames=set()
    for _ in range(12):
        frames |= set(re.findall(r'\[([|/\\-])\] Procesando comando',pg.inner_text('#out'))); pg.wait_for_timeout(60)
    chk('8 spinner cicla caracteres', len(frames)>=2)
    chk('8b sin barra ni porcentaje', '%' not in pg.inner_text('#out') and '█' not in pg.inner_text('#out'))
    pg.wait_for_selector('#cmd:not([disabled])',timeout=15000)
    out=pg.inner_text('#out')
    chk('9 spinner detenido al terminar', not re.search(r'\[[|/\\-]\] Procesando',out))
    chk('10 help responde', 'Terminal inicializada correctamente.' in out and 'Escriba help' in out)
    pg.fill('#cmd','<img src=x onerror=alert(1)>'); pg.press('#cmd','Enter')
    pg.wait_for_selector('#cmd:not([disabled])',timeout=5000)
    chk('12 comando desconocido no bloquea y es texto', pg.locator('#out img').count()==0 and 'Comando desconocido' in pg.inner_text('#out'))
    pg.press('#cmd','ArrowUp'); chk('historial con flecha arriba', pg.input_value('#cmd').startswith('<img'))
    pg.click('#btn-voice'); chk('13 voz se desactiva', 'NO' in pg.inner_text('#btn-voice') and pg.evaluate("localStorage.getItem('t3rmin4lw0rd:voice')")=='0')
    pg.click('#btn-voice'); chk('13b voz se reactiva', 'SÍ' in pg.inner_text('#btn-voice'))
    # visita posterior
    pg.reload(); pg.wait_for_selector('#btn-start:not([disabled])')
    chk('5b selector no vuelve a aparecer', not pg.locator('#langs').is_visible() and pg.inner_text('#btn-start')=='Iniciar sistema')
    # los 9 idiomas: help y primer mensaje
    for lid,first_msg in [('ja','ターミナルを初期化'),('en','Initializing terminal'),('ru','Инициализация'),('de','Terminal wird'),('fr','Initialisation'),('zh-CN','正在初始化'),('pt-PT','A inicializar'),('es-419','Inicializando')]:
        pg.evaluate(f"localStorage.setItem('t3rmin4lw0rd:lang','{lid}')"); pg.reload(); pg.click('#btn-start')
        pg.wait_for_function("document.querySelector('#out').innerText.length>3",timeout=3000)
        ok=first_msg in pg.inner_text('#out')
        pg.wait_for_selector('#cmd:not([disabled])',timeout=15000)
        pg.fill('#cmd','help'); pg.press('#cmd','Enter'); pg.wait_for_selector('#cmd:not([disabled])',timeout=15000)
        chk(f'11 {lid}: arranque propio y help', ok and 'T3rmin4lw0rd SYSTEM' in pg.inner_text('#out') and not re.search('Initializ|Type help',pg.inner_text('#out')) if lid!='en' else ok and 'Type help' in pg.inner_text('#out'))
    chk('sin excepciones JS', not errs)
    pg.screenshot(path='/tmp/shot.png'); b.close()
print('FALLOS:',[n for n,c in R if not c])
