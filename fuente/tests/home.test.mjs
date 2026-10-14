import test from 'node:test';
import assert from 'node:assert/strict';
import { cuentaRegresiva, progresoPorTema, planDias, iso } from '../src/scripts/home-calc.js';

const temas = Array.from({ length: 9 }, (_, i) => ({ id: 't' + i, titulo: 'Tema ' + i }));

test('cuentaRegresiva: descompone y marca el pasado', () => {
  const c = cuentaRegresiva(new Date(2026, 9, 14, 8, 0, 0), '2026-10-21T08:00:00');
  assert.deepEqual(c, { pasado: false, dias: 7, horas: 0, minutos: 0, segundos: 0 });
  const d = cuentaRegresiva(new Date(2026, 9, 20, 6, 30, 15), '2026-10-21T08:00:00');
  assert.deepEqual([d.dias, d.horas, d.minutos, d.segundos], [1, 1, 29, 45]);
  assert.equal(cuentaRegresiva(new Date(2026, 9, 21, 8, 0, 0), '2026-10-21T08:00:00').pasado, true);
  assert.equal(cuentaRegresiva(new Date(2027, 0, 1), '2026-10-21T08:00:00').pasado, true);
});

test('cuentaRegresiva con offset -03:00 no depende de la zona del navegador', () => {
  const c = cuentaRegresiva(new Date('2026-10-20T11:00:00Z'), '2026-10-21T08:00:00-03:00'); // 08:00 ART = 11:00Z
  assert.deepEqual([c.pasado, c.dias, c.horas], [false, 1, 0]);
  assert.equal(cuentaRegresiva(new Date('2026-10-21T11:00:01Z'), '2026-10-21T08:00:00-03:00').pasado, true);
  assert.equal(planDias(new Date(2026, 9, 20), '2026-10-21T08:00:00-03:00', temas).at(-1).fecha, '2026-10-21'); // el día sale del string
});

test('progresoPorTema: mezcla preguntas sabidas, tarjetas en caja 3 y choices acertados', () => {
  const items = {
    preguntas: [{ id: 'p1', tema: 't0' }, { id: 'p2', tema: 't0' }],
    tarjetas: [{ id: 'k1', tema: 't0' }, { id: 'k2', tema: 't1' }],
    choices: [{ id: 'c1', tema: 't0' }, { id: 'c2', tema: 't1' }],
  };
  const estado = { sabe: new Set(['p1']), cajas: { k1: 3, k2: 2 }, choices: { c1: 0, c2: 1 } };
  const r = progresoPorTema(temas.slice(0, 3), items, estado);
  assert.deepEqual(r.filas.map((f) => [f.total, f.hechos, f.pct]), [[4, 2, 50], [2, 1, 50], [0, 0, 0]]);
  assert.deepEqual([r.total, r.hechos, r.pct], [6, 3, 50]);
  const vacio = progresoPorTema(temas, items, {});
  assert.equal(vacio.hechos, 0);
  assert.equal(progresoPorTema([], {}, {}).pct, 0);
});

test('planDias: desde hoy 14/10 hasta el 21/10', () => {
  const p = planDias(new Date(2026, 9, 14, 23, 59), '2026-10-21T08:00:00', temas);
  assert.equal(p.length, 8);
  assert.equal(p[0].fecha, '2026-10-14'); assert.equal(p[7].fecha, '2026-10-21');
  assert.equal(p[6].tipo, 'simulacro'); assert.equal(p[7].tipo, 'parcial');
  assert.deepEqual(p.slice(0, 6).flatMap((d) => d.temas), temas.map((t) => t.id)); // todos los temas, en orden, una vez
});

test('planDias: cualquier cantidad de días cubre todos los temas una sola vez y termina en el parcial', () => {
  for (let hasta = 0; hasta <= 40; hasta++) {
    const hoy = new Date(2026, 8, 1 + 0);
    const parcial = new Date(2026, 8, 1 + hasta, 8);
    const p = planDias(hoy, parcial, temas);
    assert.equal(p.length, hasta + 1, `hasta=${hasta}`);
    assert.equal(p.at(-1).tipo, 'parcial');
    assert.equal(p.at(-1).fecha, iso(parcial));
    if (hasta >= 2) assert.deepEqual(p.flatMap((d) => d.temas), temas.map((t) => t.id), `hasta=${hasta}`);
    // fechas consecutivas, sin saltos (cruza cambios de mes)
    p.forEach((d, i) => assert.equal(d.fecha, iso(new Date(2026, 8, 1 + i))));
  }
});

test('planDias: el día del parcial y después', () => {
  const hoy = planDias(new Date(2026, 9, 21, 7), '2026-10-21T08:00:00', temas);
  assert.equal(hoy.length, 1); assert.match(hoy[0].titulo, /Hoy es el parcial/);
  assert.deepEqual(planDias(new Date(2026, 9, 22), '2026-10-21T08:00:00', temas), []);
});
