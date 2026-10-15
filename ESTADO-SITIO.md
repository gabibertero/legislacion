# Sitio Legislación — estado
URL: https://gabibertero.github.io/legislacion/ · Repo: gabibertero/legislacion · Carpeta: 4º Año/Legislacion/github/

## Preferencias de Gabi (entrevista 2026-10-14)
- Alcance / instancias y unidades / urgencia: sitio de toda la materia con Home. 1º parcial = U1 (aprobado con 10, 07/10). **2º parcial = U2 "De las personas" completa, miércoles 21/10/2026.** Final después. Prioridad: U2 ya; U1 se migra después del parcial (mientras, el Home linkea a la guía vieja).
- Cómo evalúa la cátedra: parcial de **desarrollo**, 4–5 preguntas, 60 min. Se responde con la definición de cátedra. Entra solo la U2 del programa: clases de personas, nacimiento y fin, personas físicas, atributos (nombre, domicilio, estado, capacidad/incapacidad).
- Material: solo `teoria/Material_Legislacion.docx.pdf` (+ Notion "U2 · De las personas"). No hay parciales viejos de U2.
- Secciones y funciones (U2): **Top 15 preguntas más probables (de mayor a menor) con respuesta modelo** — como en el 1º parcial, es lo que más le sirvió —, resumen U2, simulacro de desarrollo (4–5 al azar, 60 min, autocorrección por puntos clave), choices, tarjetas + machete. IA en todo (corregir desarrollo y "Explicámelo"; copia consulta y abre ChatGPT/Gemini).
- Home: progreso por tema + lo que haga falta (cuenta regresiva al 21/10, seguir donde dejaste, plan hasta el parcial).
- Estética: mantener bordó `#b3201f` y crema `#fffaee`, serif Newsreader en títulos, tema oscuro. Favicon/hero: balanza de la justicia.
- Publicación / privacidad: mismo repo y URL. Astro en `fuente/` → `docs/`; hay que pasar Pages a main · /docs (confirmar con Gabi). Guía vieja U1 se conserva accesible.

## Etapas
- [x] nueva (entrevista; inventario = solo Material_Legislacion, U2)
- [x] base: plantilla copiada a `fuente/` (config, prefijo `legis:v2:`, guía vieja U1 en `public/u1/`)
- [x] diseño (disenador: bordó/crema, Newsreader, favicon balanza, Home). estetica 72 → 84 (2ª vuelta) + ajustes míos de CSS (largo de línea, toques 44px, índice, checkboxes); no re-puntuado.
- [x] Top 15 U2 (profe 84 → aplicados los 14 hallazgos; orden reajustado)
- [x] contenido: 26 preguntas, resumen, machete, 71 choices, 57 tarjetas (profe: resumen 88, machete 80, choices 89, tarjetas 81 → 24 hallazgos aplicados)
- [x] revision: code-review (0 críticos, 4 altos arreglados), tester (8 fallos, 0 graves, arreglados salvo link de vuelta en u1/), suite 84 Playwright + 25 node --test verde
- [x] 2026-10-14 (2ª tanda, pedido de Gabi): Top 15 con respuesta a la vista (+ "Explicámelo con IA"); preguntero/simulacro con respuesta oculta; Home sin plan diario; fecha 21/10 o 28/10 (a confirmar, `fechaAlt`: la cuenta pasa sola al 28).
- [x] U1 migrada a `parcial-1/` con `fuente/scripts/migrar-u1.py` (datos sacados del bundle viejo a `scripts/migracion-u1/`): 5 preguntas del 1º parcial real (literal) + 11 de desarrollo, resumen 12 temas, 116 choices, 71 tarjetas. Contenido copiado tal cual (no re-auditado por profe). Guía vieja sigue en `/u1/`.
- [ ] publicar: commit 73b0fb9 pusheado; FALTA que Gabi pase Pages a main · /docs; luego verificar online y borrar index.html/favicon viejos de la raíz.

## Decisiones tomadas
- 2026-10-14: Gabi quiere TODO hoy (no en días). Tanda 1 en paralelo: redactor (Top 15 + 10 extra → `preguntas/u2.mdx`), redactor (resumen, machete, choices-u2.json, tarjetas-u2.json), web (Top 15, choices, tarjetas, simulacro, Home, tests).
- Fuente extraída: `../apuntes/_fuentes/U2-material.md` (Material pp. 42–60). Temas fijos: `src/data/temas-u2.json`.
- Botón único "Corregir con IA ▾" (Claude/ChatGPT/Gemini/copiar) agregado a la skill sitio-materia (IA.astro, ia.js, ia-prompt.js + test) y usado acá.
- Migrar del HTML empaquetado a la plantilla Astro de sitio-materia (como AGA).
- Materia sin cálculo: el contenido lo arma `redactor`/`profe`, no `resolvedor` con sympy.

## Pendientes para Gabi
- Confirmar cambio de Pages a main · /docs al publicar.
