import { test, expect } from '@playwright/test';
import cfg from '../sitio.config.mjs';
import { K, inst, RAIZ, TOP, romperStorage, sinScrollH } from './util.mjs';

const datos = (page) => page.evaluate(() => JSON.parse(document.querySelector('#home-datos').textContent));

test('Home carga y sus links devuelven 200', async ({ page, request }) => {
  await page.goto('');
  await expect(page.locator('h1')).toContainText(cfg.materia.largo);
  const hrefs = await page.locator('a[href]').evaluateAll((as) => as.map((a) => a.href.split('#')[0]).filter((h) => h.startsWith(location.origin)));
  expect(hrefs.some((h) => h.endsWith(`/${inst.ruta ?? inst.id}/top15/`))).toBe(true);
  expect(hrefs.some((h) => h.endsWith('/u1/'))).toBe(true); // guía vieja
  for (const h of [...new Set(hrefs)]) expect((await request.get(h)).status(), h).toBe(200);
});

test('accesos grandes: Top 15, Resumen, Simulacro, Choices, Tarjetas, Machete', async ({ page }) => {
  await page.goto('');
  const acc = page.locator('.accesos-home li');
  await expect(acc).toHaveCount(6);
  for (const n of ['Top 15', 'Resumen', 'Simulacro', 'Choices', 'Tarjetas', 'Machete']) await expect(acc.filter({ hasText: n }).first()).toBeVisible();
  await page.goto(RAIZ); // la página de la instancia tiene los mismos accesos
  await expect(page.locator('.accesos-grid li')).toHaveCount(6);
});

test('cuenta regresiva al 21/10/2026 08:00', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 9, 14, 7, 59, 30) });
  await page.goto('');
  await expect(page.locator('[data-cuenta]')).toHaveText('7 días 0 h 0 min');
  await page.clock.runFor(3600 * 1000);
  await expect(page.locator('[data-cuenta]')).toHaveText('6 días 23 h 0 min');
});

test('cuenta regresiva: parcial pasado', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 9, 22, 9, 0, 0) });
  await page.goto('');
  await expect(page.locator('[data-cuenta]')).toContainText('ya empezó o pasó');
  await expect(page.locator('[data-plan] li')).toHaveCount(0);
});

test('progreso por tema: preguntas sabidas + tarjetas caja 3 + choices acertados', async ({ page }) => {
  await page.goto('');
  const { temas, items } = await datos(page);
  await expect(page.locator('[data-tema] [data-pct]').first()).toHaveText('0%');
  const t = temas.find((x) => ['preguntas', 'tarjetas', 'choices'].every((k) => items[k].some((p) => p.tema === x.id))) ?? temas[0];
  const del = (k) => items[k].filter((x) => x.tema === t.id);
  await page.evaluate(([pre, p, tj, ch]) => {
    p.forEach((x) => localStorage.setItem(pre + 'preg:' + x.id, 'sabe'));
    localStorage.setItem(pre + 'tarjetas', JSON.stringify(Object.fromEntries(tj.map((x) => [x.id, 3]))));
    localStorage.setItem(pre + 'choices', JSON.stringify(Object.fromEntries(ch.map((x) => [x.id, 1]))));
  }, [cfg.prefijo, del('preguntas'), del('tarjetas'), del('choices')]);
  await page.reload();
  await expect(page.locator(`[data-tema="${t.id}"] [data-pct]`)).toHaveText('100%');
  await expect(page.locator(`[data-tema="${t.id}"] [data-tema-barra]`)).toHaveCSS('--p', '100%');
  const otro = temas.find((x) => x.id !== t.id);
  await expect(page.locator(`[data-tema="${otro.id}"] [data-pct]`)).toHaveText('0%');
  await expect(page.locator('[data-prog-global]')).toContainText('ítems dominados');
});

test('progreso: marcas a medias y datos corruptos no rompen', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await page.goto('');
  await page.evaluate((pre) => { localStorage.setItem(pre + 'tarjetas', '{roto'); localStorage.setItem(pre + 'choices', '[1,2]'); localStorage.setItem(pre + 'ultimo', 'nada'); }, cfg.prefijo);
  await page.reload();
  await expect(page.locator('[data-prog-global]')).toContainText('0 de');
  await expect(page.locator('[data-seguir]')).toBeHidden();
  expect(errores).toEqual([]);
});

test('plan sugerido: desde hoy hasta el día del parcial, con hoy marcado', async ({ page }) => {
  await page.clock.install({ time: new Date(2026, 9, 14, 10, 0, 0) });
  await page.goto('');
  const dias = page.locator('[data-plan] li');
  await expect(dias).toHaveCount(8);
  await expect(dias.first()).toHaveAttribute('aria-current', 'date');
  await expect(dias.first()).toContainText('hoy');
  await expect(dias.nth(6)).toContainText('Simulacro completo');
  await expect(dias.nth(7)).toContainText('21');
  const { temas } = await datos(page);
  const texto = await page.locator('[data-plan]').textContent();
  for (const t of temas) expect(texto).toContain(t.titulo);
});

test('seguir donde dejaste aparece tras visitar el Top 15', async ({ page }) => {
  await page.goto('');
  await expect(page.locator('[data-seguir]')).toBeHidden();
  await page.goto(TOP);
  await page.goto('');
  await expect(page.locator('[data-seguir] a')).toHaveAttribute('href', /top15\/$/);
});

test('reiniciar progreso borra solo las claves del prefijo', async ({ page }) => {
  await page.goto('');
  await page.evaluate((k) => { localStorage.setItem(k, 'sabe'); localStorage.setItem('otra-app:x', '1'); }, K('preg:x'));
  await page.getByRole('button', { name: 'Reiniciar progreso' }).click();
  await page.getByRole('button', { name: 'Sí, borrar todo' }).click();
  const claves = await page.evaluate(() => Object.keys(localStorage));
  expect(claves).toContain('otra-app:x');
  expect(claves.filter((k) => k.startsWith(cfg.prefijo))).toEqual([]);
});

test('el Inicio funciona con localStorage roto', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await romperStorage(page);
  await page.goto('');
  await expect(page.locator('h1')).toContainText(cfg.materia.corto);
  await expect(page.locator('[data-cuenta]')).not.toBeEmpty();
  expect(errores).toEqual([]);
});

test.describe('390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('Home y página de la instancia sin scroll horizontal', async ({ page }) => {
    await page.goto('');
    expect(await sinScrollH(page)).toBe(true);
    await page.goto(RAIZ);
    expect(await sinScrollH(page)).toBe(true);
  });
});
