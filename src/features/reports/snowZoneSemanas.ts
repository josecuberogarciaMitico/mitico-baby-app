// Informe SnowZone (13/11): semanas de entreno (lunes a domingo, como la
// «Semana de trabajo» de la app) para elegir semana y para los subtotales
// del informe mensual.

export type FilaSnowZone = { fecha: string; pista_pequena: number; pista_grande: number; total: number };

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function sumarDias(fecha: string, dias: number) {
  const d = new Date(`${fecha}T12:00:00`);
  d.setDate(d.getDate() + dias);
  return iso(d);
}

/** Lunes de la semana de entreno de esa fecha. */
export function lunesDe(fecha: string) {
  const d = new Date(`${fecha}T12:00:00`);
  const dia = d.getDay();
  d.setDate(d.getDate() + (dia === 0 ? -6 : 1 - dia));
  return iso(d);
}

const ddmm = (f: string) => `${f.slice(8, 10)}/${f.slice(5, 7)}`;

export type SemanaEntreno = { inicio: string; fin: string; etiqueta: string; enCurso: boolean; futura: boolean };

/**
 * Semanas de la temporada (desde el lunes de la semana del 1 de septiembre)
 * hasta la semana siguiente a hoy, la más reciente primero.
 */
export function semanasDeTemporada(hoy: string): SemanaEntreno[] {
  const anio = Number(hoy.slice(0, 4)) - (Number(hoy.slice(5, 7)) >= 9 ? 0 : 1);
  const primera = lunesDe(`${anio}-09-01`);
  const ultima = sumarDias(lunesDe(hoy), 7);
  const lista: SemanaEntreno[] = [];
  for (let l = primera; l <= ultima; l = sumarDias(l, 7)) {
    const fin = sumarDias(l, 6);
    const enCurso = l <= hoy && hoy <= fin;
    const futura = l > hoy;
    lista.push({
      inicio: l,
      fin,
      enCurso,
      futura,
      etiqueta: `Semana ${ddmm(l)} – ${ddmm(fin)}${enCurso ? ' (en curso)' : futura ? ' (próxima)' : ''}`,
    });
  }
  return lista.reverse();
}

export type GrupoSemana = {
  inicio: string;
  fin: string;
  filas: FilaSnowZone[];
  pista_pequena: number;
  pista_grande: number;
  total: number;
};

/** Agrupa las filas por semana de entreno, en orden de fecha. */
export function agruparPorSemana(filas: FilaSnowZone[]): GrupoSemana[] {
  const mapa = new Map<string, GrupoSemana>();
  for (const f of [...filas].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const inicio = lunesDe(f.fecha);
    const g = mapa.get(inicio) || { inicio, fin: sumarDias(inicio, 6), filas: [], pista_pequena: 0, pista_grande: 0, total: 0 };
    g.filas.push(f);
    g.pista_pequena += Number(f.pista_pequena || 0);
    g.pista_grande += Number(f.pista_grande || 0);
    g.total += Number(f.total || 0);
    mapa.set(inicio, g);
  }
  return [...mapa.values()];
}

export function etiquetaSemana(inicio: string, fin: string) {
  return `Semana ${ddmm(inicio)} – ${ddmm(fin)}`;
}
