import { test } from 'node:test';
import assert from 'node:assert/strict';
import { armarPrompt, urlDestino, MAX_URL } from '../src/scripts/ia-prompt.js';

const materia = { largo: 'Legislación', facultad: 'UTN FRC', carrera: 'Ingeniería en Sistemas' };

test('con respuesta escrita arma una corrección con modelo y respuesta', () => {
  const p = armarPrompt({ materia, tema: 'Domicilio', enunciado: 'Defina domicilio.', modelo: 'Es el lugar...', mia: 'Donde vivo' });
  assert.match(p, /Corregí mi respuesta/);
  assert.match(p, /Mi respuesta:\nDonde vivo/);
  assert.match(p, /Es el lugar/);
  assert.match(p, /Legislación \(UTN FRC, Ingeniería en Sistemas\)/);
});

test('sin respuesta (o solo espacios) pide explicación y no deja bloques vacíos', () => {
  const p = armarPrompt({ materia, tema: 'Capacidad', modelo: 'Aptitud...', mia: '   ' });
  assert.match(p, /Explicame este tema/);
  assert.doesNotMatch(p, /Mi respuesta/);
  assert.doesNotMatch(p, /Consigna:/);
});

test('Claude y ChatGPT llevan el prompt en ?q, Gemini se pega', () => {
  assert.equal(urlDestino('claude', 'hola mundo').url, 'https://claude.ai/new?q=hola%20mundo');
  assert.equal(urlDestino('chatgpt', 'a&b').url, 'https://chatgpt.com/?q=a%26b');
  assert.deepEqual(urlDestino('gemini', 'x'), { url: 'https://gemini.google.com/app', pegar: true });
  assert.equal(urlDestino('copiar', 'x'), null);
});

test('prompt demasiado largo: abre sin ?q y avisa que hay que pegar', () => {
  const d = urlDestino('claude', 'á'.repeat(MAX_URL));
  assert.deepEqual(d, { url: 'https://claude.ai/new', pegar: true });
});
