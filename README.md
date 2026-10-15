# ⚖️ Legislación · UTN FRC — Sitio de estudio

Sitio para preparar **Legislación** (Ingeniería en Sistemas, UTN FRC). Hoy el foco es el **2º parcial: Unidad 2 · De las personas** (miércoles 21/10 o 28/10, a confirmar, desarrollo, 4–5 preguntas, 60 min).

👉 **Abrir:** https://gabibertero.github.io/legislacion/

## Qué tiene

- **Top 15**: las preguntas más probables, de mayor a menor, con la respuesta modelo a la vista y palabras clave.
- **Corrección con IA**: escribís tu respuesta y un solo botón "✨ Corregir con IA ▾" la manda a **Claude, ChatGPT o Gemini** con la consigna y la respuesta modelo (nota /10, qué falta, explicación y versión para el 10). Vacía → te explica el tema.
- **Simulacro**: 5 preguntas al azar de temas distintos, cronómetro de 60 min.
- **Resumen** completo y **machete** de una hoja.
- **Choices** (71) por nivel y tema, con explicación y "solo las que fallé".
- **Tarjetas** (57) con repaso espaciado en 3 cajas.
- **Home**: cuenta regresiva, progreso por tema y "seguir donde dejaste".
- Tema claro/oscuro, pensado para celular.

El 1º parcial (Unidad 1) también está migrado: parcial tomado resuelto, resumen, choices y tarjetas. La guía anterior sigue en [`/u1/`](https://gabibertero.github.io/legislacion/u1/).

El progreso se guarda solo en tu navegador (localStorage).

## Fuente

Material de cátedra (`Material_Legislacion`). Las respuestas modelo son elaboradas a partir de ese material, no oficiales; el orden del Top 15 es una estimación.

## Desarrollo

Astro + MDX, JS vanilla. Código en `fuente/`, el build sale a `docs/` (GitHub Pages: `main` · `/docs`).

```bash
cd fuente
npm install
npm run build      # → ../docs
npm test           # Playwright (desktop + celular)
npm run test:lab   # node --test (lógica pura)
```
