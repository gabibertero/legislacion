// Helpers compartidos por los specs. Todo lo específico de la materia sale de sitio.config.mjs.
import { expect } from '@playwright/test';
import cfg from '../sitio.config.mjs';

export const inst = cfg.instancias.find((i) => i.estado !== 'proximamente');
export const RAIZ = `${inst.ruta ?? inst.id}/`;
export const TOP = `${RAIZ}top15/`;
export const TEORIA = `${RAIZ}teoria/`;
export const CHOICES = `${RAIZ}choices/`;
export const TARJETAS = `${RAIZ}tarjetas/`;
export const MACHETES = `${RAIZ}machetes/`;
export const K = (k) => cfg.prefijo + k; // clave de localStorage con el prefijo del sitio

export const sinScrollH = (page) => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);

// storage roto (modo privado / bloqueado)
export const romperStorage = (page) =>
  page.addInitScript(() => {
    const falla = () => { throw new Error('storage roto'); };
    Storage.prototype.getItem = falla; Storage.prototype.setItem = falla; Storage.prototype.removeItem = falla;
  });

// Recorre el sitio desde el Home siguiendo links internos (HTML). Devuelve las URLs visitadas, todas con 200.
export async function rastrear(page, alVisitar = async () => {}, max = 80) {
  await page.goto('');
  const raiz = new URL(page.url()).href;
  const cola = [raiz], vistos = new Set(), out = [];
  while (cola.length && out.length < max) {
    const u = cola.shift();
    if (vistos.has(u)) continue;
    vistos.add(u);
    const r = await page.goto(u);
    expect(r.status(), u).toBe(200);
    out.push(u);
    await alVisitar(u);
    const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.href.split('#')[0]));
    for (const h of hrefs) if (h.startsWith(raiz) && !/\.(svg|png|jpe?g|webp|pdf)$/i.test(h) && !vistos.has(h)) cola.push(h);
  }
  return out;
}

// Intercepta los clics en <a target=_blank> (así abre ia.js): guarda la URL y no abre nada.
export const espiarOpen = (page) =>
  page.addInitScript(() => {
    window.__abiertas = [];
    document.addEventListener('click', (e) => { const a = e.target.closest?.('a[target=_blank]'); if (a) { window.__abiertas.push(a.href); e.preventDefault(); } }, true);
  });
export const abiertas = (page) => page.evaluate(() => window.__abiertas);
