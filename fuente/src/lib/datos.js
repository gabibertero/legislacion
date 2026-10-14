// Datos de estudio por unidad: choices-<u>.json, tarjetas-<u>.json, temas-<u>.json en src/data/.
// Si todavía no existen, las listas quedan vacías y las páginas compilan igual.
// SITIO_FIXTURES=1 usa tests/fixtures/ (solo para probar sin el contenido real).
const fix = process.env.SITIO_FIXTURES === '1';
const todos = {
  choices: import.meta.glob(['../data/choices-*.json', '../../tests/fixtures/choices-*.json'], { eager: true, import: 'default' }),
  tarjetas: import.meta.glob(['../data/tarjetas-*.json', '../../tests/fixtures/tarjetas-*.json'], { eager: true, import: 'default' }),
  temas: import.meta.glob(['../data/temas-*.json'], { eager: true, import: 'default' }),
};

// Junta los archivos `<tipo>-<unidad>.json` de las unidades pedidas y anota la unidad en cada ítem.
function juntar(tipo, unidades) {
  return Object.entries(todos[tipo])
    .filter(([ruta]) => tipo === 'temas' || fix === ruta.includes('tests/fixtures'))
    .flatMap(([ruta, lista]) => {
      const u = ruta.match(new RegExp(`${tipo}-([\\w.]+)\\.json$`))?.[1]?.toUpperCase();
      return unidades.includes(u) && Array.isArray(lista) ? lista.map((x) => ({ ...x, unidad: u })) : [];
    });
}
export const choicesDe = (unidades) => juntar('choices', unidades);
export const tarjetasDe = (unidades) => juntar('tarjetas', unidades);
export const temasDe = (unidades) => {
  const vistos = new Set();
  return juntar('temas', unidades).filter((t) => !vistos.has(t.id) && vistos.add(t.id));
};

// Atributos de cada <Pregunta ...> de un MDX (solo valores entre comillas), para el Home y el Top 15.
export function preguntasDeMdx(cuerpo) {
  const tags = cuerpo.match(/<Pregunta\b(?:[^>"'{]|"[^"]*"|'[^']*'|\{[^}]*\})*>/g) ?? [];
  return tags.map((t) => Object.fromEntries([...t.matchAll(/\b([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]])));
}
