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

export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sumar = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// Plan día a día desde `hoy` hasta el día del parcial (inclusive). Días de calendario, sin horas.
// Los temas se reparten en orden en todos los días menos los dos últimos (simulacro y día del parcial).
export function planDias(hoy, parcial, temas) {
  const h = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  // Con string ISO el día sale de su parte de fecha (no cambia según la zona del navegador).
  const [py, pm, pd] = typeof parcial === 'string' ? parcial.slice(0, 10).split('-').map(Number) : [parcial.getFullYear(), parcial.getMonth() + 1, parcial.getDate()];
  const p = new Date(py, pm - 1, pd);
  const hasta = Math.round((p - h) / 864e5); // días hasta el parcial
  if (hasta < 0) return [];
  const dia = (n, tipo, titulo, temasDia = []) => ({ fecha: iso(sumar(h, n)), tipo, titulo, temas: temasDia.map((t) => t.id), temasTxt: temasDia.map((t) => t.titulo) });
  const out = [];
  const estudio = Math.max(hasta - 1, 0); // el día anterior es el simulacro; el último es el parcial
  for (let j = 0; j < estudio; j++) {
    const ts = temas.slice(Math.floor((j * temas.length) / estudio), Math.floor(((j + 1) * temas.length) / estudio));
    out.push(ts.length ? dia(j, 'estudio', 'Estudiar', ts) : dia(j, 'repaso', 'Repasar el Top 15 y las tarjetas de la caja 1'));
  }
  if (hasta >= 1) out.push(dia(hasta - 1, 'simulacro', 'Simulacro completo (60 min) y repaso del machete'));
  out.push(dia(hasta, 'parcial', hasta === 0 ? 'Hoy es el parcial: repasá el machete y a rendir' : 'Parcial'));
  return out;
}
