// Generado por nuevo-sitio.mjs. ÚNICO archivo específico de la materia: editalo a mano.
// Instancias: estado 'listo' | 'en-construccion' | 'proximamente'; ruta/descripcion/secciones opcionales.
export default {
  "materia": {
    "corto": "Legislación",
    "largo": "Legislación",
    "facultad": "UTN FRC",
    "carrera": "Ingeniería en Sistemas",
    "lead": "Todo para rendir Legislación: las preguntas más probables con respuesta modelo, resumen, simulacro de desarrollo, choices y tarjetas. Con corrección por IA.",
    "icono": "⚖"
  },
  "site": "https://gabibertero.github.io",
  "repo": "https://github.com/gabibertero/legislacion",
  "base": "/legislacion/",
  "prefijo": "legis:v2:",
  "paleta": {
    "claro": {
      "acento": "#b3201f",
      "acento2": "#7a5c0d",
      "acento3": "#1e3a5f",
      "fondo": "#fffaee",
      "sup": "#fffdf7",
      "sup2": "#f8f0dc",
      "texto": "#2a1d1a",
      "suave": "#625248",
      "borde": "#e9dec5",
      "borde-fuerte": "#b9a98a"
    },
    "oscuro": {
      "acento": "#ee6f68",
      "acento2": "#e3c25a",
      "acento3": "#8fb3e0",
      "fondo": "#171311",
      "sup": "#211b18",
      "sup2": "#2b2420",
      "texto": "#f3ebdf",
      "suave": "#bcaea0",
      "borde": "#3a302b",
      "borde-fuerte": "#6a5b52"
    }
  },
  "fuentes": {
    "ui": "'Instrument Sans', system-ui, -apple-system, 'Segoe UI', sans-serif",
    "editorial": "'Newsreader', Georgia, 'Times New Roman', serif"
  },
  "unidades": [
    {
      "id": "U1",
      "titulo": "El Derecho · Derecho Constitucional"
    },
    {
      "id": "U2",
      "titulo": "De las personas"
    },
    {
      "id": "U3",
      "titulo": "Hechos jurídicos"
    },
    {
      "id": "U4",
      "titulo": "Bienes y patrimonio"
    }
  ],
  "instancias": [
    {
      "id": "parcial-1",
      "titulo": "1º parcial",
      "unidades": [
        "U1"
      ],
      "estado": "listo",
      "descripcion": "Aprobado (07/10). Unidad 1 · El Derecho: el parcial tomado resuelto, resumen, choices y tarjetas. Sirve para el final.",
      "secciones": [
        "teoria",
        "machetes"
      ]
    },
    {
      "id": "parcial-2",
      "titulo": "2º parcial",
      "unidades": [
        "U2"
      ],
      "estado": "listo",
      "descripcion": "Unidad 2 · De las personas. Miércoles 21/10 o 28/10 (a confirmar) · desarrollo, 4–5 preguntas, 60 min.",
      "fecha": "2026-10-21T08:00:00-03:00",
      "fechaAlt": "2026-10-28T08:00:00-03:00",
      "secciones": [
        "top15",
        "teoria",
        "machetes"
      ]
    },
    {
      "id": "final",
      "titulo": "Final",
      "unidades": [
        "U1",
        "U2",
        "U3",
        "U4"
      ],
      "estado": "proximamente"
    }
  ],
  "archivos": {
    "MAT": "Material_Legislacion.docx.pdf",
    "CCyC": "Código Civil y Comercial de la Nación"
  },
  "examen": {
    "minutos": 60
  },
  "footer": {
    "nota": "Sitio de estudio no oficial, hecho con Claude para preparar la materia.",
    "fuentes": "Material de cátedra. Material_Legislacion de la cátedra. Las respuestas modelo son elaboradas a partir de ese material, no oficiales; el orden del Top 15 es una estimación.",
    "links": [
      {
        "texto": "Hecho con Claude Code",
        "href": "https://claude.com/claude-code"
      }
    ]
  }
};
