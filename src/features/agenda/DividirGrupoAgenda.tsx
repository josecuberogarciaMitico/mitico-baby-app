import React from 'react';
import { sugerenciaDividir, type NinoDividir } from './dividirGrupoLogic';

// 18/11/2026 · «Dividir en dos grupos» en un grupo ya creado (Jose: «crear un grupo
// nuevo para dividir uno ya creado no se puede y no es intuitivo»). Marca qué niños
// pasan al grupo nuevo (viene sugerido por nivel y edad) y se crea en borrador.

type Nino = NinoDividir & { alumno: string };

export function DividirGrupoAgenda({
  ninos,
  cargando,
  onDividir,
}: {
  ninos: Nino[];
  cargando: boolean;
  onDividir: (alumnosIds: string[]) => Promise<boolean>;
  key?: string;
}) {
  const [abierto, setAbierto] = React.useState(false);
  const [elegidos, setElegidos] = React.useState<string[]>([]);
  const [enviando, setEnviando] = React.useState(false);

  if (ninos.length < 2) return null;

  const abrir = () => {
    setElegidos(sugerenciaDividir(ninos));
    setAbierto(true);
  };
  const alternar = (id: string) => setElegidos((e) => (e.includes(id) ? e.filter((x) => x !== id) : [...e, id]));
  const quedan = ninos.length - elegidos.length;
  const valido = elegidos.length > 0 && quedan > 0;

  if (!abierto)
    return (
      <button
        type="button"
        disabled={cargando}
        onClick={abrir}
        style={{ minHeight: 42, padding: '0 14px', borderRadius: 12, border: '1px solid #93c5fd', background: '#eff6ff', color: '#1d4ed8', fontWeight: 800, cursor: 'pointer' }}
      >
        ✂️ Dividir en dos grupos
      </button>
    );

  return (
    <div style={{ display: 'grid', gap: 8, padding: 12, borderRadius: 14, border: '1px solid #93c5fd', background: '#f8fbff' }}>
      <strong style={{ fontSize: 15 }}>✂️ Dividir en dos grupos</strong>
      <span style={{ fontSize: 13, color: '#475569' }}>
        Marca los niños que pasan al <b>grupo nuevo</b>. Viene marcada una sugerencia por nivel y edad; cámbiala si quieres.
      </span>
      <div style={{ display: 'grid', gap: 4 }}>
        {ninos.map((n) => (
          <label
            key={n.alumno_id}
            style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 8px', borderRadius: 10, background: elegidos.includes(n.alumno_id) ? '#dbeafe' : '#fff', border: '1px solid #e2e8f0', cursor: 'pointer' }}
          >
            <input type="checkbox" checked={elegidos.includes(n.alumno_id)} onChange={() => alternar(n.alumno_id)} style={{ width: 18, height: 18 }} />
            <span style={{ flex: 1, minWidth: 0, overflowWrap: 'anywhere', fontWeight: 700 }}>{n.alumno}</span>
            <span style={{ fontSize: 12.5, color: '#475569', whiteSpace: 'nowrap' }}>
              {n.nivel || '—'}
              {n.edad !== null ? ` · ${n.edad} años` : ''}
            </span>
          </label>
        ))}
      </div>
      <span style={{ fontSize: 13, fontWeight: 800, color: valido ? '#1e3a8a' : '#b45309' }}>
        {valido
          ? `Grupo nuevo: ${elegidos.length} ${elegidos.length === 1 ? 'niño' : 'niños'} · se quedan aquí: ${quedan}`
          : elegidos.length === 0
            ? 'Marca al menos un niño.'
            : 'Deja al menos un niño en este grupo.'}
      </span>
      <span style={{ fontSize: 12, color: '#64748b' }}>
        El grupo nuevo se crea sin publicar y sin entrenador; después le pones entrenador y punto como a cualquier grupo.
      </span>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={!valido || enviando || cargando}
          onClick={async () => {
            setEnviando(true);
            const ok = await onDividir(elegidos);
            setEnviando(false);
            if (ok) setAbierto(false);
          }}
          style={{ minHeight: 44, padding: '0 16px', borderRadius: 12, border: 'none', background: valido ? '#1d4ed8' : '#94a3b8', color: '#fff', fontWeight: 900, cursor: valido ? 'pointer' : 'default' }}
        >
          {enviando ? 'Creando…' : `Crear grupo nuevo con ${elegidos.length}`}
        </button>
        <button
          type="button"
          disabled={enviando}
          onClick={() => setAbierto(false)}
          style={{ minHeight: 44, padding: '0 14px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 800, cursor: 'pointer' }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
