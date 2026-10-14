// Mide calidad visual de una URL con Playwright y escribe JSON por stdout.
// Uso: node scripts/medir-estetica.mjs <url> [--ancho 390] [--tema light|dark] [--max 40]
// Mide: contraste WCAG (resuelve colores con canvas, compone alfa/opacidad; soporta color-mix y color(srgb)),
// desbordes horizontales (excluye math, .katex-mathml, svg *), objetivos táctiles <44px por selector,
// fuentes <13px por tamaño/selector y padding/margin fuera de la escala 4/8/12/16/24/32/48/64 (±1px).
import { chromium } from '@playwright/test';

const args = process.argv.slice(2);
const url = args.find((a) => !a.startsWith('--') && !/^\d+$|^(light|dark)$/.test(a)) ?? args[0];
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : d; };
if (!url) { console.error('Uso: node scripts/medir-estetica.mjs <url> [--ancho 390] [--tema light|dark] [--max 40]'); process.exit(2); }
const ancho = Number(opt('ancho', 1280)), tema = opt('tema', 'light'), max = Number(opt('max', 40));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: ancho, height: 900 }, colorScheme: tema });
await page.goto(url, { waitUntil: 'networkidle' });

const informe = await page.evaluate(([MAX]) => {
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  ctx.canvas.width = ctx.canvas.height = 1;
  // Resuelve cualquier color CSS (incluye color-mix, color(srgb), var) a RGBA 0-255 pintando un píxel.
  const probe = document.createElement('span'); document.body.append(probe);
  const rgba = (css) => {
    probe.style.color = ''; probe.style.color = css;
    if (!probe.style.color) return [0, 0, 0, 0];
    const comp = getComputedStyle(probe).color;
    ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = '#000'; ctx.fillStyle = comp; ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    // fillRect con alfa sobre transparente conserva el alfa en el canal a
    return [r, g, b, a / 255];
  };
  const sobre = (f, b) => { const a = f[3]; return [f[0] * a + b[0] * (1 - a), f[1] * a + b[1] * (1 - a), f[2] * a + b[2] * (1 - a), 1]; };
  const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const sel = (el) => {
    if (el.id) return `#${el.id}`;
    const c = [...el.classList].slice(0, 2).join('.');
    return el.tagName.toLowerCase() + (c ? '.' + c : '') + (el.dataset && Object.keys(el.dataset)[0] ? `[data-${Object.keys(el.dataset)[0].replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}]` : '');
  };
  const excluido = (el) => el.closest('math, .katex-mathml, svg') && true;
  const visible = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  // Fondo efectivo: compone capas desde el elemento hacia arriba; opacidad de ancestros se acumula en el texto.
  const fondo = (el) => {
    const capas = [];
    for (let e = el; e; e = e.parentElement) { const c = rgba(getComputedStyle(e).backgroundColor); if (c[3] > 0) capas.push(c); if (c[3] === 1) break; }
    const base = [255, 255, 255, 1]; // sin fondo opaco en la cadena: blanco del canvas del navegador
    return capas.reverse().reduce((b, c) => sobre(c, b), base);
  };
  const opac = (el) => { let o = 1; for (let e = el; e; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return o; };

  const contraste = [], desbordes = [], tactiles = {}, fuentes = {}, espaciado = {};
  const ESCALA = [0, 4, 8, 12, 16, 24, 32, 48, 64];
  const enEscala = (v) => ESCALA.some((e) => Math.abs(e - v) <= 1);
  const iw = document.documentElement.clientWidth;

  for (const el of document.body.querySelectorAll('*')) {
    if (excluido(el) || !visible(el) || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();

    // texto propio
    const texto = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (texto) {
      const fs = parseFloat(cs.fontSize);
      const bg = fondo(el);
      let fg = rgba(cs.color); fg[3] *= opac(el);
      const col = sobre(fg, bg);
      const cr = ratio(col, bg);
      const grande = fs >= 24 || (fs >= 18.66 && Number(cs.fontWeight) >= 700);
      const min = grande ? 3 : 4.5;
      if (cr < min) contraste.push({ selector: sel(el), ratio: +cr.toFixed(2), minimo: min, fontSize: fs, texto: el.textContent.trim().slice(0, 40) });
      if (fs < 13) { const k = `${sel(el)} (${fs}px)`; fuentes[k] = (fuentes[k] || 0) + 1; }
    }
    // desbordes horizontales
    if (r.right > iw + 1 || r.left < -1) {
      const recortado = [...(function* () { for (let e = el.parentElement; e; e = e.parentElement) yield e; })()].some((e) => ['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(e).overflowX) && e !== document.documentElement && e !== document.body);
      if (!recortado) desbordes.push({ selector: sel(el), left: Math.round(r.left), right: Math.round(r.right), ancho: iw });
    }
    // objetivos táctiles
    if (el.matches('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button], label:has(input)') && (r.width < 44 || r.height < 44)) {
      const enLinea = el.tagName === 'A' && cs.display === 'inline' && el.closest('p, li, td, span');
      if (!enLinea) { const k = sel(el); (tactiles[k] ||= { selector: k, cantidad: 0, minAncho: 1e9, minAlto: 1e9 }); const t = tactiles[k]; t.cantidad++; t.minAncho = Math.min(t.minAncho, Math.round(r.width)); t.minAlto = Math.min(t.minAlto, Math.round(r.height)); }
    }
    // espaciado
    for (const p of ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft']) {
      const v = parseFloat(cs[p]);
      if (!Number.isFinite(v) || v < 0 || enEscala(v)) continue;
      const k = `${sel(el)} ${p.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}: ${+v.toFixed(1)}px`;
      espaciado[k] = (espaciado[k] || 0) + 1;
    }
  }
  const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, MAX).map(([k, n]) => ({ valor: k, cantidad: n }));
  return {
    scrollHorizontal: document.documentElement.scrollWidth > iw,
    contraste: { fallan: contraste.length, items: contraste.slice(0, MAX) },
    desbordes: { cantidad: desbordes.length, items: desbordes.slice(0, MAX) },
    tactilesMenores44: { selectores: Object.keys(tactiles).length, items: Object.values(tactiles).slice(0, MAX) },
    fuentesMenores13: { grupos: Object.keys(fuentes).length, items: top(fuentes) },
    espaciadoFueraDeEscala: { grupos: Object.keys(espaciado).length, escala: [4, 8, 12, 16, 24, 32, 48, 64], items: top(espaciado) },
  };
}, [max]);

await browser.close();
console.log(JSON.stringify({ url, ancho, tema, ...informe }, null, 2));
