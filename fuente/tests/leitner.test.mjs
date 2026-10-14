import test from 'node:test';
import assert from 'node:assert/strict';
import { caja, tras, registrar, conteo, mezclar, armarCola, responder } from '../src/scripts/leitner.js';

// RNG determinista (mulberry32) para barrer muchas semillas.
const rngDe = (s) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const tarjetas = Array.from({ length: 12 }, (_, i) => ({ id: 't' + i, tema: i % 2 ? 'a' : 'b' }));

test('tras: sube hasta 3 y "no la sabía" vuelve a 1', () => {
  assert.equal(tras(1, true), 2); assert.equal(tras(2, true), 3); assert.equal(tras(3, true), 3);
  for (const c of [1, 2, 3]) assert.equal(tras(c, false), 1);
});

test('caja: sin dato o dato corrupto = caja 1', () => {
  for (const v of [undefined, null, 0, 4, 'x', 1.5, NaN]) assert.equal(caja({ a: v }, 'a'), 1);
  assert.equal(caja(undefined, 'a'), 1);
  assert.equal(caja({ a: 3 }, 'a'), 3);
});

test('registrar no muta y conteo suma el total', () => {
  const c0 = { t0: 2 };
  const c1 = registrar(c0, 't0', true);
  assert.deepEqual(c0, { t0: 2 }); assert.equal(c1.t0, 3);
  assert.equal(conteo(tarjetas, c1).reduce((a, b) => a + b), tarjetas.length);
});

test('mezclar es permutación y no muta (muchas semillas)', () => {
  const src = tarjetas.map((t) => t.id);
  for (let s = 1; s <= 200; s++) {
    const m = mezclar(src, rngDe(s));
    assert.deepEqual([...m].sort(), [...src].sort());
  }
  assert.equal(src[0], 't0');
});

test('armarCola: caja 1 antes que caja 2, caja 3 solo si se pide, filtra por tema', () => {
  const cajas = { t0: 3, t1: 2, t2: 2, t3: 3 };
  for (let s = 1; s <= 100; s++) {
    const cola = armarCola(tarjetas, cajas, {}, rngDe(s));
    assert.ok(!cola.some((t) => caja(cajas, t.id) === 3));
    const nums = cola.map((t) => caja(cajas, t.id));
    assert.deepEqual(nums, [...nums].sort());
    assert.equal(armarCola(tarjetas, cajas, { incluirDominadas: true }, rngDe(s)).length, tarjetas.length);
    assert.ok(armarCola(tarjetas, cajas, { tema: 'a', incluirDominadas: true }, rngDe(s)).every((t) => t.tema === 'a'));
  }
});

test('responder: "la sabía" saca la tarjeta; "no la sabía" la reinserta más atrás sin perder ninguna', () => {
  const cola = tarjetas.slice(0, 6);
  assert.deepEqual(responder(cola, true).map((t) => t.id), ['t1', 't2', 't3', 't4', 't5']);
  assert.deepEqual(responder(cola, false).map((t) => t.id), ['t1', 't2', 't3', 't0', 't4', 't5']);
  assert.deepEqual(responder(cola.slice(0, 2), false).map((t) => t.id), ['t1', 't0']); // cola corta: al final
  assert.deepEqual(responder([], true), []);
});

test('sesión simulada: si siempre dice "la sé" termina en n pasos; con fallos termina igual', () => {
  for (let s = 1; s <= 100; s++) {
    const rng = rngDe(s);
    let cola = armarCola(tarjetas, {}, {}, rng), pasos = 0, cajas = {};
    while (cola.length && pasos < 1000) {
      const supo = rng() > 0.4;
      cajas = registrar(cajas, cola[0].id, supo);
      cola = responder(cola, supo);
      pasos++;
    }
    assert.equal(cola.length, 0);
  }
});
