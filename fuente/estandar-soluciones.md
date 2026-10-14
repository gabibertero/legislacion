# Estándar de soluciones

## Estructura por ejercicio (en este orden, tras `<Enunciado>`)
`<Pista>` ×3 → `<Paso>` ×4–8 → `<Solucion>` → `<Comprobacion>` → `<ResolucionOficial>`.
Todo lo elaborado vive en esos componentes ("Elaborado para el sitio — no oficial"). No se toca el texto del `<Enunciado>`.

## Escalera de pistas
- **P1:** ayuda a *reconocer* el tipo (preguntas guía). No nombra el método.
- **P2:** nombra el método y qué hay que plantear; linkea el machete.
- **P3:** el planteo casi hecho, sin llegar al resultado.

## Pasos
**Qué** se hace, **Por qué** corresponde, **Cómo reconocerlo** (si aplica) y el cálculo. Ningún `=` esconde más de una operación. Lenguaje claro, rioplatense.

## Solución y comprobación
`<Solucion>`: resultado final destacado y una línea **Ojo con:** con el error típico. `<Comprobacion>`: camino independiente (otro método, sustituir). Nunca menciona la resolución oficial.

## Figuras
Script reproducible (ver `scripts/figuras_ejemplo.py`): ejes graduados de a 1 con misma escala, rótulos sin superposición, SVG con texto editable, leyenda fuera del área dibujada. `alt` descriptivo y mirarla renderizada antes de cerrar.

## Test sympy por examen
`tests/check_<id>.py` (modelo: `tests/check_ejemplo.py`): recalcula de forma independiente, asierta resultados e intermedios y que el mismo texto LaTeX esté en el MDX.

## Discrepancias con la oficial
Nunca se corrige en silencio: se anota en el MDX ("La resolución oficial da X; el recálculo da Y — pendiente de confirmar").
