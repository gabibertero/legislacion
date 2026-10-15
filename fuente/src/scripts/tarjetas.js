// Tarjetas con 3 cajas tipo Leitner (clave `tarjetas` vía progreso.js: { id: caja }). Atajos: Espacio = dar vuelta, 1 = no la sabía, 2 = la sabía.
import { leer, guardar } from './progreso.js';
import { armarCola, responder, registrar, conteo } from './leitner.js';

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, props = {}, ...hijos) => { const e = Object.assign(document.createElement(tag), props); e.append(...hijos); return e; };
const cfg = $('[data-config]'), juego = $('[data-juego]');
const { items, temas } = JSON.parse($('#tj-datos').textContent);
const tituloTema = Object.fromEntries(temas.map((t) => [t.id, t.titulo]));

const cargar = () => { try { const e = JSON.parse(leer('tarjetas')); return e && typeof e === 'object' ? e : {}; } catch { return {}; } };
let cajas = cargar();

if (items.length && cfg) {
  $('[data-estatico]').remove(); // el listado sin JS sobra cuando hay sesión
  cfg.hidden = false;
  const pintarCajas = () => { const [a, b, c] = conteo(items, cajas); $('[data-cajas]', cfg).textContent = `Caja 1: ${a} · Caja 2: ${b} · Caja 3: ${c}`; };
  pintarCajas();
  let paso = null; // acciones de la tarjeta en pantalla para los atajos

  cfg.onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(cfg);
    const cola = armarCola(items, cajas, { tema: f.get('tema'), incluirDominadas: f.has('dominadas') });
    if (!cola.length) { $('[data-aviso]').textContent = 'No hay tarjetas pendientes con esos filtros: probá "Incluir las ya dominadas" u otro tema.'; return; }
    $('[data-aviso]').textContent = '';
    sesion(cola);
  };

  function sesion(cola) {
    cfg.hidden = true;
    juego.hidden = false;
    const total = cola.length;
    let vistas = 0;

    function mostrar() {
      paso = null;
      if (!cola.length) { fin(); return; }
      $('[data-vivo]').textContent = `Quedan ${cola.length} tarjetas.`;
      const t = cola[0];
      const art = el('article', { className: 'tarjeta tj-card' });
      art.dataset.iaCtx = '';
      const prog = el('p', { className: 'tj-prog', textContent: `Quedan ${cola.length} · respondidas ${vistas} (de ${total} al empezar)` });
      const frente = el('h2', { className: 'tj-frente', textContent: t.frente }); frente.dataset.iaEnun = '';
      const tema = el('span', { className: 'chip', textContent: tituloTema[t.tema] ?? t.tema }); tema.dataset.iaTit = '';
      const dorso = el('div', { className: 'tj-dorso', hidden: true, id: 'tj-dorso' }, el('p', { textContent: t.dorso }));
      dorso.dataset.iaModelo = '';
      if (t.fuente) dorso.append(el('p', { className: 'suave', textContent: `Fuente: ${t.fuente}` }));
      const girar = el('button', { type: 'button', className: 'btn-primario', textContent: 'Dar vuelta (Espacio)' });
      girar.setAttribute('aria-expanded', 'false'); girar.setAttribute('aria-controls', 'tj-dorso');
      const no = el('button', { type: 'button', textContent: 'No la sabía (1)', hidden: true });
      const si = el('button', { type: 'button', className: 'btn-primario', textContent: 'La sabía (2)', hidden: true });
      const dar = () => { if (!dorso.hidden) return; dorso.hidden = false; no.hidden = si.hidden = false; girar.hidden = true; dorso.tabIndex = -1; dorso.focus(); }; // el foco no va a un botón: Espacio no debe responder
      const resp = (supo) => {
        if (dorso.hidden) return;
        cajas = registrar(cajas, t.id, supo);
        guardar('tarjetas', JSON.stringify(cajas));
        cola = responder(cola, supo);
        vistas++;
        mostrar();
      };
      girar.onclick = dar; no.onclick = () => resp(false); si.onclick = () => resp(true);
      paso = { dar, resp, foco: () => (dorso.hidden ? girar : dorso).focus() };
      const ia = $('[data-tpl-ia]').content.cloneNode(true);
      ia.querySelectorAll('[data-ia-js]').forEach((x) => (x.hidden = false));
      art.append(tema, frente, dorso, el('div', { className: 'tj-ctl' }, girar, no, si), ia);
      juego.replaceChildren(prog, art);
      girar.focus();
    }

    function fin() {
      const [a, b, c] = conteo(items, cajas);
      pintarCajas();
      const h = el('h2', { tabIndex: -1, textContent: 'Sesión terminada' });
      const otra = el('button', { type: 'button', className: 'btn-primario', textContent: 'Armar otra sesión' });
      otra.onclick = () => { juego.hidden = true; cfg.hidden = false; cfg.querySelector('button[type=submit]').focus(); };
      juego.replaceChildren(h, el('p', { role: 'status', textContent: `Caja 1: ${a} · Caja 2: ${b} · Caja 3: ${c}` }), otra);
      h.focus();
    }
    mostrar();
  }

  // Al cerrar el menú de IA (elegir o Escape) el foco vuelve a la tarjeta y los atajos siguen andando.
  document.addEventListener('toggle', (e) => { if (paso && e.target.matches?.('details.ia-menu') && !e.target.open) paso.foco(); }, true);
  document.addEventListener('keydown', (e) => {
    if (!paso || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest?.('input, select, textarea, [contenteditable]') || document.querySelector('details.ia-menu[open]')) return;
    if (e.key === ' ' && !e.target.closest?.('button, summary')) { e.preventDefault(); paso.dar(); }
    else if (e.key === '1') paso.resp(false);
    else if (e.key === '2') paso.resp(true);
  });
  addEventListener('storage', () => { cajas = cargar(); pintarCajas(); });
}
