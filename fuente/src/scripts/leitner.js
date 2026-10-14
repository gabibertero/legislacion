// Lógica pura de las tarjetas (sin DOM, testeada en tests/leitner.test.mjs): 3 cajas tipo Leitner.
// cajas = { idTarjeta: 1|2|3 }; sin dato = caja 1. rng inyectable (devuelve [0,1)).
export const CAJAS = 3;
export const caja = (cajas, id) => (Number.isInteger(cajas?.[id]) && cajas[id] >= 1 && cajas[id] <= CAJAS ? cajas[id] : 1);
// "La sabía" sube una caja (tope 3); "No la sabía" vuelve a la 1.
export const tras = (actual, supo) => (supo ? Math.min(actual + 1, CAJAS) : 1);
export const registrar = (cajas, id, supo) => ({ ...cajas, [id]: tras(caja(cajas, id), supo) });
export const conteo = (tarjetas, cajas) => {
  const c = [0, 0, 0];
  tarjetas.forEach((t) => c[caja(cajas, t.id) - 1]++);
  return c;
};

export function mezclar(arr, rng = Math.random) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Cola de estudio: caja 1 primero (mezcladas), después caja 2; la 3 solo si incluirDominadas.
export function armarCola(tarjetas, cajas, { tema = '', incluirDominadas = false } = {}, rng = Math.random) {
  const base = tarjetas.filter((t) => !tema || t.tema === tema);
  return [1, 2, 3].filter((n) => n < 3 || incluirDominadas).flatMap((n) => mezclar(base.filter((t) => caja(cajas, t.id) === n), rng));
}

// La tarjeta de la cabeza de la cola: si no la sabía, vuelve `distancia` lugares más atrás (o al final si la cola es corta).
export function responder(cola, supo, distancia = 3) {
  const [t, ...resto] = cola;
  if (!t) return cola;
  if (supo) return resto;
  const i = Math.min(distancia, resto.length);
  return [...resto.slice(0, i), t, ...resto.slice(i)];
}
