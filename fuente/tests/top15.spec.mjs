import { test, expect } from '@playwright/test';
import { K, TOP, sinScrollH } from './util.mjs';

test('Top 15: 15 preguntas en orden, respuesta oculta, Tu respuesta y un solo botón de IA', async ({ page }) => {
  await page.goto(TOP);
  const arts = page.locator('[data-pregunta]');
  await expect(arts).toHaveCount(15);
  const ns = await arts.evaluateAll((l) => l.map((a) => Number(a.dataset.n)));
  expect(ns).toEqual(Array.from({ length: 15 }, (_, i) => i + 1));
  await expect(arts.first().locator('.chip', { hasText: /^Top 1$/ })).toBeVisible();
  const primera = arts.first();
  await expect(primera.locator('details[data-resp]')).not.toHaveAttribute('open', '');
  await expect(primera.locator('.resp')).toBeHidden();
  await primera.getByText('Mostrar respuesta').click();
  await expect(primera.locator('.resp')).toBeVisible();
  await expect(primera.getByLabel('Tu respuesta')).toBeVisible();
  await expect(primera.locator('.ia-menu > summary')).toHaveCount(1);
  await expect(primera.locator('.ia-menu > summary')).toContainText('Corregir con IA');
  await expect(page.locator('[data-pregunta]:not(.preg-top)')).toHaveCount(0); // ninguna "extra" se cuela
});

test('Top 15: marcas La sé / Repasar, barra de progreso y persistencia', async ({ page }) => {
  await page.goto(TOP);
  const txt = page.locator('[data-prog-txt]');
  await expect(txt).toHaveText('Sabés 0 de 15');
  const art = page.locator('[data-pregunta]').nth(1);
  const sabe = art.locator('[data-marca="sabe"]');
  await sabe.click();
  await expect(sabe).toHaveAttribute('aria-pressed', 'true');
  await expect(txt).toHaveText('Sabés 1 de 15');
  await expect(page.locator('[data-prog-barra]')).toHaveCSS('--p', /^6\.666/);
  const id = await art.getAttribute('data-id');
  expect(await page.evaluate((k) => localStorage.getItem(k), K('preg:' + id))).toBe('sabe');
  await art.locator('[data-marca="repasar"]').click(); // cambiar de marca saca de "sabidas"
  await expect(txt).toHaveText('Sabés 0 de 15');
  await art.locator('[data-marca="repasar"]').click(); // volver a tocar = desmarcar
  await expect(art.locator('[data-marca="repasar"]')).toHaveAttribute('aria-pressed', 'false');
  await sabe.click();
  await page.reload();
  await expect(page.locator('[data-prog-txt]')).toHaveText('Sabés 1 de 15');
  await expect(page.locator('[data-pregunta]').nth(1).locator('[data-marca="sabe"]')).toHaveAttribute('aria-pressed', 'true');
});

test('Top 15: el borrador de "Tu respuesta" se guarda por pregunta', async ({ page }) => {
  await page.goto(TOP);
  const ta = page.locator('[data-pregunta]').first().getByLabel('Tu respuesta');
  await ta.fill('mi borrador');
  await page.reload();
  await expect(page.locator('[data-pregunta]').first().getByLabel('Tu respuesta')).toHaveValue('mi borrador');
});

test.describe('390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('Top 15 sin scroll horizontal, con todas las respuestas abiertas', async ({ page }) => {
    await page.goto(TOP);
    await page.locator('details[data-resp]').evaluateAll((d) => d.forEach((x) => (x.open = true)));
    expect(await sinScrollH(page)).toBe(true);
  });
});
