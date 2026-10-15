# Cómo contribuir

## Reportar un error en una respuesta
Abrí un issue con la plantilla **Error en un ejercicio** e indicá:
- la página (por ejemplo `/parcial-2/top15/`) y el título de la pregunta;
- qué dice el sitio y qué dice el material de cátedra (con página si podés).

Las respuestas modelo no son oficiales: se elaboran a partir de `Material_Legislacion`.

## Correr los tests
```bash
cd fuente
npm install
npm test           # Playwright (desktop + celular)
npm run test:lab   # node --test (lógica pura)
```

## Pull requests
Cambios chicos y con test si tocan lógica. El contenido vive en `fuente/src/content/` y `fuente/src/data/`; `docs/` es el build, no se edita a mano.
