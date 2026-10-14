// Preguntero teórico: filtros, marcas "la sé / repasar" (preg:<id>, con el prefijo del sitio) y simulacro con cronómetro.
import { leer, guardar } from './progreso.js';
import { elegirSinRepetir } from './sorteo.js';

const preguntas = [...document.querySelectorAll('[data-pregunta]')];
const MARCAS = ['sabe', 'repasar'];
const ETIQ = { sabe: '✓ La sé', repasar: '↻ Para repasar' };
let filtro = 'todas';
document.querySelectorAll('[data-js]').forEach((e) => (e.hidden = false)); // sin JS quedan ocultos

function pintarMarca(art) {
  const m = leer('preg:' + art.dataset.id);
  const marca = MARCAS.includes(m) ? m : '';
  if (marca) art.dataset.estado = marca; else delete art.dataset.estado;
  art.querySelectorAll('[data-marca]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.marca === marca)));
  art.querySelector('[data-estado-txt]').textContent = ETIQ[marca] || '';
}

function aplicarFiltro(moverFoco = true) {
  let visibles = 0;
  preguntas.forEach((art) => {
    const ok = filtro === 'todas' || (filtro === 'repasar' ? art.dataset.estado === 'repasar' : art.dataset.unidad === filtro);
    art.hidden = !ok;
    if (ok) visibles++;
  });
  document.querySelectorAll('[data-seccion]').forEach((s) => (s.hidden = !s.querySelector('[data-pregunta]:not([hidden])')));
  const vacio = document.querySelector('[data-vacio]');
  if (vacio) vacio.hidden = visibles > 0;
  document.querySelectorAll('[data-filtro]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filtro === filtro)));
  const sabe = preguntas.filter((a) => a.dataset.estado === 'sabe').length;
  const rep = preguntas.filter((a) => a.dataset.estado === 'repasar').length;
  const cont = document.querySelector('[data-contador]');
  if (cont) {
    cont.textContent = `${sabe} de ${preguntas.length} sabidas · ${rep} para repasar · mostrando ${visibles}`;
    const f = document.activeElement; // si la tarjeta con el foco quedó oculta, no perder el foco (nunca al cargar: pisaría el ancla #simulacro)
    if (moverFoco && f && f !== document.body && f.closest('[hidden]')) { cont.tabIndex = -1; cont.focus(); }
  }
  // Barra de progreso (Top 15): cuántas sabés de las que hay en la página.
  const barra = document.querySelector('[data-prog-barra]');
  if (barra) {
    barra.style.setProperty('--p', (preguntas.length ? (sabe / preguntas.length) * 100 : 0) + '%');
    document.querySelector('[data-prog-txt]').textContent = `Sabés ${sabe} de ${preguntas.length}`;
  }
}

// Top 15: el DOM sigue el orden Top 1..N (el foco con Tab también).
const top = preguntas.filter((a) => a.dataset.n);
if (top.length) top.sort((a, b) => a.dataset.n - b.dataset.n).forEach((a) => a.parentElement.append(a));

preguntas.forEach((art) => {
  pintarMarca(art);
  art.querySelectorAll('[data-marca]').forEach((b) => {
    b.onclick = () => {
      const actual = leer('preg:' + art.dataset.id);
      guardar('preg:' + art.dataset.id, actual === b.dataset.marca ? '' : b.dataset.marca); // volver a tocar = desmarcar
      pintarMarca(art);
      aplicarFiltro();
    };
  });
});
document.querySelectorAll('[data-filtro]').forEach((b) => (b.onclick = () => { filtro = b.dataset.filtro; aplicarFiltro(); }));
addEventListener('storage', () => { preguntas.forEach(pintarMarca); aplicarFiltro(); });
aplicarFiltro(false);

// ---- Simulacro: una pregunta al azar por cada clave `sim` distinta (A, B, C...), como en el examen teórico ----
const claves = [...new Set(preguntas.map((a) => a.dataset.sim).filter(Boolean))].sort();
const verResp = document.querySelector('[data-ver-resp]');
const lista = document.querySelector('[data-sim-lista]');
const reloj = document.querySelector('[data-reloj]');
const aviso = document.querySelector('[data-sim-aviso]');
let timer = null;
// Una por clave, sin repetir tema cuando hay alternativa (elegirSinRepetir).
const sorteo = () => {
  const grupos = claves.map((k) => preguntas.filter((a) => a.dataset.sim === k).map((a) => ({ tema: a.dataset.tema, art: a })));
  return elegirSinRepetir(grupos).map((x) => x?.art);
};

function parar() { clearInterval(timer); timer = null; }
function pintarReloj(seg) {
  reloj.textContent = `${String(Math.floor(seg / 60)).padStart(2, '0')}:${String(seg % 60).padStart(2, '0')}`;
}

if (lista) document.querySelector('[data-armar]').onclick = () => {
  parar();
  reloj.hidden = true;
  reloj.removeAttribute('data-fin');
  aviso.textContent = '';
  if (verResp) { verResp.hidden = false; verResp.disabled = false; }
  lista.replaceChildren();
  sorteo().filter(Boolean).forEach((orig, i) => {
    const c = orig.cloneNode(true);
    c.removeAttribute('id'); c.removeAttribute('data-id'); c.removeAttribute('data-pregunta'); c.removeAttribute('hidden'); // el clon no guarda marcas; sí deja escribir y corregir con IA (ia.js delega en document)
    c.querySelector('.preg-acc')?.remove();
    c.querySelector('[data-estado-txt]')?.remove();
    c.removeAttribute('data-estado'); c.removeAttribute('data-n'); c.removeAttribute('style'); // sin marcas ni borradores de la práctica
    c.querySelectorAll('textarea').forEach((t) => { t.value = ''; t.textContent = ''; });
    c.querySelectorAll('details').forEach((d) => d.removeAttribute('open')); // respuesta modelo y menú de IA cerrados
    // el número va en un chip aparte: el título (data-ia-tit) queda limpio para el prompt de IA
    c.querySelector('.preg-cab').prepend(Object.assign(document.createElement('span'), { className: 'chip chip-fuerte', textContent: `Pregunta ${i + 1}` }));
    lista.append(c);
  });
  if (document.querySelector('[data-crono]').checked) {
    const fin = Date.now() + Number(document.querySelector('[data-minutos]').value) * 60000; // por reloj, no por ticks: no se atrasa en segundo plano
    let resto = Math.ceil((fin - Date.now()) / 1000);
    reloj.hidden = false;
    pintarReloj(resto);
    timer = setInterval(() => {
      resto = Math.ceil((fin - Date.now()) / 1000);
      pintarReloj(Math.max(resto, 0));
      if (resto <= 0) { parar(); reloj.dataset.fin = ''; reloj.textContent += ' · tiempo'; aviso.textContent = 'Se terminó el tiempo del simulacro.'; }
    }, 1000);
  }
  lista.firstElementChild?.scrollIntoView({ block: 'nearest' });
};

// Al terminar: corta el cronómetro y abre todas las respuestas modelo.
if (verResp) verResp.onclick = () => {
  parar();
  lista.querySelectorAll('details[data-resp]').forEach((d) => (d.open = true));
  verResp.disabled = true;
  aviso.textContent = 'Respuestas modelo abiertas.';
};
