"""EJEMPLO de figura reproducible (matplotlib -> SVG) con helpers del estándar: ejes graduados de a 1 con la misma escala,
rótulos sin superposición y export SVG con texto editable.
Uso: python3 scripts/figuras_ejemplo.py [salida.svg]   (default: public/figuras/ejemplo/ejemplo.svg)"""
import sys
from pathlib import Path
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.transforms import Bbox
import numpy as np

plt.rcParams.update({'svg.fonttype': 'none', 'font.size': 12, 'axes.linewidth': 1.0})


def ejes_graduados(ax, xlim, ylim, paso=1):
    """Ejes por el origen, graduados de a `paso` (default 1) y con la misma escala en x e y."""
    ax.set_xlim(*xlim); ax.set_ylim(*ylim); ax.set_aspect('equal', adjustable='box')
    ax.set_xticks(np.arange(np.ceil(xlim[0]), xlim[1] + 1e-9, paso)); ax.set_yticks(np.arange(np.ceil(ylim[0]), ylim[1] + 1e-9, paso))
    ax.grid(True, color='#dddddd', lw=.6); ax.set_axisbelow(True)
    for s in ('left', 'bottom'):
        ax.spines[s].set_position('zero')
    for s in ('right', 'top'):
        ax.spines[s].set_visible(False)
    ax.tick_params(labelsize=9)
    ax.set_xlabel('x', loc='right'); ax.set_ylabel('y', loc='top', rotation=0)


def rotular(ax, puntos, color='black'):
    """Dibuja puntos [(x, y, 'P')] y rotula cada uno en la primera posición candidata que no pisa otro rótulo."""
    fig = ax.figure; fig.canvas.draw(); rend = fig.canvas.get_renderer()
    ocupados = []
    candidatos = [(8, 8), (8, -16), (-18, 8), (-18, -16), (0, 14), (0, -20), (14, 0), (-24, 0)]
    for x, y, txt in puntos:
        ax.plot([x], [y], 'o', color=color, ms=5)
        for dx, dy in candidatos:
            t = ax.annotate(txt, (x, y), xytext=(dx, dy), textcoords='offset points', color=color)
            bb = t.get_window_extent(rend).expanded(1.1, 1.2)
            if not any(bb.overlaps(o) for o in ocupados):
                ocupados.append(bb); break
            t.remove()
        else:
            t = ax.annotate(txt, (x, y), xytext=candidatos[0], textcoords='offset points', color=color)
            ocupados.append(t.get_window_extent(rend))


def exportar_svg(fig, ruta):
    """Fondo blanco, texto como <text> (svg.fonttype=none), carpeta creada si falta."""
    ruta = Path(ruta); ruta.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(ruta, format='svg', facecolor='white', bbox_inches='tight')
    print('escrito', ruta)


if __name__ == '__main__':
    salida = sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / 'public/figuras/ejemplo/ejemplo.svg'
    fig, ax = plt.subplots(figsize=(7.8, 5.2))
    ejes_graduados(ax, (-4, 4), (-2, 6))
    xs = np.linspace(-3, 3, 200); ax.plot(xs, xs**2 - 1, color='#1d4ed8', lw=2, label='$y=x^2-1$')
    rotular(ax, [(0, -1, 'V(0;-1)'), (1, 0, 'A(1;0)'), (-1, 0, "A'(-1;0)"), (2, 3, 'B(2;3)')])
    ax.legend(loc='upper left', bbox_to_anchor=(1.02, 1), frameon=False)  # leyenda fuera del área dibujada
    exportar_svg(fig, salida)
