// Trabajo en pista (06/11): semana y días de entreno (miércoles a domingo).

export function sumarDiasIso(iso: string, n: number) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function lunesDe(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return sumarDiasIso(iso, -((d.getUTCDay() + 6) % 7));
}

const NOMBRES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/** Miércoles a domingo de la semana de esa fecha. */
export function diasEntrenoSemana(iso: string) {
  const lunes = lunesDe(iso);
  return [2, 3, 4, 5, 6].map((n) => {
    const fecha = sumarDiasIso(lunes, n);
    const d = new Date(`${fecha}T12:00:00Z`);
    return { fecha, nombre: NOMBRES[d.getUTCDay()], dia: String(d.getUTCDate()) };
  });
}

export function etiquetaSemana(iso: string) {
  const lunes = lunesDe(iso);
  const domingo = sumarDiasIso(lunes, 6);
  const f = (x: string) => `${x.slice(8, 10)}/${x.slice(5, 7)}`;
  return `${f(lunes)} – ${f(domingo)}`;
}

/** Al cambiar de semana: el primer día con sesiones; si no hay, el miércoles. */
export function diaAlCambiarSemana(iso: string, cuenta: Record<string, number>) {
  const dias = diasEntrenoSemana(iso);
  return (dias.find((d) => (cuenta[d.fecha] || 0) > 0) || dias[0]).fecha;
}
