import { test, expect } from '@playwright/test';
import { K, CHOICES, sinScrollH } from './util.mjs';

const datos = (page) => page.evaluate(() => JSON.parse(document.querySelector('#ch-datos').textContent));
const estado = async (page) => JSON.parse((await page.evaluate((k) => localStorage.getItem(k), K('choices'))) || '{}');
// Qué choice es el que está en pantalla (por el texto del legend: "n. pregunta").
const actual = async (page, items) => {
  const leg = await page.locator('.ch-card legend').first().textContent();
  return items.find((c) => leg.endsWith(c.pregunta));
};
const marcar = async (page, ks) => { for (const k of ks) await page.locator('.ch-card .ch-opcion').nth(k).locator('input').check(); };

test('configurar, responder con corrección inmediata, puntaje y falladas', async ({ page }) => {
  await page.goto(CHOICES);
  const { items } = await datos(page);
  expect(items.length).toBeGreaterThanOrEqual(5);
  await page.locator('select[name=cantidad]').selectOption('5');
  await page.getByRole('button', { name: 'Empezar' }).click();
  const falladas = [];
  for (let n = 1; n <= 5; n++) {
    await expect(page.locator('.ch-prog')).toHaveText(`Pregunta ${n} de 5`);
    const c = await actual(page, items);
    const multi = c.correctas.length > 1;
    await expect(page.locator('.ch-card .ch-opcion input').first()).toHaveAttribute('type', multi ? 'checkbox' : 'radio');
    const mal = n === 1;
    if (mal) { await marcar(page, [c.opciones.map((_, k) => k).find((k) => !c.correctas.includes(k))]); falladas.push(c.id); } else await marcar(page, c.correctas);
    await page.getByRole('button', { name: 'Corregir' }).click();
    const fb = page.locator('.ch-fb');
    await expect(fb).toContainText(mal ? 'Incorrecto.' : 'Correcto.');
    await expect(fb).toContainText(c.explicacion);
    if (c.fuente) await expect(fb).toContainText('Fuente: ' + c.fuente);
    await expect(page.locator('.ch-card .ch-opcion input').first()).toBeDisabled();
    await page.getByRole('button', { name: n === 5 ? 'Ver puntaje' : 'Siguiente' }).click();
  }
  await expect(page.locator('.ch-puntaje h2')).toHaveText('Puntaje: 4 de 5 (80%)');
  expect(Object.keys(await estado(page))).toHaveLength(5);
  expect(await estado(page)).toMatchObject({ [falladas[0]]: 0 });
  // "Solo las que fallé": queda exactamente esa
  await page.getByRole('button', { name: 'Armar otra práctica' }).click();
  await expect(page.locator('[data-n-falladas]')).toHaveText('1');
  await page.getByLabel(/Solo las que fallé/).check();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.locator('.ch-prog')).toHaveText('Pregunta 1 de 1');
  const c = await actual(page, items);
  expect(c.id).toBe(falladas[0]);
  await marcar(page, c.correctas);
  await page.getByRole('button', { name: 'Corregir' }).click();
  await page.getByRole('button', { name: 'Ver puntaje' }).click();
  await expect(page.locator('.ch-puntaje h2')).toContainText('1 de 1');
  expect((await estado(page))[c.id]).toBe(1); // acertarla la saca de las falladas
});

test('corrección al final: sin feedback hasta terminar, y revisión con explicación y fuente', async ({ page }) => {
  await page.goto(CHOICES);
  await page.getByLabel('Al final').check();
  await page.locator('select[name=cantidad]').selectOption('5');
  await page.getByRole('button', { name: 'Empezar' }).click();
  for (let n = 1; n <= 5; n++) {
    await page.locator('.ch-card .ch-opcion input').first().check();
    await expect(page.locator('.ch-fb')).toHaveCount(0);
    await page.getByRole('button', { name: n === 5 ? 'Terminar' : 'Siguiente' }).click();
  }
  await expect(page.locator('.ch-puntaje h2')).toContainText('de 5');
  await expect(page.locator('.ch-card')).toHaveCount(5);
  await expect(page.locator('.ch-fb')).toHaveCount(5);
});

test('filtros: nivel y tema; sin resultados avisa; un nivel solo trae ese nivel', async ({ page }) => {
  await page.goto(CHOICES);
  const { items, temas } = await datos(page);
  await page.getByLabel('Fácil', { exact: true }).uncheck();
  await page.getByLabel('Media', { exact: true }).uncheck();
  await page.getByLabel('Difícil', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.locator('[data-aviso]')).toContainText('No hay choices');
  await page.getByLabel('Media', { exact: true }).check();
  await page.locator('select[name=cantidad]').selectOption('0');
  await page.getByRole('button', { name: 'Empezar' }).click();
  const medias = items.filter((c) => c.nivel === 'media').length;
  await expect(page.locator('.ch-prog')).toHaveText(`Pregunta 1 de ${medias}`);
  expect(temas.length).toBeGreaterThan(0);
});

test('"solo las que fallé" sin falladas avisa', async ({ page }) => {
  await page.goto(CHOICES);
  await page.getByLabel(/Solo las que fallé/).check();
  await page.getByRole('button', { name: 'Empezar' }).click();
  await expect(page.locator('[data-aviso]')).toContainText('No tenés choices fallados');
});

test('cada choice trae "Explicámelo con IA" con contexto y los datos corruptos de localStorage no rompen', async ({ page }) => {
  await page.addInitScript((k) => localStorage.setItem(k, '{roto'), K('choices'));
  await page.goto(CHOICES);
  await page.locator('select[name=cantidad]').selectOption('5');
  await page.getByRole('button', { name: 'Empezar' }).click();
  const card = page.locator('.ch-card');
  await expect(card.locator('.ia-menu > summary')).toContainText('Explicámelo con IA');
  await expect(card.locator('[data-ia-tit]')).not.toBeEmpty();
  await expect(card.locator('[data-ia-modelo]')).toContainText('Correcta');
  await expect(card.locator('[data-ia-enun]')).toContainText('1.');
});

test.describe('390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('choices sin scroll horizontal (config, pregunta, revisión)', async ({ page }) => {
    await page.goto(CHOICES);
    expect(await sinScrollH(page)).toBe(true);
    await page.locator('select[name=cantidad]').selectOption('5');
    await page.getByRole('button', { name: 'Empezar' }).click();
    expect(await sinScrollH(page)).toBe(true);
    await page.getByRole('button', { name: 'Corregir' }).click();
    await expect(page.locator('.ch-aviso').last()).toContainText('Marcá al menos una opción');
    await page.locator('.ch-card .ch-opcion input').first().check();
    await page.getByRole('button', { name: 'Corregir' }).click();
    expect(await sinScrollH(page)).toBe(true);
  });
});
