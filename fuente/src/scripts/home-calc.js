// Cálculos puros del Inicio (sin DOM, testeados en tests/home.test.mjs).

// Tiempo que falta hasta `objetivo` (Date o string ISO con offset, ej. 2026-10-21T08:00:00-03:00). pasado = ya empezó.
export function cuentaRegresiva(ahora, objetivo) {
  const ms = new Date(objetivo) - ahora;
  if (!(ms > 0)) return { pasado: true, dias: 0, horas: 0, minutos: 0, segundos: 0 };
  const s = Math.floor(ms / 1000);
  return { pasado: false, dias: Math.floor(s / 86400), horas: Math.floor(s / 3600) % 24, minutos: Math.floor(s / 60) % 60, segundos: s % 60 };
}

// items = { preguntas:[{id,tema}], tarjetas:[...], choices:[...] }; estado = { sabe:Set<id>, cajas:{id:1-3}, choices:{id:0|1} }.
// Cada ítem "hecho" cuenta 1: pregunta marcada "La sé", tarjeta en caja 3, choice acertada la última vez.
export function progresoPorTema(temas, items, estado) {
  const hecho = {
    preguntas: (x) => estado.sabe?.has(x.id),
    tarjetas: (x) => estado.cajas?.[x.id] === 3,
    choices: (x) => estado.choices?.[x.id] === 1,
  };
  const filas = temas.map((t) => {
    let total = 0, hechos = 0;
    for (const k of Object.keys(hecho)) for (const x of (items[k] ?? []).filter((y) => y.tema === t.id)) { total++; if (hecho[k](x)) hechos++; }
    return { id: t.id, titulo: t.titulo, total, hechos, pct: total ? Math.round((hechos / total) * 100) : 0 };
  });
  const total = filas.reduce((s, f) => s + f.total, 0), hechos = filas.reduce((s, f) => s + f.hechos, 0);
  return { filas, total, hechos, pct: total ? Math.round((hechos / total) * 100) : 0 };
}


