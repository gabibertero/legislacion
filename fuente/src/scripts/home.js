// Inicio: cuenta regresiva, progreso por tema, plan día a día, "seguir donde dejaste". Sin localStorage el Inicio se ve igual.
import { leer } from './progreso.js';
import { cuentaRegresiva, progresoPorTema, planDias, iso } from './home-calc.js';

const $ = (s, r = document) => r.querySelector(s);
const base = import.meta.env.BASE_URL;
const { fecha, temas, items } = JSON.parse($('#home-datos').textContent);
const json = (k) => { try { const v = JSON.parse(leer(k)); return v && typeof v === 'object' ? v : {}; } catch { return {}; } };

// --- Cuenta regresiva ---
const cuenta = $('[data-cuenta]');
const pintarCuenta = () => {
  const c = cuentaRegresiva(new Date(), fecha);
  cuenta.textContent = c.pasado ? 'El parcial ya empezó o pasó' : `${c.dias} ${c.dias === 1 ? 'día' : 'días'} ${c.horas} h ${c.minutos} min`;
};
pintarCuenta();
setInterval(pintarCuenta, 30000);

// --- Progreso por tema ---
function pintarProgreso() {
  let sabe = new Set();
  try { sabe = new Set(items.preguntas.filter((p) => leer('preg:' + p.id) === 'sabe').map((p) => p.id)); } catch { /* sin storage */ }
  const r = progresoPorTema(temas, items, { sabe, cajas: json('tarjetas'), choices: json('choices') });
  r.filas.forEach((f) => {
    const li = [...document.querySelectorAll('[data-tema]')].find((x) => x.dataset.tema === f.id); // sin selector con el id: tolera comillas
    if (!li) return;
    $('[data-pct]', li).textContent = f.pct + '%';
    $('[data-tema-barra]', li).style.setProperty('--p', f.pct + '%');
  });
  $('[data-prog-global]').textContent = r.total ? `Total: ${r.hechos} de ${r.total} ítems dominados (${r.pct}%)` : 'Todavía no hay contenido cargado.';
}

// --- Plan sugerido (se recalcula si pasa la medianoche con la pestaña abierta) ---
const plan = $('[data-plan]');
function pintarPlan() {
  const hoy = new Date();
  const dias = planDias(hoy, fecha, temas);
  const hoyIso = iso(hoy);
  plan.replaceChildren(...dias.map((d) => {
    const [y, m, dd] = d.fecha.split('-').map(Number);
    const li = document.createElement('li');
    li.dataset.tipo = d.tipo;
    if (d.fecha === hoyIso) li.setAttribute('aria-current', 'date');
    const b = document.createElement('b');
    b.textContent = `${new Date(y, m - 1, dd).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'numeric' })}${d.fecha === hoyIso ? ' · hoy' : ''} · ${d.titulo}`;
    li.append(b);
    if (d.temasTxt.length) li.append(d.temasTxt.join(' · ') + '. Leé el resumen, hacé las tarjetas y choices de esos temas y respondé el Top 15 relacionado.');
    return li;
  }));
  plan.closest('[data-js]').hidden = !dias.length;
}

// --- Seguir donde dejaste (se oculta si se reinicia el progreso) ---
function pintarSeguir() {
  const p = $('[data-seguir]');
  p.hidden = true;
  try {
    const u = JSON.parse(leer('ultimo'));
    const url = new URL(u.href, location.origin);
    if (url.origin === location.origin && url.pathname.startsWith(base) && u.t) {
      const a = document.createElement('a');
      a.href = url.pathname;
      a.textContent = String(u.t).slice(0, 80);
      p.replaceChildren('Seguir donde dejaste: ', a);
      p.hidden = false;
    }
  } catch { /* nada guardado */ }
}

const repintar = () => { pintarProgreso(); pintarSeguir(); pintarPlan(); };
repintar();
addEventListener('pageshow', repintar); // volver con "atrás" (bfcache)
addEventListener('storage', repintar); // otra pestaña o reinicio
setInterval(pintarPlan, 60000);
