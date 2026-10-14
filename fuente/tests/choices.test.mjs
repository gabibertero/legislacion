import test from 'node:test';
import assert from 'node:assert/strict';
import { esCorrecta, filtrar, sortear, puntaje, registrar, falladas } from '../src/scripts/choices-logica.js';

const rngDe = (s) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const niv = ['facil', 'media', 'dificil'];
const items = Array.from({ length: 30 }, (_, i) => ({ id: 'c' + i, tema: 't' + (i % 3), nivel: niv[i % 3 === 0 ? 0 : i % 2 ? 1 : 2], opciones: ['a', 'b', 'c', 'd'], correctas: i % 4 === 0 ? [0, 2] : [1] }));

test('esCorrecta exige el conjunto exacto de correctas', () => {
  const multi = { correctas: [0, 2] }, una = { correctas: [1] };
  assert.ok(esCorrecta(multi, [2, 0])); assert.ok(esCorrecta(una, [1]));
  assert.ok(!esCorrecta(multi, [0])); assert.ok(!esCorrecta(multi, [0, 1, 2])); assert.ok(!esCorrecta(una, [])); assert.ok(!esCorrecta(una, [0, 1]));
  assert.ok(!esCorrecta(una, [1, 1, 2]));
});

test('filtrar por nivel, tema y falladas', () => {
  assert.equal(filtrar(items).length, 30);
  assert.ok(filtrar(items, { niveles: ['facil'] }).every((c) => c.nivel === 'facil'));
  assert.ok(filtrar(items, { temas: ['t1'] }).every((c) => c.tema === 't1'));
  assert.equal(filtrar(items, { niveles: [] }).length, 0);
  assert.deepEqual(filtrar(items, { soloFalladas: true }, { c1: 0, c2: 1, c3: 0 }).map((c) => c.id), ['c1', 'c3']);
});

test('sortear: n distintas, de la lista, sin repetir (muchas semillas)', () => {
  for (let s = 1; s <= 300; s++) {
    const n = 1 + (s % 30);
    const r = sortear(items, n, rngDe(s));
    assert.equal(r.length, n);
    assert.equal(new Set(r.map((c) => c.id)).size, n);
    assert.ok(r.every((c) => items.includes(c)));
  }
  assert.equal(sortear(items, 0).length, 30);
  assert.equal(sortear(items, 99).length, 30);
});

test('sortear cubre todos los ítems con el tiempo (sin sesgo grosero)', () => {
  const veces = {};
  for (let s = 1; s <= 600; s++) for (const c of sortear(items, 5, rngDe(s))) veces[c.id] = (veces[c.id] || 0) + 1;
  assert.equal(Object.keys(veces).length, 30);
  assert.ok(Math.min(...Object.values(veces)) > 40); // esperado ~100
});

test('puntaje y registro de falladas', () => {
  const lista = items.slice(0, 4); // c0 multi [0,2], c1,c2,c3 [1]
  const resp = { c0: [0, 2], c1: [1], c2: [0], c3: [] };
  assert.deepEqual(puntaje(lista, resp), { aciertos: 2, total: 4, pct: 50 });
  assert.deepEqual(puntaje([], {}), { aciertos: 0, total: 0, pct: 0 });
  let e = {};
  for (const c of lista) e = registrar(e, c.id, puntaje([c], resp).aciertos === 1);
  assert.deepEqual(falladas(e).sort(), ['c2', 'c3']);
  assert.deepEqual(falladas(registrar(e, 'c2', true)), ['c3']); // acertarla la saca de las falladas
});
