// Graba el video de referencia: como debe verse la app funcionando al 100 %.
//   cd evaluador/video && npm install && npm run grabar
// Salida: ../media/estado-al-100.mp4 (+ .webm) y capturas ../media/*.png
//
// Modo candidato (subtitulos neutros: solo el comportamiento esperado, SIN tecnicas ni soluciones):
//   MODO=candidato npm run grabar     ->  ../media-candidato/estado-esperado.mp4
//
// Usa el Chrome instalado (channel: 'chrome'), levanta la app en su propio puerto (PORT=5299) para no chocar con
// nada que ya corra, y la apaga al terminar. Cada pestana se graba como un clip y luego se unen en un solo video.
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const CAND = process.env.MODO === 'candidato';
const MEDIA = path.resolve(HERE, CAND ? '../media-candidato' : '../media');
const NOMBRE = CAND ? 'estado-esperado' : 'estado-al-100';
const WORK = path.join(HERE, '.cache');
const PORT = Number(process.env.PORT) || 5299;
const BASE = `http://localhost:${PORT}`;
const REPORT = path.join(ROOT, 'automation/target/cucumber-report.html');
const SIZE = { width: 1280, height: 720 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- app ----------
async function startApp() {
  const vite = path.join(ROOT, 'app-web/node_modules/vite/bin/vite.js');
  if (!fs.existsSync(vite)) throw new Error('Falta app-web/node_modules: ejecuta `npm ci` en app-web');
  const proc = spawn(process.execPath, [vite], {
    cwd: path.join(ROOT, 'app-web'),
    env: { ...process.env, PORT: String(PORT) },
    stdio: 'ignore',
  });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE + '/');
      if (r.ok && (await r.text()).includes('Pedidos Playground')) return proc;
    } catch { /* aun no levanta */ }
    await sleep(500);
  }
  proc.kill();
  throw new Error(`La app no respondio en ${BASE}`);
}

// ---------- subtitulos ----------
const OVERLAY = () => {
  const draw = (t) => {
    let el = document.getElementById('__cap');
    if (!t) { if (el) el.remove(); return; }
    if (!el) {
      el = document.createElement('div');
      el.id = '__cap';
      el.style.cssText = 'position:fixed;right:20px;bottom:20px;width:380px;' +
        'background:rgba(20,20,20,.88);color:#fff;font:600 17px/1.4 Roboto,Helvetica,Arial,sans-serif;' +
        'padding:12px 18px;border-radius:10px;border-left:6px solid #E10098;z-index:2147483647;' +
        'pointer-events:none;box-shadow:0 6px 24px rgba(0,0,0,.35);text-align:left;white-space:pre-line';
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = t;
  };
  window.__setCap = (t) => { try { sessionStorage.setItem('__cap', t || ''); } catch {} draw(t); };
  document.addEventListener('DOMContentLoaded', () => { try { draw(sessionStorage.getItem('__cap')); } catch {} });
};
const cap = (page, text) => page.evaluate((t) => window.__setCap && window.__setCap(t), text);

async function card(page, titulo, subtitulo) {
  await page.goto('about:blank');
  await page.setContent(`<body style="margin:0;height:100vh;display:flex;flex-direction:column;justify-content:center;
    align-items:center;background:#E10098;color:#fff;font-family:Roboto,Helvetica,Arial,sans-serif;text-align:center">
    <h1 style="font-size:54px;margin:0 0 18px">${titulo}</h1>
    <p style="font-size:26px;margin:0;max-width:900px;line-height:1.4;opacity:.95">${subtitulo}</p></body>`);
}

const shot = (page, name) => (CAND ? Promise.resolve() : page.screenshot({ path: path.join(MEDIA, name) }));

// Textos de los subtitulos. El modo evaluador explica la tecnica; el modo candidato solo describe lo que se ve.
const TXT = {
  intro: CAND
    ? 'Así debe verse y comportarse la aplicación cuando la suite de automatización termina en verde\n(6 de 6 escenarios). Tu objetivo es llegar a este estado.'
    : 'Estado esperado al 100 %: así debe verse y comportarse la aplicación\ny la suite de automatización en verde (6 de 6 escenarios).',
  login: CAND
    ? 'Ejercicio 2 · Login\nEl usuario ingresa sus credenciales y entra al dashboard sin errores.'
    : 'Ejercicio 2 · Login\nLos campos se localizan con PageFactory (initElements) y la prueba ingresa sin errores.',
  bannerInicio: CAND
    ? 'Ejercicio 5 · Banner promocional\nVisible 3 s, oculto 4 s, en ciclo. La consulta del banner no deja errores registrados.'
    : 'Ejercicio 5 · Banner promocional\nVisible 3 s, oculto 4 s, en ciclo. La prueba debe responder true/false sin lanzar excepciones.',
  banner: (visible) => CAND
    ? `Ejercicio 5 · Banner promocional (visible 3 s / oculto 4 s)\nEn este momento el banner está: ${visible ? 'PRESENTE' : 'AUSENTE'}`
    : `Ejercicio 5 · Banner promocional (ciclo: visible 3 s / oculto 4 s)\nisPromoBannerPresent() debe devolver: ${visible ? 'PRESENTE (true)' : 'AUSENTE (false)'}`,
  formDeshabilitado: (falta) => CAND
    ? 'Ejercicio 1 · Envío de formulario\nEl botón "Enviar pedido" aparece deshabilitado al cargar…'
    : `Ejercicio 1 · Espera explícita\nBotón "Enviar pedido" DESHABILITADO. Se habilita en ${falta} s…`,
  formHabilitado: CAND
    ? 'Ejercicio 1 · Envío de formulario\nEl botón "Enviar pedido" ya está habilitado.'
    : 'Ejercicio 1 · Espera explícita\nEl botón "Enviar pedido" ya está HABILITADO (3 s). La prueba debe esperar con WebDriverWait, no con un sleep de 5 s.',
  formResultado: CAND
    ? 'Ejercicio 1 · Resultado\nSe muestra la confirmación del pedido y la prueba termina en un tiempo razonable.'
    : 'Ejercicio 1 · Resultado\nSe muestra la confirmación del pedido y la prueba terminó en menos de 4.5 s tras cargar el formulario.',
  tabla: 'Ejercicio 3 · Tabla de pedidos\nSe selecciona el pedido 1002 y el detalle se actualiza.',
  recarga: CAND
    ? 'Ejercicio 3 · Recarga de la página\nSe recarga la página y se vuelve a seleccionar el pedido 1002.'
    : 'Ejercicio 3 · Tras recargar la página\nLas referencias a filas obtenidas antes del refresh dejan de ser válidas (StaleElementReference).\nLa prueba debe localizar la fila DESPUÉS de recargar.',
  tablaResultado: CAND
    ? 'Ejercicio 3 · Resultado\n"Pedido 1002 seleccionado" aparece también después de recargar.'
    : 'Ejercicio 3 · Resultado\n"Pedido 1002 seleccionado" aparece tras recargar y volver a localizar la fila.',
  reporte: 'Ejercicio 4 · Reporte\nEl enlace "Reporte" abre una pestaña NUEVA.',
  pestana: CAND
    ? 'Ejercicio 4 · Pestaña nueva\nTítulo esperado de la pestaña: "Reporte de Pedidos"'
    : 'Ejercicio 4 · Pestaña nueva\nEl foco debe cambiar al nuevo WindowHandle (switchTo().window) antes de leer el título.\nTítulo esperado de la pestaña: "Reporte de Pedidos"',
  reporteResultado: (titulo) => CAND
    ? `Ejercicio 4 · Resultado\nLa pestaña nueva tiene el título "${titulo}"`
    : `Ejercicio 4 · Resultado\ndriver.getTitle() en la pestaña nueva → "${titulo}"`,
  final: 'Resultado final · Reporte de Cucumber\n6 de 6 escenarios en verde: así debe terminar la suite.',
};
const type = (page, sel, text) => page.locator(sel).pressSequentially(text, { delay: 70 });

// ---------- escenas ----------
async function escenaPrincipal(ctx) {
  const page = await ctx.newPage();
  await card(page, 'Pedidos Playground', TXT.intro);
  await sleep(4500);

  // Login (Ejercicio 2)
  await page.goto(BASE + '/');
  await page.waitForSelector('#username');
  await cap(page, TXT.login);
  await sleep(1800);
  await type(page, '#username', 'qa.senior');
  await type(page, '#password', 'Liverpool123');
  await page.click('#toggle-password');
  await shot(page, '01-login.png');
  await sleep(1400);
  await page.click('#login-button');
  await page.waitForSelector('#dashboard-title');

  // Banner promocional (Ejercicio 5)
  await cap(page, TXT.bannerInicio);
  let capturedVisible = false, capturedHidden = false, last = '';
  const t0 = Date.now();
  while (Date.now() - t0 < 12000) {
    const visible = (await page.locator('#promo-banner').count()) > 0;
    const txt = TXT.banner(visible);
    if (txt !== last) { await cap(page, txt); last = txt; }
    if (visible && !capturedVisible) { await shot(page, '02-dashboard-banner-visible.png'); capturedVisible = true; }
    if (!visible && !capturedHidden && capturedVisible) { await shot(page, '03-dashboard-banner-oculto.png'); capturedHidden = true; }
    await sleep(200);
  }

  // Formulario (Ejercicio 1)
  await page.click('#nuevo-pedido-link');
  await page.waitForSelector('#submit-form');
  let lastTxt = '';
  for (;;) {
    const t = await page.evaluate(() => performance.now());
    const enabled = await page.locator('#submit-form').isEnabled();
    const falta = Math.max(0, 3 - t / 1000).toFixed(1);
    const txt = enabled ? TXT.formHabilitado : TXT.formDeshabilitado(falta);
    if (txt !== lastTxt) { await cap(page, txt); lastTxt = txt; }
    if (enabled) break;
    await sleep(100);
  }
  await shot(page, '04-form-boton-habilitado.png');
  await sleep(1500);
  await type(page, '#cliente', 'Ana Torres');
  await type(page, '#producto', 'Televisor 55"');
  await page.fill('#cantidad', '2');
  await sleep(600);
  await page.click('#submit-form');
  await page.waitForSelector('#order-confirmation');
  await page.locator('#order-confirmation').scrollIntoViewIfNeeded();
  await cap(page, TXT.formResultado);
  await shot(page, '05-confirmacion-pedido.png');
  await sleep(3000);

  // Pedidos (Ejercicio 3)
  await page.click('.back-link');
  await page.waitForSelector('#pedidos-link');
  await page.click('#pedidos-link');
  await page.waitForSelector('#pedidos-table');
  await cap(page, TXT.tabla);
  await sleep(1500);
  await page.click('tr[data-id="1002"]');
  await page.waitForSelector('#row-detail');
  await sleep(1500);
  await cap(page, TXT.recarga);
  await sleep(2500);
  await page.reload();
  await page.waitForSelector('#pedidos-table');
  await sleep(1200);
  await page.click('tr[data-id="1002"]');
  await page.waitForSelector('#row-detail');
  await page.locator('#row-detail').scrollIntoViewIfNeeded();
  await cap(page, TXT.tablaResultado);
  await shot(page, '06-pedidos-seleccion.png');
  await sleep(3000);

  // Reporte en pestana nueva (Ejercicio 4)
  await page.goto(BASE + '/dashboard');
  await page.waitForSelector('#open-report');
  await cap(page, TXT.reporte);
  await sleep(2000);
  const [popup] = await Promise.all([ctx.waitForEvent('page'), page.click('#open-report')]);
  await popup.waitForSelector('#report-heading');
  // Se corta el clip de la pestana principal aqui: el resto de la escena se ve en el clip de la pestana nueva.
  await page.close();
  await cap(popup, TXT.pestana);
  await sleep(1500);
  const titulo = await popup.title();
  await cap(popup, TXT.reporteResultado(titulo));
  await shot(popup, '07-reporte-pestana-nueva.png');
  await sleep(4500);
  return { page, popup };
}

async function escenaCucumber(ctx) {
  if (!fs.existsSync(REPORT)) { console.warn('Sin reporte de Cucumber; se omite la escena final.'); return null; }
  const page = await ctx.newPage();
  await page.goto('file://' + REPORT);
  await sleep(1500);
  await cap(page, TXT.final);
  await sleep(1500);
  await shot(page, '08-reporte-cucumber-verde.png');
  await sleep(5500);
  return page;
}

// ---------- main ----------
fs.rmSync(WORK, { recursive: true, force: true });
fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(MEDIA, { recursive: true });

const app = await startApp();
// Si algo falla, que se vea el error real (no el TargetClosedError posterior) y que la app no se quede encendida.
process.on('unhandledRejection', (e) => { if (e && e.name !== 'TargetClosedError') console.error(e); });
process.on('exit', () => { try { app.kill(); } catch { /* ya cerrada */ } });
let browser;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const nuevo = (dir) => browser.newContext({ viewport: SIZE, recordVideo: { dir: path.join(WORK, dir), size: SIZE } });

  const ctxA = await nuevo('a');
  await ctxA.addInitScript(OVERLAY);
  const { page, popup } = await escenaPrincipal(ctxA);
  const clips = [page, popup];

  const ctxB = await nuevo('b');
  await ctxB.addInitScript(OVERLAY);
  const pageB = await escenaCucumber(ctxB);

  const files = [];
  for (const p of clips) files.push(p);
  const rutas = [];
  for (const p of files) rutas.push(p.video());
  const rutasB = pageB ? [pageB.video()] : [];
  await ctxA.close();
  await ctxB.close();
  const paths = [];
  for (const v of [...rutas, ...rutasB]) paths.push(await v.path());

  // Unir clips: se normaliza a mp4 H.264 (reproducible en QuickTime) y se conserva una copia webm.
  const norm = paths.map((p, i) => {
    const out = path.join(WORK, `clip${i}.mp4`);
    const r = spawnSync(ffmpegPath, ['-y', '-i', p, '-vf', `scale=${SIZE.width}:${SIZE.height},fps=25`, '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p', '-crf', '23', '-an', out], { stdio: 'ignore' });
    if (r.status !== 0) throw new Error('ffmpeg fallo normalizando ' + p);
    return out;
  });
  const lista = path.join(WORK, 'lista.txt');
  fs.writeFileSync(lista, norm.map((n) => `file '${n}'`).join('\n'));
  const mp4 = path.join(MEDIA, `${NOMBRE}.mp4`);
  let r = spawnSync(ffmpegPath, ['-y', '-f', 'concat', '-safe', '0', '-i', lista, '-c', 'copy', mp4], { stdio: 'ignore' });
  if (r.status !== 0) throw new Error('ffmpeg fallo uniendo clips');
  if (!CAND) {
    r = spawnSync(ffmpegPath, ['-y', '-i', mp4, '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-an',
      path.join(MEDIA, `${NOMBRE}.webm`)], { stdio: 'ignore' });
  }
  console.log('Video:', mp4, `(${(fs.statSync(mp4).size / 1024 / 1024).toFixed(1)} MB)`);
} catch (e) {
  console.error('ERROR en la grabacion:', e);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  app.kill();
}
