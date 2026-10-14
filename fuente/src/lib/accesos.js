// Accesos grandes de una instancia (Home y página de la instancia). `machetes` = entradas de la colección ya filtradas.
export function accesos(inst, base, machetes = []) {
  const r = `${base}${inst.ruta}/`;
  const m = (re, defecto) => (machetes.find((e) => re.test(e.id)) ? `${r}machetes/${machetes.find((e) => re.test(e.id)).id}/` : defecto);
  return [
    { id: 'top15', titulo: 'Top 15', desc: 'Las preguntas más probables, con respuesta modelo', href: `${r}top15/`, grande: true },
    { id: 'resumen', titulo: 'Resumen', desc: 'La unidad completa, ordenada', href: m(/resumen/, `${r}machetes/`) },
    { id: 'simulacro', titulo: 'Simulacro', desc: '5 preguntas al azar, 60 minutos', href: `${r}teoria/#simulacro`, grande: true },
    { id: 'choices', titulo: 'Choices', desc: 'Preguntas de opción múltiple con explicación', href: `${r}choices/` },
    { id: 'tarjetas', titulo: 'Tarjetas', desc: 'Repaso espaciado en 3 cajas', href: `${r}tarjetas/` },
    { id: 'machete', titulo: 'Machete', desc: 'Lo esencial en una hoja', href: m(/machete/, `${r}machetes/`) },
  ];
}
