import { test, expect } from '@playwright/test';
import { K, TARJETAS, sinScrollH } from './util.mjs';

const datos = (page) => page.evaluate(() => JSON.parse(document.querySelector('#tj-datos').textContent));
const cajas = async (page) => JSON.parse((await page.evaluate((k) => localStorage.getItem(k), K('tarjetas'))) || '{}');
const actual = async (page, items) => { const f = await page.locator('.tj-frente').textContent(); return items.find((t) => t.frente === f); };

test('voltear con Espacio, 2 = la sabía (sube de caja), 1 = no la sabía (vuelve a la caja 1 y reaparece)', async ({ page }) => {
  await page.goto(TARJETAS);
  const { items } = await datos(page);
  await expect(page.locator('[data-cajas]')).toHaveText(`Caja 1: ${items.length} · Caja 2: 0 · Caja 3: 0`);
  await page.getByRole('button', { name: 'Empezar' }).click();
  const total = items.length;
  await expect(page.locator('.tj-prog')).toContainText(`Quedan ${total}`);
  const t1 = await actual(page, items);
  await expect(page.locator('.tj-dorso')).toBeHidden();
  await page.keyboard.press('1'); // todavía no se dio vuelta: no responde
  await expect(page.locator('.tj-prog')).toContainText(`Quedan ${total}`);
  await page.keyboard.press('Space');
  await expect(page.locator('.tj-dorso')).toBeVisible();
  await expect(page.locator('.tj-dorso')).toContainText(t1.dorso);
  await page.keyboard.press('Space'); // otra vez Espacio no responde
  await expect(page.locator('.tj-prog')).toContainText(`Quedan ${total}`);
  await page.keyboard.press('2');
  expect((await cajas(page))[t1.id]).toBe(2);
  await expect(page.locator('.tj-prog')).toContainText(`Quedan ${total - 1}`);
  // segunda: no la sabía -> sigue en caja 1 y vuelve a aparecer en la sesión
  const t2 = await actual(page, items);
  await page.keyboard.press('Space');
  await page.keyboard.press('1');
  expect((await cajas(page))[t2.id]).toBe(1);
  await expect(page.locator('.tj-prog')).toContainText(`Quedan ${total - 1}`); // no baja
  const vistas = new Set();
  for (let i = 0; i < total + 2 && (await page.locator('.tj-frente').count()); i++) {
    vistas.add((await actual(page, items)).id);
    await page.keyboard.press('Space');
    await page.keyboard.press('2');
  }
  expect(vistas.has(t2.id)).toBe(true);
  await expect(page.getByRole('heading', { name: 'Sesión terminada' })).toBeVisible();
  const c = await cajas(page);
  expect(Object.keys(c).length).toBe(total);
  await page.getByRole('button', { name: 'Armar otra sesión' }).click();
  // el conteo de cajas de la config refleja lo guardado
  const dom = Object.values(c).filter((v) => v === 3).length;
  await expect(page.locator('[data-cajas]')).toContainText(`Caja 3: ${dom}`);
});

test('con los botones y con filtro por tema', async ({ page }) => {
  await page.goto(TARJETAS);
  const { items, temas } = await datos(page);
  const tema = temas[0].id;
  await page.locator('select[name=tema]').selectOption(tema);
  await page.getByRole('button', { name: 'Empezar' }).click();
  const n = items.filter((t) => t.tema === tema).length;
  await expect(page.locator('.tj-prog')).toContainText(`Quedan ${n}`);
  const t = await actual(page, items);
  expect(t.tema).toBe(tema);
  await page.getByRole('button', { name: /Dar vuelta/ }).click();
  await expect(page.getByRole('button', { name: /^No la sabía/ })).toBeVisible();
  await page.getByRole('button', { name: /^La sabía/ }).click();
  expect((await cajas(page))[t.id]).toBe(2);
});

test('las tarjetas en caja 3 quedan afuera salvo "Incluir dominadas"; caja corrupta = caja 1', async ({ page }) => {
  await page.goto(TARJETAS);
  const { items } = await datos(page);
  await page.evaluate(([k, id, otra]) => localStorage.setItem(k, JSON.stringify({ [id]: 3, [otra]: 99, zzz: 'x' })), [K('tarjetas'), items[0].id, items[1].id]);
  await page.reload();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.locator('.tj-prog')).toContainText(`Quedan ${items.length - 1}`);
  await page.reload();
  await page.getByLabel(/Incluir las ya dominadas/).check();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.locator('.tj-prog')).toContainText(`Quedan ${items.length}`);
});

test('cada tarjeta trae "Explicámelo con IA" con contexto', async ({ page }) => {
  await page.goto(TARJETAS);
  await page.getByRole('button', { name: 'Empezar' }).click();
  const card = page.locator('.tj-card');
  await expect(card.locator('.ia-menu > summary')).toContainText('Explicámelo con IA');
  await expect(card.locator('[data-ia-enun]')).not.toBeEmpty();
  await expect(card.locator('[data-ia-modelo]')).not.toBeEmpty();
});

test.describe('390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('tarjetas sin scroll horizontal', async ({ page }) => {
    await page.goto(TARJETAS);
    expect(await sinScrollH(page)).toBe(true);
    await page.getByRole('button', { name: 'Empezar' }).click();
    await page.getByRole('button', { name: /Dar vuelta/ }).click();
    expect(await sinScrollH(page)).toBe(true);
  });
});
