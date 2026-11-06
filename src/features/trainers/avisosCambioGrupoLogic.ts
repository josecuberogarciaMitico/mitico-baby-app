// Avisos de cambios en grupos publicados (06/11): lógica pura (textos y orden).

export type AvisoCambioGrupo = {
  grupo_id: string | null;
  grupo_nombre: string | null;
  sesion_fecha: string;
  hora_inicio: string | null;
  modalidad: string | null;
  tipo: 'nino_entra' | 'nino_sale' | 'grupo_asignado' | 'grupo_retirado' | 'punto' | 'pista';
  alumno: string | null;
  valor: string | null;
  ultimo_at: string | null;
};

export type BloqueAvisos = { clave: string; titulo: string; lineas: string[]; retirado: boolean };

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function tituloBloque(a: Pick<AvisoCambioGrupo, 'sesion_fecha' | 'hora_inicio' | 'modalidad' | 'grupo_nombre'>) {
  const f = String(a.sesion_fecha || '').slice(0, 10);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(f) ? `${DIAS[new Date(`${f}T12:00:00Z`).getUTCDay()]} ${f.slice(8, 10)}/${f.slice(5, 7)}` : '';
  return [d, String(a.hora_inicio || '').slice(0, 5), a.modalidad, a.grupo_nombre || 'Grupo'].filter(Boolean).join(' · ');
}

export function textoAviso(a: AvisoCambioGrupo) {
  switch (a.tipo) {
    case 'nino_entra':
      return `Entra ${a.alumno || 'un niño'}`;
    case 'nino_sale':
      return `Sale ${a.alumno || 'un niño'}`;
    case 'grupo_asignado':
      return 'Ahora estás en este grupo: revísalo y confírmalo';
    case 'grupo_retirado':
      return 'Ya no estás en este grupo';
    case 'punto':
      return a.valor ? `Punto de encuentro: ${a.valor}` : 'Ya no tiene punto de encuentro';
    case 'pista':
      return a.valor ? `Pista: ${a.valor}` : 'Pista sin definir';
    default:
      return 'Ha cambiado';
  }
}

/** Un bloque por grupo (día, hora, grupo), en orden; dentro, primero el grupo, luego niños y datos. */
export function agruparAvisos(avisos: AvisoCambioGrupo[]): BloqueAvisos[] {
  const orden: Record<string, number> = { grupo_asignado: 0, grupo_retirado: 0, nino_entra: 1, nino_sale: 2, punto: 3, pista: 4 };
  const m = new Map<string, { a: AvisoCambioGrupo; filas: AvisoCambioGrupo[] }>();
  for (const a of avisos) {
    const clave = `${String(a.sesion_fecha).slice(0, 10)}|${String(a.hora_inicio || '').slice(0, 5)}|${a.grupo_id || a.grupo_nombre}`;
    const b = m.get(clave) || { a, filas: [] };
    b.filas.push(a);
    m.set(clave, b);
  }
  return [...m.entries()]
    .sort(([x], [y]) => x.localeCompare(y))
    .map(([clave, b]) => ({
      clave,
      titulo: tituloBloque(b.a),
      retirado: b.filas.some((f) => f.tipo === 'grupo_retirado'),
      lineas: [...b.filas]
        .sort((x, y) => (orden[x.tipo] ?? 9) - (orden[y.tipo] ?? 9) || String(x.alumno || '').localeCompare(String(y.alumno || ''), 'es'))
        .map(textoAviso),
    }));
}
