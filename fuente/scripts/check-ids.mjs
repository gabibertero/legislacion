// Valida sitio.config.mjs y el contenido. Falla si hay ids de <Ejercicio> duplicados, sin prefijo del examen,
// sin fuente/pagina, o si un parcial apunta a una instancia/unidad que no existe en la config.
import { readdirSync, readFileSync } from 'node:fs';
import { idsDeEjercicios } from '../src/scripts/ids.js';
import cfg from '../sitio.config.mjs';

const errores = [];
const unidades = new Set(cfg.unidades.map((u) => u.id));
const instancias = new Map(cfg.instancias.map((i) => [i.id, i]));
const ESTADOS = ['listo', 'en-construccion', 'proximamente'];
const ident = /^[\w.-]+$/;

// ---- config ----
if (!/^\/([\w.-]+\/)*$/.test(cfg.base)) errores.push(`config: base "${cfg.base}" debe empezar y terminar con "/" (ej. '/AM2/')`);
if (!cfg.prefijo?.endsWith(':')) errores.push(`config: prefijo "${cfg.prefijo}" debe terminar con ":" (ej. 'am2:v1:')`);
for (const t of ['claro', 'oscuro']) for (const k of ['acento', 'acento2', 'acento3']) {
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(cfg.paleta?.[t]?.[k] ?? '')) errores.push(`config: paleta.${t}.${k} debe ser un color #rgb o #rrggbb`);
}
if (unidades.size !== cfg.unidades.length) errores.push('config: ids de unidades repetidos');
if (instancias.size !== cfg.instancias.length) errores.push('config: ids de instancias repetidos');
for (const u of cfg.unidades) if (!ident.test(u.id)) errores.push(`config: id de unidad "${u.id}" inválido (letras, números, . _ -)`);
for (const i of cfg.instancias) {
  if (!ident.test(i.id)) errores.push(`config: id de instancia "${i.id}" inválido (letras, números, . _ -)`);
  if (!ESTADOS.includes(i.estado)) errores.push(`config: instancia ${i.id}: estado "${i.estado}" no es ${ESTADOS.join(' | ')}`);
  for (const u of i.unidades) if (!unidades.has(u)) errores.push(`config: instancia ${i.id}: unidad "${u}" no está en unidades`);
}

// ---- contenido ----
const vistos = new Map();
const dir = new URL('../src/content/parciales/', import.meta.url);
const campo = (texto, n) => texto.match(new RegExp(`^${n}:\\s*"?([^"\\n]+?)"?\\s*$`, 'm'))?.[1];

for (const f of readdirSync(dir).filter((n) => n.endsWith('.mdx'))) {
  const texto = readFileSync(new URL(f, dir), 'utf8');
  const examen = campo(texto, 'id');
  if (!examen) errores.push(`${f}: frontmatter sin id`);
  const inst = campo(texto, 'instancia');
  if (!inst) errores.push(`${f}: frontmatter sin instancia`);
  else if (!instancias.has(inst)) errores.push(`${f}: instancia "${inst}" no está en sitio.config.mjs`);
  const us = texto.match(/^unidades:\s*\[(.*)\]/m)?.[1].split(',').map((x) => x.trim().replace(/^"|"$/g, '')).filter(Boolean) ?? [];
  for (const u of us) if (!unidades.has(u)) errores.push(`${f}: unidad "${u}" no está en sitio.config.mjs`);
  for (const [tag] of texto.matchAll(/<Ejercicio\b[^>]*>/g)) {
    const [id] = idsDeEjercicios(tag);
    if (!id) { errores.push(`${f}: Ejercicio sin id`); continue; }
    if (examen && !id.startsWith(`${examen}#`)) errores.push(`${f}: id "${id}" no empieza con "${examen}#"`);
    if (vistos.has(id)) errores.push(`id duplicado "${id}" en ${f} y ${vistos.get(id)}`);
    vistos.set(id, f);
    for (const n of ['fuente', 'pagina']) {
      if (!new RegExp(`(?<![\\w-])${n}=(?:"[^"]+"|\\{[^}]+\\})`).test(tag)) errores.push(`${f}: ${id} sin ${n}`);
    }
  }
}
if (errores.length) { console.error(errores.join('\n')); process.exit(1); }
console.log(`check-ids OK: ${vistos.size} ejercicios, sin duplicados; config válida.`);
