# Plantilla de sitio de estudio (Astro + MDX + KaTeX)

Cómo usarla:

1. Copiar a `<materia>/github/fuente` (mejor con `node ../scripts/nuevo-sitio.mjs <destino> respuestas.json`, que además escribe un `sitio.config.mjs` inicial).
2. Editar **solo** `sitio.config.mjs`: nombre, base (`'/AM2/'`), prefijo de localStorage, paleta, unidades, instancias, footer.
3. Borrar los ejemplos (todo lo marcado "ejemplo — borrar"): `src/content/*/ejemplo-*.mdx`, `src/scripts/lab/ejemplo.js` (y su entrada en `lab/index.js`), `tests/check_ejemplo.py`. Los specs de `tests/` usan `ejemplo-1`: adaptarlos a tu primer parcial real.
4. Cargar contenido en `src/content/{parciales,preguntas,machetes}` (frontmatter con `instancia` y `unidades` de la config). Estándar: `estandar-soluciones.md`.
5. `npm install`, `npm run build` (sale a `../docs`, nunca la raíz), `npm test`, `npm run test:lab`.

Scripts: `check-ids.mjs` (valida config y ids, corre en el build), `limpiar-icloud.sh`, `verificar-online.sh <url> <docs>`, `figuras_ejemplo.py`, `medir-estetica.mjs <url>` (contraste, desbordes, táctiles, fuentes, escala de espaciado; JSON).
