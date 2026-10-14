// Modo examen: oculta ayudas/soluciones (CSS por body[data-examen]), cronómetro, entrega y autocorrección.
// Fases: reposo → listo → corriendo → entregado. Sin JS el panel sigue hidden y la página muestra todo.
import { leer, guardar } from './progreso.js';

const panel = document.querySelector('[data-examen-panel]');
if (panel) iniciar(panel);

function iniciar(panel) {
  const q = (n) => panel.querySelector(`[data-ex="${n}"]`);
  const clave = 'examen:' + panel.dataset.examenId;
  const ejercicios = [...document.querySelectorAll('[data-ejercicio]')];
  const mmss = (s) => {
    const a = Math.abs(Math.round(s));
    return `${Math.round(s) < 0 ? '-' : ''}${String(Math.floor(a / 60)).padStart(2, '0')}:${String(a % 60).padStart(2, '0')}`;
  };
  const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

  let fase = 'reposo', total = 0, restante = 0, fin = 0, pausado = false, reloj = null, avisado = false;
  const notas = new Map(); // ejercicio -> 0 | 0.5 | 1

  // Puntajes del prop `puntos` de cada Ejercicio; si falta alguno, reparto igual sobre 100.
  const oficial = ejercicios.every((e) => Number(e.dataset.puntos) > 0);
  const puntos = (e) => (oficial ? Number(e.dataset.puntos) : 100 / ejercicios.length);

  function ultimo() {
    try {
      const u = JSON.parse(leer(clave));
      q('ultimo').textContent = `Último intento: ${fmt(u.nota)}/100 (${mmss(u.usado)}).`;
    } catch { q('ultimo').textContent = ''; }
  }

  function calcular() {
    const nota = ejercicios.reduce((s, e) => s + puntos(e) * (notas.get(e) ?? 0), 0);
    q('nota').textContent = fmt(Math.round(nota * 10) / 10);
    const marcados = ejercicios.filter((e) => notas.has(e)).length;
    q('detalle').textContent = marcados < ejercicios.length ? `Sin autocorregir: ${ejercicios.length - marcados} (cuentan 0).` : '';
    // No pisar el último intento con un 0 si se entregó sin autocorregir nada.
    if (marcados) guardar(clave, JSON.stringify({ nota: Math.round(nota * 10) / 10, usado: Math.round(total - restante) }));
  }

  function pintarFase() {
    panel.dataset.fase = fase;
    panel.querySelectorAll('[data-en]').forEach((el) => (el.hidden = !el.dataset.en.split(' ').includes(fase)));
    if (fase === 'reposo') delete document.body.dataset.examen;
    else document.body.dataset.examen = fase === 'entregado' ? 'entregado' : 'activo';
    ejercicios.forEach((e) => (e.querySelector('[data-autocorr]').hidden = fase !== 'entregado'));
    q('oficial').hidden = fase !== 'entregado' || oficial;
    if (fase !== 'corriendo') q('aviso').hidden = true;
    const det = document.querySelector('[data-respuestas]');
    if (det && fase === 'entregado') det.open = true;
  }

  function tic() {
    if (pausado) return;
    restante = (fin - Date.now()) / 1000;
    q('reloj').textContent = mmss(restante);
    if (restante <= 0 && !avisado) { avisado = true; q('aviso').hidden = false; }
  }
  const parar = () => { clearInterval(reloj); reloj = null; };

  q('abrir').onclick = () => { fase = 'listo'; pintarFase(); q('minutos').focus(); };
  q('empezar').onclick = () => {
    const n = parseInt(q('minutos').value, 10);
    const min = Number.isNaN(n) ? 120 : Math.max(1, Math.min(600, n));
    total = restante = min * 60; fin = Date.now() + total * 1000;
    pausado = false; avisado = false;
    fase = 'corriendo'; pintarFase(); tic();
    reloj = setInterval(tic, 250);
    q('pausa').textContent = 'Pausar'; q('pausa').setAttribute('aria-pressed', 'false');
    panel.querySelector('h2').focus();
  };
  q('pausa').onclick = () => {
    pausado = !pausado;
    if (!pausado) fin = Date.now() + restante * 1000;
    q('pausa').textContent = pausado ? 'Reanudar' : 'Pausar';
    q('pausa').setAttribute('aria-pressed', pausado);
  };
  q('entregar').onclick = () => {
    tic(); parar(); fase = 'entregado'; pintarFase();
    q('usado').textContent = mmss(total - restante);
    calcular();
    panel.querySelector('h2').focus();
  };
  q('salir').onclick = () => {
    parar(); notas.clear();
    ejercicios.forEach((e) => e.querySelectorAll('[data-nota]').forEach((b) => b.setAttribute('aria-pressed', 'false')));
    fase = 'reposo'; pintarFase(); ultimo(); q('abrir').focus();
  };

  // Autocorrección por ejercicio + recordatorio de la consigna de la cátedra.
  const consigna = document.querySelector('[data-consigna] strong')?.textContent;
  ejercicios.forEach((e) => {
    const botones = [...e.querySelectorAll('[data-nota]')];
    botones.forEach((b) => (b.onclick = () => {
      notas.set(e, Number(b.dataset.nota));
      botones.forEach((o) => o.setAttribute('aria-pressed', o === b));
      calcular();
    }));
    if (consigna) {
      const p = document.createElement('p');
      p.className = 'recordatorio';
      p.textContent = 'Tener en cuenta: ' + consigna;
      e.querySelector('[data-autocorr]').append(p);
    }
  });

  // Recargar o salir de la página en medio del examen pierde el reloj: pedir confirmación.
  addEventListener('beforeunload', (ev) => { if (fase === 'corriendo') ev.preventDefault(); });

  panel.hidden = false;
  ultimo();
  pintarFase();
}
