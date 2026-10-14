// Lectura de sitio.config.mjs para las páginas (lado servidor). No hay valores de materia acá.
import cfg from '../../sitio.config.mjs';

export default cfg;

export const ESTADOS = { listo: 'Listo', 'en-construccion': 'En construcción', proximamente: 'Próximamente' };
export const SECCIONES = ['parciales', 'teoria', 'machetes', 'laboratorio'];

const rango = (u) => (u.length > 1 ? `${u[0]}–${u[u.length - 1]}` : u[0] ?? '');
export const instancias = cfg.instancias.map((i, n) => ({
  ...i,
  n,
  ruta: i.ruta ?? i.id,
  rango: rango(i.unidades),
  secciones: i.secciones ?? SECCIONES,
  disponible: i.estado !== 'proximamente',
}));
export const disponibles = instancias.filter((i) => i.disponible);
export const conSeccion = (s) => disponibles.filter((i) => i.secciones.includes(s));
export const unidadTitulo = (id) => cfg.unidades.find((u) => u.id === id)?.titulo ?? id;
export const instanciaDe = (id) => instancias.find((i) => i.id === id);

// Contraste: texto blanco u oscuro, el que mejor se lea sobre el acento.
const lum = (hex) => {
  const h = hex.replace('#', '');
  const c = (h.length === 3 ? [...h].map((x) => x + x) : h.match(/../g)).map((x) => {
    const v = parseInt(x, 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const sobre = (hex) => (1.05 / (lum(hex) + 0.05) >= (lum(hex) + 0.05) / 0.056 ? '#ffffff' : '#10131c');

const vars = ({ acento, acento2, acento3, ...otros }) =>
  [
    `--acento:${acento}`, `--link:${acento}`, `--sobre-acento:${sobre(acento)}`,
    `--acento2:${acento2}`, `--acento3:${acento3}`,
    ...Object.entries(otros).map(([k, v]) => `--${k}:${v}`),
  ].join(';');

// Variables CSS generadas desde la config (paleta, tipografía, color por unidad e instancia). Se inyectan en el Layout.
// `html:root` sube la especificidad para poder pisar neutros de global.css si la paleta los define.
export function cssTema() {
  const { claro, oscuro } = cfg.paleta;
  const ciclo = ['var(--acento)', 'var(--acento2)', 'var(--acento3)'];
  const id = (s) => String(s).replace(/[^\w.-]/g, '');
  return [
    `html:root{--f-ui:${cfg.fuentes.ui};--f-ed:${cfg.fuentes.editorial};${vars(claro)}}`,
    `@media (prefers-color-scheme: dark){html:root:not([data-tema='light']){${vars(oscuro)}}}`,
    `html:root[data-tema='dark']{${vars(oscuro)}}`,
    ...cfg.unidades.map((u, i) => `[data-unidad="${id(u.id)}"]{--uc:${ciclo[i % 3]}}`),
    ...instancias.map((x, i) => `.mapa-g[data-g="${id(x.id)}"],.acc[data-g="${id(x.id)}"]{--gc:${ciclo[i % 3]}}`),
  ].join('\n');
}
