"""Migra el contenido de la guía vieja de la U1 (public/u1/index.html, HTML empaquetado) al sitio nuevo.

Uso: python3 scripts/migrar-u1.py <carpeta con u1-D.json y u1-datos.json>
Esos JSON salen de los scripts de datos del bundle (Component.D y window.LEG_*). Se corre una sola vez;
genera src/data/{temas,choices,tarjetas}-u1.json, src/content/preguntas/u1.mdx y src/content/machetes/u1-resumen.mdx.
El texto se copia tal cual (es el contenido con el que Gabi preparó el 1º parcial); solo cambia el formato.
"""
import json, re, sys
from pathlib import Path

ORIG = Path(sys.argv[1])
RAIZ = Path(__file__).resolve().parent.parent
d = json.loads((ORIG / 'u1-D.json').read_text())
w = json.loads((ORIG / 'u1-datos.json').read_text())

NIVEL = {'f': 'facil', 'n': 'media', 'd': 'dificil'}
FUENTE = 'Guía U1 (1º parcial)'
# Tema y grupo de simulacro (una pregunta por grupo) de cada pregunta de desarrollo.
TEMA = {'p1': 'reformas', 'p1a': 'reformas', 'p2': 'soberania', 'p3': 'fuentes', 'p4': 'supremacia',
        'd1': 'moral', 'd2': 'normas', 'd3': 'natural', 'd4': 'division', 'd5': 'juris', 'd6': 'cn',
        'd7': 'cn', 'd8': 'const', 'd9': 'supremacia', 'd10': 'reformas', 'd11': 'reformas'}
SIM = {'reformas': 'A', 'cn': 'A', 'const': 'A', 'soberania': 'B', 'fuentes': 'C', 'division': 'C', 'juris': 'C',
       'supremacia': 'D', 'general': 'D', 'normas': 'E', 'moral': 'E', 'natural': 'E'}


def esc(t):
    """Texto plano → seguro para MDX (llaves y < son sintaxis)."""
    return str(t).replace('{', '&#123;').replace('}', '&#125;').replace('<', '&lt;')


def attr(t):
    return esc(t).replace('"', '”')


def bloque(b):
    t = b['t']
    if t == 'p':
        return esc(b['text'])
    if t == 'h':
        return '### ' + esc(b['text'])
    if t == 'list':
        return '\n'.join('- ' + esc(x) for x in b['items'])
    if t == 'defs':
        return '\n\n'.join(f"**{esc(x['k'])}:** {esc(x['v'])}" for x in b['items'])
    if t == 'key':
        return f"> **{esc(b.get('label') or 'Clave')}:** {esc(b['text'])}"
    if t == 'cards':
        return '\n\n'.join(f"**{esc(c['title'])}**" + (f" — {esc(c['sub'])}" if c.get('sub') else '') + ''.join('\n- ' + esc(l) for l in c.get('lines', [])) for c in b['items'])
    if t == 'table':
        fila = lambda r: '| ' + ' | '.join(esc(c).replace('|', '/') for c in r) + ' |'
        return '\n'.join([fila(b['head']), '|' + ' --- |' * len(b['head'])] + [fila(r) for r in b['rows']])
    if t == 'timeline':
        return '\n'.join(f"- **{esc(x['year'])} · {esc(x['title'])}:** {esc(x.get('text', ''))}" for x in b['items'])
    if t == 'pyramid':
        return '\n'.join(f"{i}. {esc(x)}" for i, x in enumerate(b['items'], 1)) + '\n\n*(De mayor a menor jerarquía.)*'
    raise ValueError('bloque desconocido: ' + t)


def bloques(bs):
    return '\n\n'.join(bloque(b) for b in bs)


temas = [{'id': t['id'], 'titulo': t['title']} for t in d['topics']]
ids_tema = {t['id'] for t in temas}
assert set(TEMA.values()) <= ids_tema and set(SIM) == ids_tema

# --- datos ---
choices = []
for i, (niv, preg, ops, corr, expl, tema) in enumerate(w['LEG_CHOICES'], 1):
    assert tema in ids_tema and corr and all(0 <= k < len(ops) for k in corr), preg
    choices.append({'id': f'u1c{i:03d}', 'tema': tema, 'nivel': NIVEL[niv], 'pregunta': preg, 'opciones': ops,
                    'correctas': corr, 'explicacion': expl, 'fuente': FUENTE})
tarjetas = []
for i, (tema, frente, dorso) in enumerate(w['LEG_CARDS'], 1):
    assert tema in ids_tema, frente
    tarjetas.append({'id': f'u1t{i:03d}', 'tema': tema, 'frente': frente, 'dorso': dorso, 'fuente': FUENTE})
datos = RAIZ / 'src/data'
for nombre, v in [('temas', temas), ('choices', choices), ('tarjetas', tarjetas)]:
    (datos / f'{nombre}-u1.json').write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')

# --- preguntas de desarrollo: el 1º parcial real + banco del simulacro ---
def pregunta(p, literal):
    tema = TEMA[p['id']]
    cuerpo = bloques(p['ans'])
    if p.get('checks'):
        cuerpo += '\n\n**Palabras clave que no pueden faltar:** ' + ' · '.join(esc(c) for c in p['checks']) + '.'
    if p.get('tip'):
        cuerpo += f"\n\n*Cómo encararla:* {esc(p['tip'])}"
    tit = ('Parcial · ' + p['num'] + '. ' if literal else '') + p['q']
    extra = ' literal parcial="1º parcial"' if literal else ''
    return (f'<Pregunta id="u1-{p["id"]}" unidad="U1" tema="{tema}" sim="{SIM[tema]}"{extra}\n'
            f'  titulo="{attr(tit)}" enunciado="{attr(p["q"])}">\n\n{cuerpo}\n</Pregunta>\n')

mdx = ['---', 'titulo: "Unidad 1 · El Derecho · Derecho Constitucional"', 'unidad: "U1"', 'orden: 1', '---',
       "import Pregunta from '../../components/Pregunta.astro';", '',
       '{/* Migrado de la guía vieja de la U1 con scripts/migrar-u1.py. Las "literal" son las preguntas del 1º parcial. */}', '']
mdx += [pregunta(p, True) for p in d['parcial']] + [pregunta(p, False) for p in d['dev']]
(RAIZ / 'src/content/preguntas/u1.mdx').write_text('\n'.join(mdx))

# --- resumen: un ## por tema + puntos clave de la "hoja en blanco" ---
res = ['---', 'titulo: "Resumen · Unidad 1 · El Derecho"', 'unidad: "U1"', 'orden: 1',
       'resumen: "Toda la Unidad 1 (sin Organización Administrativa): normas, moral y derecho, fuentes, Constitución, reformas y soberanía."',
       '---', '']
for t in d['topics']:
    res += [f"## {esc(t['title'])}", '', bloques(t['blocks']), '']
    if w['LEG_BLANK'].get(t['id']):
        res += ['**Repaso — puntos clave para la hoja en blanco:**', ''] + ['- ' + esc(x) for x in w['LEG_BLANK'][t['id']]] + ['']
(RAIZ / 'src/content/machetes/u1-resumen.mdx').write_text('\n'.join(res))

print(f"temas {len(temas)} · choices {len(choices)} · tarjetas {len(tarjetas)} · preguntas {len(d['parcial']) + len(d['dev'])} · resumen {len(d['topics'])} temas")
