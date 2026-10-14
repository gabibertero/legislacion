import { test, expect } from '@playwright/test';
import cfg from '../sitio.config.mjs';
import { K, TOP, TEORIA, CHOICES, TARJETAS, romperStorage, rastrear, sinScrollH } from './util.mjs';

test('sin JS el contenido se ve (Home, Top 15, preguntero, choices, tarjetas)', async ({ browser, baseURL }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await ctx.newPage();
  await page.goto('');
  await expect(page.locator('h1')).toContainText(cfg.materia.corto);
  await expect(page.locator('.mapa-g').first()).toBeVisible();
  await expect(page.locator('[data-tema-toggle]')).toBeHidden(); // los controles JS arrancan hidden
  await expect(page.locator('[data-plan]')).toBeHidden();
  await page.goto(TOP);
  await expect(page.locator('[data-pregunta]').first()).toBeVisible();
  await expect(page.locator('.top-prog')).toBeHidden();
  await page.goto(TEORIA);
  await expect(page.locator('[data-pregunta]').first()).toBeVisible();
  await expect(page.locator('.pg-barra')).toBeHidden();
  for (const u of [CHOICES, TARJETAS]) {
    await page.goto(u);
    await expect(page.locator('[data-estatico] article').first()).toBeVisible();
    await expect(page.locator('[data-config]')).toBeHidden();
  }
  await ctx.close();
});

test('con localStorage roto no hay errores en las páginas de estudio', async ({ page }) => {
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  await romperStorage(page);
  await page.goto('');
  await page.goto(TOP);
  await page.locator('[data-marca="sabe"]').first().click();
  await page.goto(CHOICES);
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.getByRole('button', { name: 'Corregir' }).click();
  await page.goto(TARJETAS);
  await page.getByRole('button', { name: 'Empezar' }).click();
  await page.keyboard.press('Space');
  await page.keyboard.press('2');
  await page.locator('[data-tema-toggle]').click();
  expect(errores).toEqual([]);
});

test('el tema se alterna y persiste con el prefijo del sitio', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  const btn = page.getByRole('button', { name: 'Modo oscuro' });
  await expect(btn).toHaveAttribute('aria-pressed', 'false');
  await btn.click();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-tema', 'dark');
  await expect(btn).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate((k) => localStorage.getItem(k), K('tema'))).toBe('dark');
});

test('la paleta de la config se aplica (claro y oscuro)', async ({ page }) => {
  const color = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--acento').trim().toLowerCase());
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  expect(await color()).toBe(cfg.paleta.claro.acento.toLowerCase());
  await page.emulateMedia({ colorScheme: 'dark' });
  expect(await color()).toBe(cfg.paleta.oscuro.acento.toLowerCase());
});

test('todas las páginas devuelven 200 y las rutas salen de las instancias', async ({ page }) => {
  const urls = await rastrear(page);
  for (const i of cfg.instancias.filter((x) => x.estado !== 'proximamente')) {
    expect(urls.some((u) => u.endsWith(`/${i.ruta ?? i.id}/`)), i.id).toBe(true);
  }
  expect(urls.length).toBeGreaterThanOrEqual(8);
});

for (const tema of ['light', 'dark']) {
  test.describe(`390px (${tema})`, () => {
    test.use({ viewport: { width: 390, height: 844 } });
    test('sin scroll horizontal en todas las páginas', async ({ page }) => {
      await page.emulateMedia({ colorScheme: tema });
      const malas = [];
      await rastrear(page, async (u) => { if (!(await sinScrollH(page))) malas.push(u); });
      expect(malas).toEqual([]);
    });
  });
}
