import test from 'node:test';
import assert from 'node:assert/strict';
import { elegirSinRepetir } from '../src/scripts/sorteo.js';

const rngDe = (s) => () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
// Como los datos reales: A y E comparten "capacidad"; D y C mezclan temas.
const g = (...t) => t.map((tema, k) => ({ tema, k }));
const grupos = [g('capacidad'), g('personas', 'existencia'), g('atributos', 'nombre'), g('domicilio', 'estado'), g('capacidad', 'capacidad', 'fin')];

test('sin repetir tema cuando hay alternativa (muchas semillas)', () => {
  for (let s = 1; s <= 2000; s++) {
    const r = elegirSinRepetir(grupos, rngDe(s));
    assert.equal(r.length, 5);
    r.forEach((x, i) => assert.ok(grupos[i].includes(x)));
    assert.equal(new Set(r.map((x) => x.tema)).size, 5, `semilla ${s}`);
  }
});

test('sin alternativa repite, y no rompe con grupos vacíos', () => {
  const r = elegirSinRepetir([g('a'), g('a')], rngDe(1));
  assert.deepEqual(r.map((x) => x.tema), ['a', 'a']);
  assert.equal(elegirSinRepetir([[], g('a')], rngDe(1))[1].tema, 'a');
});

test('todas las preguntas de un grupo salen alguna vez', () => {
  const vistos = new Set();
  for (let s = 1; s <= 300; s++) vistos.add(elegirSinRepetir(grupos, rngDe(s))[2].tema);
  assert.deepEqual([...vistos].sort(), ['atributos', 'nombre']);
});
