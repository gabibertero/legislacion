// Lógica pura de los choices (sin DOM, testeada en tests/choices.test.mjs).
// estado = { idChoice: 1 (última vez acertó) | 0 (última vez falló) }.
import { mezclar } from './leitner.js';

export const NIVELES = ['facil', 'media', 'dificil'];

// Correcta = marcó exactamente el conjunto de correctas (ni de más ni de menos).
export function esCorrecta(item, sel) {
  const a = new Set(item.correctas), b = new Set(sel);
  return a.size === b.size && [...a].every((i) => b.has(i));
}

export function filtrar(items, { niveles = NIVELES, temas = null, soloFalladas = false } = {}, estado = {}) {
  return items.filter((c) =>
    niveles.includes(c.nivel) && (!temas || temas.includes(c.tema)) && (!soloFalladas || estado[c.id] === 0));
}

// n al azar sin repetir (n <= 0 o mayor que el total = todas), en orden mezclado.
export const sortear = (items, n, rng = Math.random) => mezclar(items, rng).slice(0, n > 0 ? n : items.length);

export function puntaje(items, respuestas) {
  const aciertos = items.filter((c) => esCorrecta(c, respuestas[c.id] ?? [])).length;
  return { aciertos, total: items.length, pct: items.length ? Math.round((aciertos / items.length) * 100) : 0 };
}

export const registrar = (estado, id, ok) => ({ ...estado, [id]: ok ? 1 : 0 });
export const falladas = (estado) => Object.keys(estado).filter((id) => estado[id] === 0);
