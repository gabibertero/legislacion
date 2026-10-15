// Solo presentación: barras de progreso, índice de ejercicios y callouts. Lee localStorage (estado:) sin escribir.
import { leer as leerClave } from './scripts/progreso.js';
const leer = (id) => leerClave('estado:' + id);
const hechos = (ids) => ids.filter((id) => leer(id) === 'resuelto').length;
const lista = (el) => (el.dataset.ids || '').split(',').filter(Boolean);

function pintar() {
  document.querySelectorAll('[data-barra]').forEach((el) => {
    const ids = lista(el);
    el.style.setProperty('--p', ids.length ? Math.round((100 * hechos(ids)) / ids.length) + '%' : '0%');
  });
  document.querySelectorAll('[data-tu-progreso]').forEach((el) => {
    const ids = lista(el);
    const n = hechos(ids);
    el.querySelector('[data-n]').textContent = n;
    el.querySelector('[data-t]').textContent = ids.length;
    el.style.setProperty('--p', ids.length ? Math.round((100 * n) / ids.length) + '%' : '0%');
  });
  document.querySelectorAll('[data-indice] a[data-id]').forEach((a) => {
    const e = leer(a.dataset.id) || 'pendiente';
    a.dataset.estado = e;
    a.querySelector('.est').textContent = { pendiente: 'pendiente', 'en-curso': 'en curso', resuelto: 'resuelto' }[e] || e;
  });
}

const indice = document.querySelector('[data-indice] ol');
if (indice) {
  document.querySelectorAll('[data-ejercicio]').forEach((ej) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = '#' + ej.id;
    a.dataset.id = ej.dataset.id;
    a.innerHTML = `<span class="n"></span><span class="est"></span>`;
    a.querySelector('.n').textContent = 'Ejercicio ' + ej.querySelector('h2').textContent.replace(/^Ejercicio\s*/, '');
    li.append(a);
    indice.append(li);
    ej.querySelectorAll('input[type=radio]').forEach((r) => r.addEventListener('change', pintar));
  });
} else {
  document.querySelector('[data-indice]')?.remove();
}

// Tablas anchas (display:block + overflow): alcanzables con teclado para desplazarlas a 390px.
document.querySelectorAll('.lectura table, .resp table').forEach((t) => {
  if (t.scrollWidth > t.clientWidth) Object.assign(t, { tabIndex: 0 }).setAttribute('aria-label', 'Tabla (desplazable)');
});

// Secciones de lectura: "Errores frecuentes", "Ojo con", "Fórmulas clave" pasan a ser cajas.
document.querySelectorAll('.lectura').forEach((cont) => {
  cont.querySelectorAll('h2, h3').forEach((h) => {
    const t = h.textContent;
    const tipo = /errores frecuentes|ojo con/i.test(t) ? 'ojo' : /f[óo]rmulas? clave/i.test(t) ? 'formulas' : null;
    if (!tipo) return;
    const caja = document.createElement('div');
    caja.className = 'caja caja-' + tipo;
    let n = h.nextSibling;
    h.before(caja);
    caja.append(h);
    const corte = h.nodeName === 'H3' ? /^H[123]$/ : /^H[12]$/; // un "### Ojo con" se cierra en el próximo título de su nivel
    while (n && !corte.test(n.nodeName)) { const s = n.nextSibling; caja.append(n); n = s; }
  });
});

// El texto de los títulos con fórmulas trae el MathML duplicado: en el índice se usa solo el texto visible.
document.querySelectorAll('.toc a').forEach((a) => {
  let h = null;
  try { h = document.getElementById(decodeURIComponent(a.hash.slice(1))); } catch { /* % mal formado en el título */ }
  if (!h) return;
  const c = h.cloneNode(true);
  c.querySelectorAll('.katex-mathml').forEach((m) => m.remove());
  a.textContent = c.textContent;
});

pintar();
addEventListener('pageshow', pintar);
addEventListener('storage', pintar);
