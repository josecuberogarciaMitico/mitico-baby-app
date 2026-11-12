import React, { useEffect, useState } from 'react';
import { conEdades, parsearAlumnosLista, type NinoGrupoPropuesto } from './gruposPropuestosNinos';

// Analizar encaje (03/11): lista de niños de un grupo propuesto, para decidir
// mejor dónde meter al alta tardía. Solo lectura.

type Props = {
  grupoId: string;
  fecha: string;
  nuevoNombre?: string;
  nuevoNivel?: string;
  fichas: { alumno: string; fecha_nacimiento: string | null }[];
  consultarSupabase?: (tabla: string, query: string) => Promise<any[]>;
  /** Si ya se tiene «alumnos_lista» del grupo, se usa tal cual (sin consultar). */
  textoLista?: string | null;
  /** 12/11: nº de niños actual; si cambia (se ha colocado a alguien), se vuelve a leer. */
  version?: number | string;
};

// Caché mientras la pantalla está abierta: varias tarjetas pueden ser el mismo grupo.
const cache = new Map<string, Promise<string>>();

function cargarLista(grupoId: string, consultar: NonNullable<Props['consultarSupabase']>, version: string) {
  const clave = `${grupoId}|${version}`;
  let p = cache.get(clave);
  if (!p) {
    p = consultar('v_grupos_sesion_operativa_app', `select=alumnos_lista&grupo_id=eq.${grupoId}`).then(
      (rows) => String(rows?.[0]?.alumnos_lista || '')
    );
    p.catch(() => cache.delete(clave));
    cache.set(clave, p);
    // Que una segunda búsqueda minutos después vea los cambios.
    setTimeout(() => cache.delete(clave), 60_000);
  }
  return p;
}

const chip: React.CSSProperties = {
  display: 'inline-block',
  minWidth: 26,
  padding: '1px 6px',
  borderRadius: 999,
  background: '#e2e8f0',
  color: '#0f172a',
  fontSize: 11,
  fontWeight: 700,
  textAlign: 'center',
};

export function NinosGrupoPropuesto({ grupoId, fecha, nuevoNombre, nuevoNivel, fichas, consultarSupabase, textoLista, version }: Props) {
  const [lista, setLista] = useState<NinoGrupoPropuesto[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let vivo = true;
    setError(false);
    if (textoLista !== undefined || !consultarSupabase) {
      setLista(conEdades(parsearAlumnosLista(textoLista), fichas, fecha));
      return;
    }
    setLista(null);
    cargarLista(grupoId, consultarSupabase, String(version ?? ''))
      .then((texto) => vivo && setLista(conEdades(parsearAlumnosLista(texto), fichas, fecha)))
      .catch(() => vivo && setError(true));
    return () => {
      vivo = false;
    };
    // fichas se usa solo para la edad; no hace falta recargar si cambia.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grupoId, fecha, textoLista, version]);

  const fila = (n: NinoGrupoPropuesto, nuevo = false) => (
    <li
      key={`${nuevo ? 'nuevo-' : ''}${n.nombre}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '3px 0',
        borderTop: '1px solid #e2e8f0',
        minWidth: 0,
        ...(nuevo ? { color: '#166534', fontWeight: 700 } : {}),
      }}
    >
      <span style={{ ...chip, ...(nuevo ? { background: '#bbf7d0' } : {}) }}>{n.nivel || '—'}</span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {n.nombre}
        {nuevo ? ' (nuevo)' : ''}
      </span>
      {n.edad !== null && <span style={{ color: '#64748b', fontSize: 12, whiteSpace: 'nowrap' }}>{n.edad} años</span>}
    </li>
  );

  const nuevo = nuevoNombre?.trim()
    ? conEdades([{ nombre: nuevoNombre.trim(), nivel: nuevoNivel || '' }], fichas, fecha)[0]
    : null;

  return (
    <div style={{ marginTop: 8, fontSize: 13 }}>
      {error ? (
        <p style={{ margin: 0, color: '#b91c1c' }}>No se pudo cargar la lista de niños.</p>
      ) : !lista ? (
        <p style={{ margin: 0, color: '#64748b' }}>Cargando niños…</p>
      ) : (
        <>
          <strong style={{ fontSize: 12, color: '#475569' }}>
            {lista.length ? `Niños en el grupo (${lista.length})` : 'Grupo sin niños todavía'}
          </strong>
          <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0 }}>
            {lista.map((n) => fila(n))}
            {nuevo && fila(nuevo, true)}
          </ul>
        </>
      )}
    </div>
  );
}
