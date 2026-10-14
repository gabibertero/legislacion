import { test, expect } from '@playwright/test';
import { K, TEORIA, espiarOpen, abiertas, sinScrollH } from './util.mjs';

test('preguntero: filtros y contador', async ({ page }) => {
  await page.goto(TEORIA);
  const total = await page.locator('[data-pregunta]').count();
  expect(total).toBeGreaterThanOrEqual(15);
  await expect(page.locator('[data-contador]')).toContainText(`0 de ${total} sabidas`);
  await page.locator('[data-pregunta] [data-marca="repasar"]').first().click();
  await page.getByRole('button', { name: 'Para repasar' }).click();
  await expect(page.locator('[data-pregunta]:visible')).toHaveCount(1);
});

test('simulacro: arma 5 preguntas (una por grupo), cronómetro de 60 min activado por defecto', async ({ page }) => {
  await page.clock.install();
  await page.goto(TEORIA);
  await expect(page.locator('[data-crono]')).toBeChecked();
  await expect(page.locator('[data-minutos]')).toHaveValue('60');
  await page.getByRole('button', { name: 'Armar simulacro' }).click();
  const lista = page.locator('[data-sim-lista] .preg');
  await expect(lista).toHaveCount(5);
  const sims = await lista.evaluateAll((l) => l.map((a) => a.dataset.sim));
  expect(sims).toEqual(['A', 'B', 'C', 'D', 'E']);
  await expect(lista.first().locator('.preg-cab')).toContainText('Pregunta 1');
  const temas = await lista.evaluateAll((l) => l.map((a) => a.dataset.tema));
  expect(new Set(temas).size).toBeGreaterThanOrEqual(4); // sin temas repetidos salvo que no haya alternativa
  await expect(page.locator('[data-reloj]')).toBeVisible();
  await expect(page.locator('[data-reloj]')).toHaveText('60:00');
  await page.clock.runFor(61 * 1000);
  await expect(page.locator('[data-reloj]')).toHaveText('58:59');
  await page.clock.runFor(59 * 60 * 1000);
  await expect(page.locator('[data-reloj]')).toContainText('tiempo');
  await expect(page.locator('[data-sim-aviso]')).toHaveText(/terminó el tiempo/);
});

test('simulacro: escribir, corregir con IA en el clon y "Ver respuestas modelo"', async ({ page }) => {
  await espiarOpen(page);
  await page.goto(TEORIA);
  await page.getByRole('button', { name: 'Armar simulacro' }).click();
  const lista = page.locator('[data-sim-lista] .preg');
  await expect(lista.locator('details[data-resp][open]')).toHaveCount(0);
  const q = lista.nth(2);
  await q.getByLabel('Tu respuesta').fill('Mi respuesta de examen sobre el tema');
  await q.locator('.ia-menu > summary').click();
  await q.getByRole('button', { name: 'Claude' }).click();
  const [url] = await abiertas(page);
  expect(url).toMatch(/^https:\/\/claude\.ai\/new\?q=/);
  const prompt = decodeURIComponent(url.split('?q=')[1]);
  expect(prompt).toContain('Mi respuesta de examen sobre el tema');
  expect(prompt).toContain('Corregí mi respuesta');
  await page.getByRole('button', { name: 'Ver respuestas modelo' }).click();
  await expect(lista.locator('details[data-resp][open]')).toHaveCount(5);
  await expect(page.locator('[data-ver-resp]')).toBeDisabled();
});

test('simulacro: sin cronómetro no hay reloj; re-armar cambia y reinicia', async ({ page }) => {
  await page.goto(TEORIA);
  await page.locator('[data-crono]').uncheck();
  await page.getByRole('button', { name: 'Armar simulacro' }).click();
  await expect(page.locator('[data-reloj]')).toBeHidden();
  await page.locator('[data-crono]').check();
  await page.getByRole('button', { name: 'Armar simulacro' }).click();
  await expect(page.locator('[data-sim-lista] .preg')).toHaveCount(5);
  await expect(page.locator('[data-reloj]')).toBeVisible();
});

test.describe('390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('preguntero y simulacro sin scroll horizontal', async ({ page }) => {
    await page.goto(TEORIA);
    await page.getByRole('button', { name: 'Armar simulacro' }).click();
    await page.getByRole('button', { name: 'Ver respuestas modelo' }).click();
    expect(await sinScrollH(page)).toBe(true);
  });
});
