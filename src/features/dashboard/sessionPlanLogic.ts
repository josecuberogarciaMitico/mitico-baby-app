// Resumen de sesión (01/11): lógica pura para la tabla «grupos y objetivos».
//
// El trabajo diario de cada grupo es un texto con apartados:
//   OBJETIVO · …
//   ESTADO · PROGRESAR · …
//   TRABAJO
//   • Ejercicio — explicación
//     B · detalle por nivel
// De ahí se saca lo que cabe en una fila de la tabla.

export type TrabajoResumido = {
  objetivo: string;
  estado: string; // PROGRESAR, RETAR, CONSOLIDAR…
  estadoDetalle: string;
  ejercicios: string[];
};

export type GrupoPlan = {
  sesion_id: string;
  grupo_id: string;
  nombre_grupo: string | null;
  nivel_grupo: string | null;
  entrenador: string | null;
  entrenador_apoyo: string | null;
  pista: string | null;
  punto_encuentro: string | null;
  total_alumnos: number | null;
  publicado: boolean | null;
  trabajo_diario: string | null;
};

export type FilaPlan = GrupoPlan & { modalidad: string; trabajo: TrabajoResumido };

function apartado(texto: string, nombre: string) {
  const m = texto.match(new RegExp(`(?:^|\\n)\\s*${nombre}\\s*·\\s*([\\s\\S]*?)(?=\\n\\s*\\n|$)`, 'i'));
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

export function resumirTrabajoDiario(texto: string | null | undefined): TrabajoResumido {
  const t = String(texto || '').replace(/\r/g, '');
  const estadoCompleto = apartado(t, 'ESTADO');
  const [estado, ...resto] = estadoCompleto.split(/\s*·\s*/);
  const bloqueTrabajo = t.match(/(?:^|\n)\s*TRABAJO\s*\n([\s\S]*?)(?=\n\s*\n[A-ZÁÉÍÓÚÑ ]{4,}(?:\s*·|\n)|$)/);
  const ejercicios = (bloqueTrabajo ? bloqueTrabajo[1] : '')
    .split('\n')
    .filter((l) => /^\s*[•\-*]\s+/.test(l))
    .map((l) => l.replace(/^\s*[•\-*]\s+/, '').split(/\s+—\s+/)[0].trim())
    .filter(Boolean);
  return {
    objetivo: apartado(t, 'OBJETIVO'),
    estado: (estado || '').toUpperCase(),
    estadoDetalle: resto.join(' · '),
    ejercicios,
  };
}

export function filasPlanSesion(
  sesiones: { sesion_id: string; modalidad: string | null }[],
  grupos: GrupoPlan[]
): FilaPlan[] {
  const modalidad = new Map(sesiones.map((s) => [s.sesion_id, String(s.modalidad || '')]));
  return grupos
    .filter((g) => modalidad.has(g.sesion_id))
    .map((g) => ({ ...g, modalidad: modalidad.get(g.sesion_id) || '', trabajo: resumirTrabajoDiario(g.trabajo_diario) }))
    .sort(
      (a, b) =>
        a.modalidad.localeCompare(b.modalidad, 'es') ||
        String(a.nombre_grupo || '').localeCompare(String(b.nombre_grupo || ''), 'es', { numeric: true })
    );
}

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** «2026-10-31», «09:45:00» → «Sábado 31/10 · 09:45». */
export function tituloSesion(fecha: string, hora: string) {
  const d = new Date(`${fecha.slice(0, 10)}T12:00:00Z`);
  const dia = DIAS[d.getUTCDay()] || '';
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${fecha.slice(8, 10)}/${fecha.slice(5, 7)} · ${hora.slice(0, 5)}`;
}

/** Aviso de Paco «resumen-sesion:2026-10-31T09:45» → { fecha, hora }. */
export function sesionDeClaveAviso(clave: string | null | undefined) {
  const m = String(clave || '').match(/^resumen-sesion:(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
  return m ? { fecha: m[1], hora: m[2] } : null;
}
