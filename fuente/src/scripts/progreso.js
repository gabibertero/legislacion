// Script único del sitio: estado de ejercicios, pistas/pasos, progreso y reinicio.
// localStorage puede fallar (modo privado, bloqueado): todo va en try/catch y sigue andando en memoria.
import sitio from '../../sitio.config.mjs';
export const P = sitio.prefijo; // prefijo de localStorage, desde sitio.config.mjs
// Si localStorage falla, se guarda en memoria (dura mientras la página siga abierta) y se avisa una sola vez.
const mem = new Map();
let avisado = false;
function avisarSinStorage() {
  if (avisado) return;
  avisado = true;
  const p = Object.assign(document.createElement('p'), { className: 'capa generado', role: 'status', textContent: 'Tu progreso no se va a guardar en este navegador (el almacenamiento está bloqueado). Lo que hagas dura hasta que cierres la página.' });
  document.querySelector('main')?.prepend(p);
}
const leer = (k) => { try { return localStorage.getItem(P + k); } catch { avisarSinStorage(); return mem.has(k) ? mem.get(k) : null; } };
const guardar = (k, v) => { try { localStorage.setItem(P + k, v); } catch { avisarSinStorage(); mem.set(k, v); } };

export { leer, guardar };

// Última página de estudio visitada (Top 15, teoría, choices...; no el Inicio ni /u1/) para "Seguir donde dejaste".
{
  const base = import.meta.env.BASE_URL;
  const rel = location.pathname.startsWith(base) ? location.pathname.slice(base.length) : '';
  const [seg] = rel.split('/');
  if (/^[^/]+\/[^/]+/.test(rel) && sitio.instancias.some((i) => (i.ruta ?? i.id) === seg)) guardar('ultimo', JSON.stringify({ href: location.pathname, t: document.querySelector('h1')?.textContent?.trim() || document.title, at: Date.now() }));
}

function iniciarEjercicio(ej) {
  const id = ej.dataset.id;
  const pistas = [...ej.querySelectorAll('[data-pista]')];
  const pasos = [...ej.querySelectorAll('[data-paso]')];
  const soluciones = [...ej.querySelectorAll('[data-solucion]')];
  const botones = {};
  ej.querySelectorAll('[data-accion]').forEach((b) => (botones[b.dataset.accion] = b));

  let vista = { p: 0, s: 0, full: false };
  try {
    const v = JSON.parse(leer('vista:' + id));
    const entero = (n, max) => (Number.isInteger(n) && n >= 0 ? Math.min(n, max) : 0);
    vista = { p: entero(v.p, pistas.length), s: entero(v.s, pasos.length), full: v.full === true };
  } catch { /* vacío o corrupto: se ignora */ }

  function pintar() {
    pistas.forEach((e, i) => (e.hidden = !(vista.full || i < vista.p)));
    pasos.forEach((e, i) => (e.hidden = !(vista.full || i < vista.s)));
    soluciones.forEach((e) => (e.hidden = !vista.full));
    botones.pista.disabled = vista.full || vista.p >= pistas.length;
    botones.paso.disabled = vista.full || vista.s >= pasos.length;
    botones.solucion.disabled = vista.full;
    botones.pista.setAttribute('aria-expanded', vista.full || vista.p > 0);
    botones.paso.setAttribute('aria-expanded', vista.full || vista.s > 0);
    botones.solucion.setAttribute('aria-expanded', vista.full);
    guardar('vista:' + id, JSON.stringify(vista));
  }
  // El botón puede quedar deshabilitado: el foco pasa a la capa recién revelada.
  const enfocar = (capa) => { if (capa) { capa.tabIndex = -1; capa.focus(); } };
  botones.pista.onclick = () => { vista.p++; pintar(); enfocar(pistas[vista.p - 1]); };
  botones.paso.onclick = () => { vista.s++; pintar(); enfocar(pasos[vista.s - 1]); };
  botones.solucion.onclick = () => { vista.full = true; pintar(); enfocar(soluciones[0] || pasos[0] || pistas[0]); botones.ocultar.focus(); };
  botones.ocultar.onclick = () => { vista = { p: 0, s: 0, full: false }; pintar(); };

  const radios = ej.querySelectorAll('input[type=radio]');
  const guardado = leer('estado:' + id);
  const estado = ['pendiente', 'en-curso', 'resuelto'].includes(guardado) ? guardado : 'pendiente';
  radios.forEach((r) => {
    r.checked = r.value === estado;
    r.onchange = () => guardar('estado:' + id, r.value);
  });
  pintar();
}
document.querySelectorAll('[data-ejercicio]').forEach(iniciarEjercicio);

// Progreso X/Y por examen (lista de ids en data-ids).
function pintarProgreso() {
  document.querySelectorAll('[data-progreso]').forEach((el) => {
    const ids = el.dataset.ids.split(',').filter(Boolean);
    const hechos = ids.filter((id) => leer('estado:' + id) === 'resuelto').length;
    el.textContent = `${hechos}/${ids.length} resueltos`;
  });
}
pintarProgreso();
addEventListener('pageshow', pintarProgreso); // volver con "atrás" (bfcache)
addEventListener('storage', pintarProgreso); // otra pestaña

// Reiniciar progreso: confirmación en la página, borra solo claves con el prefijo del sitio
const pedir = document.querySelector('[data-reiniciar]');
if (pedir) {
  pedir.hidden = false; // sin JS no sirve
  const panel = document.querySelector('[data-confirmar]');
  const msg = document.querySelector('[data-resultado]');
  pedir.onclick = () => { panel.hidden = false; panel.querySelector('[data-si]').focus(); };
  panel.querySelector('[data-no]').onclick = () => { panel.hidden = true; pedir.focus(); };
  panel.querySelector('[data-si]').onclick = () => {
    try {
      Object.keys(localStorage).filter((k) => k.startsWith(P) && k !== P + 'tema').forEach((k) => localStorage.removeItem(k));
      msg.textContent = 'Progreso borrado.';
    } catch {
      msg.textContent = 'No se pudo acceder al almacenamiento del navegador.';
    }
    panel.hidden = true;
    dispatchEvent(new Event('storage')); // mismas pestaña: repinta Inicio, preguntero, etc.
    msg.focus();
  };
}
