// Ids de los <Ejercicio id="..."> de un .mdx (compartido con scripts/check-ids.mjs).
// (?<![\w-]) evita matchear data-id= u otros atributos terminados en id.
export const idsDeEjercicios = (texto) => [...texto.matchAll(/<Ejercicio\b[^>]*?(?<![\w-])id="([^"]+)"/g)].map((m) => m[1]);
