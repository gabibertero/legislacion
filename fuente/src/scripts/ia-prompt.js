// Lógica pura del botón de IA (sin DOM, testeada en tests/ia.test.mjs): arma el prompt y la URL de cada IA.

// Claude y ChatGPT aceptan el prompt por ?q=. Gemini no tiene parámetro: se abre vacío y se pega desde el portapapeles.
export const DESTINOS = {
  claude: { nombre: 'Claude', url: 'https://claude.ai/new', q: 'q' },
  chatgpt: { nombre: 'ChatGPT', url: 'https://chatgpt.com/', q: 'q' },
  gemini: { nombre: 'Gemini', url: 'https://gemini.google.com/app', q: null },
};
// Más largo que esto, algunos navegadores/servidores cortan la URL: se abre sin ?q y se pega.
export const MAX_URL = 7000;

export function urlDestino(dest, prompt) {
  const d = DESTINOS[dest];
  if (!d) return null;
  if (!d.q) return { url: d.url, pegar: true };
  const url = `${d.url}?${d.q}=${encodeURIComponent(prompt)}`;
  return url.length > MAX_URL ? { url: d.url, pegar: true } : { url, pegar: false };
}

const bloque = (titulo, texto) => (texto && texto.trim() ? `\n${titulo}:\n${texto.trim()}\n` : '');

// modo 'corregir' con respuesta escrita → corrección; sin respuesta → explicación del tema.
export function armarPrompt({ materia = {}, tema = '', enunciado = '', modelo = '', mia = '' }) {
  const quien = `Sos profesor/a de ${materia.largo || 'la materia'}${materia.facultad ? ` (${materia.facultad}${materia.carrera ? `, ${materia.carrera}` : ''})` : ''}.`;
  const ctx = bloque('Tema', tema) + bloque('Consigna', enunciado) + bloque('Respuesta modelo / material de cátedra (es la referencia: no inventes contenido que no esté acá o en la bibliografía oficial)', modelo);
  if (mia && mia.trim()) {
    return `${quien} Corregí mi respuesta de examen como lo haría la cátedra y enseñame lo que me falta.
${ctx}${bloque('Mi respuesta', mia)}
Devolveme:
1. Nota sobre 10 y por qué.
2. Qué está bien.
3. Qué falta o está mal comparado con la respuesta modelo (nombrá los conceptos y términos exactos que espera la cátedra).
4. Explicame lo que no entendí, con un ejemplo simple.
5. Mi respuesta reescrita para sacar 10, sin agregar nada que no esté en el material.
Respondé en español rioplatense, directo.`;
  }
  return `${quien} Explicame este tema para el examen, a partir del material de cátedra.
${ctx}
Explicámelo paso a paso y con un ejemplo, decime qué es lo que más suele tomar y qué términos no pueden faltar en la respuesta. Terminá con 2 preguntas para chequear que entendí (sin las respuestas hasta que conteste).
Respondé en español rioplatense, directo.`;
}
