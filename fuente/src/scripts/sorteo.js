// Lógica pura del simulacro (sin DOM, testeada en tests/sorteo.test.mjs): una pregunta por grupo, evitando repetir tema.
// grupos = [[{ tema }, ...], ...]. Devuelve un elemento por grupo, en el mismo orden. Si un grupo no tiene alternativa, repite.
export function elegirSinRepetir(grupos, rng = Math.random) {
  const usados = new Set(), out = new Array(grupos.length);
  const temas = (g) => new Set(g.map((x) => x.tema));
  // Primero los grupos con menos temas posibles (los más restringidos).
  const orden = grupos.map((g, i) => i).sort((a, b) => temas(grupos[a]).size - temas(grupos[b]).size || rng() - 0.5);
  for (const i of orden) {
    const libres = grupos[i].filter((x) => !x.tema || !usados.has(x.tema));
    const pool = libres.length ? libres : grupos[i];
    if (!pool.length) continue;
    out[i] = pool[Math.floor(rng() * pool.length)];
    if (out[i].tema) usados.add(out[i].tema);
  }
  return out;
}
