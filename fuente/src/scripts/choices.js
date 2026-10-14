// Choices: configuración, práctica (corrección inmediata o al final), puntaje y falladas (clave `choices` vía progreso.js).
import { leer, guardar } from './progreso.js';
import { esCorrecta, filtrar, sortear, puntaje, registrar, falladas } from './choices-logica.js';

const $ = (s, r = document) => r.querySelector(s);
const el = (tag, props = {}, ...hijos) => { const e = Object.assign(document.createElement(tag), props); e.append(...hijos); return e; };
const cfg = $('[data-config]'), juego = $('[data-juego]');
const { items, temas } = JSON.parse($('#ch-datos').textContent);
const NIV = { facil: 'Fácil', media: 'Media', dificil: 'Difícil' };
const tituloTema = Object.fromEntries(temas.map((t) => [t.id, t.titulo]));

const cargar = () => { try { const e = JSON.parse(leer('choices')); return e && typeof e === 'object' ? e : {}; } catch { return {}; } };
let estado = cargar();
const aviso = $('[data-aviso]', cfg);

let pintarN = () => {};
if (items.length && cfg) {
  $('[data-estatico]').remove(); // el listado sin JS sobra cuando hay práctica
  cfg.hidden = false;
  pintarN = () => { $('[data-n-falladas]', cfg).textContent = falladas(estado).filter((id) => items.some((c) => c.id === id)).length; };
  pintarN();

  cfg.onsubmit = (e) => {
    e.preventDefault();
    const f = new FormData(cfg);
    const opts = { niveles: f.getAll('nivel'), temas: f.getAll('tema'), soloFalladas: f.has('falladas') };
    const pool = filtrar(items, opts, estado);
    if (!pool.length) { aviso.textContent = opts.soloFalladas ? 'No tenés choices fallados con esos filtros.' : 'No hay choices con esos filtros: elegí algún nivel y tema.'; return; }
    aviso.textContent = '';
    empezar(sortear(pool, Number(f.get('cantidad'))), f.get('modo'));
  };

  function empezar(lista, modo) {
    cfg.hidden = true;
    juego.hidden = false;
    const resp = {}; // id -> índices marcados
    let i = 0;

    // Tarjeta de una pregunta. corregida = muestra el resultado y bloquea las opciones.
    function tarjeta(c, sel, corregida, n) {
      const multi = c.correctas.length > 1;
      const art = el('article', { className: 'tarjeta ch-card' });
      art.dataset.iaCtx = '';
      art.append(el('p', {}, el('span', { className: 'chip', textContent: tituloTema[c.tema] ?? c.tema }), el('span', { className: 'chip', textContent: NIV[c.nivel] ?? c.nivel })));
      const fs = el('fieldset', { className: 'ch-q' });
      fs.dataset.iaEnun = '';
      fs.append(el('legend', { textContent: `${n}. ${c.pregunta}` }));
      if (multi) fs.append(el('p', { className: 'suave', textContent: `Hay ${c.correctas.length} correctas: marcalas todas.` }));
      c.opciones.forEach((o, k) => {
        const inp = el('input', { type: multi ? 'checkbox' : 'radio', name: 'op-' + c.id, value: String(k), checked: sel.includes(k), disabled: corregida });
        const lab = el('label', { className: 'ch-opcion' }, inp, el('span', { textContent: o }));
        if (corregida) lab.dataset.res = c.correctas.includes(k) ? 'ok' : sel.includes(k) ? 'mal' : '';
        if (corregida && c.correctas.includes(k)) lab.append(el('span', { className: 'sr-only', textContent: ' (correcta)' }));
        fs.append(lab);
      });
      art.append(fs);
      const tit = el('span', { hidden: true, textContent: tituloTema[c.tema] ?? c.tema }); tit.dataset.iaTit = '';
      const mod = el('span', { hidden: true, textContent: `Correcta${multi ? 's' : ''}: ${c.correctas.map((k) => c.opciones[k]).join(' | ')}. ${c.explicacion}` }); mod.dataset.iaModelo = '';
      art.append(tit, mod);
      if (corregida) {
        const ok = esCorrecta(c, sel);
        const fb = el('div', { className: 'ch-fb' });
        fb.dataset.ok = String(ok);
        fb.append(el('p', {}, el('strong', { textContent: ok ? 'Correcto.' : 'Incorrecto.' }), ` ${c.explicacion}`));
        if (c.fuente) fb.append(el('p', { className: 'suave', textContent: `Fuente: ${c.fuente}` }));
        art.append(fb);
      }
      const ia = $('[data-tpl-ia]').content.cloneNode(true);
      ia.querySelectorAll('[data-ia-js]').forEach((x) => (x.hidden = false));
      art.append(ia);
      return art;
    }
    const marcados = (art) => [...art.querySelectorAll('input:checked')].map((x) => Number(x.value));
    const anotar = (c) => { estado = registrar(estado, c.id, esCorrecta(c, resp[c.id] ?? [])); guardar('choices', JSON.stringify(estado)); };

    function pregunta() {
      const c = lista[i];
      const art = tarjeta(c, resp[c.id] ?? [], false, i + 1);
      const barra = el('p', { className: 'ch-prog', textContent: `Pregunta ${i + 1} de ${lista.length}` });
      const ctl = el('div', { className: 'ch-ctl' });
      const sig = () => { i++; i < lista.length ? pregunta() : fin(); };
      const btn = el('button', { type: 'button', className: 'btn-primario', textContent: modo === 'inmediata' ? 'Corregir' : i === lista.length - 1 ? 'Terminar' : 'Siguiente' });
      const avisoSel = el('p', { className: 'ch-aviso', role: 'status' });
      btn.onclick = () => {
        resp[c.id] = marcados(art);
        if (modo === 'inmediata' && !resp[c.id].length) { avisoSel.textContent = 'Marcá al menos una opción antes de corregir.'; return; }
        if (modo === 'final') { sig(); return; }
        anotar(c);
        const nueva = tarjeta(c, resp[c.id], true, i + 1);
        const sg = el('button', { type: 'button', className: 'btn-primario', textContent: i === lista.length - 1 ? 'Ver puntaje' : 'Siguiente' });
        sg.onclick = sig;
        nueva.append(sg);
        art.replaceWith(nueva);
        const fb = nueva.querySelector('.ch-fb');
        fb.tabIndex = -1;
        fb.focus(); // se anuncia el resultado

      };
      ctl.append(btn);
      art.append(avisoSel, ctl);
      juego.replaceChildren(barra, art);
      const fs = art.querySelector('fieldset');
      fs.tabIndex = -1;
      fs.focus(); // anuncia la pregunta una sola vez
    }

    function fin() {
      if (modo === 'final') lista.forEach(anotar);
      const p = puntaje(lista, resp);
      const resumen = el('div', { className: 'ch-puntaje', tabIndex: -1 });
      resumen.append(el('h2', { textContent: `Puntaje: ${p.aciertos} de ${p.total} (${p.pct}%)` }));
      const otra = el('button', { type: 'button', className: 'btn-primario', textContent: 'Armar otra práctica' });
      otra.onclick = () => { juego.hidden = true; cfg.hidden = false; pintarN(); cfg.querySelector('button[type=submit]').focus(); };
      resumen.append(otra);
      juego.replaceChildren(resumen, ...lista.map((c, k) => tarjeta(c, resp[c.id] ?? [], true, k + 1)));
      resumen.focus();
    }
    pregunta();
  }
  addEventListener('storage', () => { estado = cargar(); pintarN(); });
}
