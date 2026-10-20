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
      "acento": "#7a1f3d",
      "acento2": "#8a6a1f",
      "acento3": "#4a3b63",
      "fondo": "#faf4e8",
      "sup": "#fffdf9",
      "sup2": "#f3eadb",
      "texto": "#2b1d20",
      "suave": "#645257",
      "borde": "#e6dccb",
      "borde-fuerte": "#b4a48f"
    },
    "oscuro": {
      "acento": "#e594a8",
      "acento2": "#dfc072",
      "acento3": "#b9a6dc",
      "fondo": "#181214",
      "sup": "#221a1d",
      "sup2": "#2c2226",
      "texto": "#f4ebe6",
      "suave": "#c0aeb2",
      "borde": "#3a2d32",
      "borde-fuerte": "#6b5860"
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
