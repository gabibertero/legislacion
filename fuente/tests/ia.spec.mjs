import { test, expect } from '@playwright/test';
import { TOP, TEORIA, CHOICES, TARJETAS, espiarOpen, abiertas } from './util.mjs';

// window.open se intercepta: se comprueba la URL, no se abre nada.
const pedir = async (page, caja, nombre) => {
  await caja.locator('.ia-menu > summary').click();
  await caja.getByRole('button', { name: nombre, exact: true }).click();
};

test('Preguntero: Claude y ChatGPT abren con ?q= (corrección con la respuesta escrita)', async ({ page }) => {
  await espiarOpen(page);
  await page.goto(TEORIA);
  const art = page.locator('[data-pregunta]').first();
  await art.getByLabel('Tu respuesta').fill('Respuesta de prueba');
  await pedir(page, art, 'Claude');
  await pedir(page, art, 'ChatGPT');
  const [a, b] = await abiertas(page);
  expect(a).toMatch(/^https:\/\/claude\.ai\/new\?q=/);
  expect(b).toMatch(/^https:\/\/chatgpt\.com\/\?q=/);
  expect(decodeURIComponent(a.split('?q=')[1])).toContain('Respuesta de prueba');
  await expect(art.locator('[data-ia-aviso]')).toContainText('ChatGPT');
});

test('Gemini abre sin ?q (se pega); "Solo copiar" no abre nada', async ({ page }) => {
  await espiarOpen(page);
  await page.goto(TOP);
  const art = page.locator('[data-pregunta]').first();
  await pedir(page, art, 'Gemini');
  await pedir(page, art, 'Solo copiar el prompt');
  expect(await abiertas(page)).toEqual(['https://gemini.google.com/app']);
});

test('Choices: "Explicámelo con IA" lleva tema, pregunta con opciones y la correcta con la explicación', async ({ page }) => {
  await espiarOpen(page);
  await page.goto(CHOICES);
  const { items } = await page.evaluate(() => JSON.parse(document.querySelector('#ch-datos').textContent));
  await page.locator('select[name=cantidad]').selectOption('5');
  await page.getByRole('button', { name: 'Empezar' }).click();
  const leg = await page.locator('.ch-card legend').first().textContent();
  const c = items.find((x) => leg.endsWith(x.pregunta));
  await pedir(page, page.locator('.ch-card'), 'Claude');
  const [u] = await abiertas(page);
  expect(u).toMatch(/^https:\/\/claude\.ai\/new\?q=/);
  const p = decodeURIComponent(u.split('?q=')[1]);
  expect(p).toContain(c.pregunta);
  for (const o of c.opciones) expect(p).toContain(o);
  expect(p).toContain(c.explicacion);
  expect(p).toContain('Explicame este tema');
});

test('Tarjetas: "Explicámelo con IA" lleva frente y dorso', async ({ page }) => {
  await espiarOpen(page);
  await page.goto(TARJETAS);
  await page.getByRole('button', { name: 'Empezar' }).click();
  const frente = await page.locator('.tj-frente').textContent();
  const dorso = (await page.locator('.tj-dorso p').first().textContent()).trim();
  await pedir(page, page.locator('.tj-card'), 'ChatGPT');
  const [u] = await abiertas(page);
  expect(u).toMatch(/^https:\/\/chatgpt\.com\/\?q=/);
  const p = decodeURIComponent(u.split('?q=')[1]);
  expect(p).toContain(frente);
  expect(p).toContain(dorso.slice(0, 40));
});
