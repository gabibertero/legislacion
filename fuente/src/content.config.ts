import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// SITIO_FIXTURES=1: contenido de prueba en tests/fixtures/ (para testear sin el contenido real).
const FIX = process.env.SITIO_FIXTURES === '1';

// `instancia` = id de una instancia de sitio.config.mjs; `unidades` = ids de unidades de la config (lo valida scripts/check-ids.mjs).
const parciales = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/parciales' }),
  schema: z.object({
    id: z.string(),
    instancia: z.string(),
    titulo: z.string(),
    fecha: z.string().optional(), // tal cual figura en el examen; los modelos no traen
    tipo: z.string(), // agrupa la lista de la instancia: 'práctico', 'teórico', 'modelo', 'final'...
    tema: z.string().optional(),
    fuente: z.string(), // ruta del PDF relativa a la carpeta de la materia
    paginasEnunciado: z.string(),
    paginasResolucion: z.string().optional(), // sin resolución oficial = se omite
    orden: z.number(),
    unidades: z.array(z.string()),
  }),
});

// Preguntero teórico: un MDX por unidad con varias <Pregunta>. Machetes: un MDX por tema.
// Aparecen en las instancias cuya lista de unidades incluye `unidad`.
const preguntas = defineCollection({
  loader: glob({ pattern: '*.mdx', base: FIX ? './tests/fixtures/preguntas' : './src/content/preguntas' }),
  schema: z.object({ titulo: z.string(), unidad: z.string(), orden: z.number() }),
});

const machetes = defineCollection({
  loader: glob({ pattern: '*.mdx', base: FIX ? './tests/fixtures/machetes' : './src/content/machetes' }),
  schema: z.object({ titulo: z.string(), unidad: z.string(), orden: z.number(), resumen: z.string() }),
});

export const collections = { parciales, preguntas, machetes };
