import React, { useState } from 'react';

/**
 * Trabajo en pista · Ajustes de hoy · Entrenadores.
 *
 * Permite cambiar el entrenador principal y el segundo entrenador de los
 * grupos publicados del turno SIN salir de Trabajo en pista. No tiene lógica
 * propia de datos: reutiliza exactamente las mismas funciones que Entrenamientos
 * (cambiarEntrenadorGrupoAgenda / cambiarSegundoEntrenadorGrupoAgenda), con sus
 * confirmaciones, validaciones de Supabase y avisos Push. Después refresca el
 * turno para que listado, Vista entrenador y reportes queden actualizados.
 */

type TrainerOption = {
  entrenador_id: string;
  nombre_completo: string;
  activo?: boolean | null;
};

type TrackTrainerGroup = {
  grupo_id: string;
  nombre_grupo: string;
  publicado?: boolean;
  entrenador_id?: string | null;
  entrenador?: string | null;
  entrenador_apoyo_id?: string | null;
  entrenador_apoyo?: string | null;
  total_alumnos?: number | null;
};

type TrackTrainerAdjustPanelProps = {
  grupos: TrackTrainerGroup[];
  entrenadores: TrainerOption[];
  nombreGrupoVisual: (grupo: TrackTrainerGroup, indice: number) => string;
  onCambiarPrincipal: (
    grupo: TrackTrainerGroup,
    entrenadorId: string,
    excepcional: boolean
  ) => Promise<void>;
  onCambiarApoyo: (grupo: TrackTrainerGroup, entrenadorId: string) => Promise<void>;
  labelCampo: React.CSSProperties;
  inputCampo: React.CSSProperties;
};

export function TrackTrainerAdjustPanel({
  grupos,
  entrenadores,
  nombreGrupoVisual,
  onCambiarPrincipal,
  onCambiarApoyo,
  labelCampo,
  inputCampo,
}: TrackTrainerAdjustPanelProps) {
  const [excepcional, setExcepcional] = useState<Record<string, boolean>>({});
  const [guardandoGrupoId, setGuardandoGrupoId] = useState('');

  const activos = entrenadores
    .filter((entrenador) => entrenador.activo !== false)
    .slice()
    .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'));

  const gruposOperativos = grupos.filter((grupo) => grupo.grupo_id);

  if (gruposOperativos.length === 0) {
    return (
      <div style={{ fontSize: 12, color: '#475569' }}>
        No hay grupos publicados en este turno.
      </div>
    );
  }

  async function aplicar(grupoId: string, accion: () => Promise<void>) {
    setGuardandoGrupoId(grupoId);
    try {
      await accion();
    } finally {
      setGuardandoGrupoId('');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <p style={{ margin: 0, fontSize: 12, color: '#475569', lineHeight: 1.4 }}>
        Al elegir un entrenador se pide confirmación y el cambio se guarda al momento: se actualiza
        la Vista entrenador y se avisa por Push. Un entrenador no puede estar en dos grupos del mismo
        turno: para intercambiarlos, quítalo primero de su grupo actual. El principal no se puede
        cambiar si el grupo ya tiene asistencia marcada o reportes; el segundo entrenador sí.
      </p>
      {gruposOperativos.map((grupo, indice) => {
        const guardando = guardandoGrupoId === grupo.grupo_id;
        const principalActual = grupo.entrenador_id || '';
        const apoyoActual = grupo.entrenador_apoyo_id || '';

        return (
          <div
            key={grupo.grupo_id}
            style={{
              display: 'grid',
              gap: 8,
              padding: 10,
              borderRadius: 12,
              border: '1px solid #cbd5e1',
              background: '#fff',
              opacity: guardando ? 0.6 : 1,
            }}
          >
            <strong style={{ fontSize: 13, color: '#0f172a' }}>
              {nombreGrupoVisual(grupo, indice)}
              <span style={{ fontWeight: 600, color: '#64748b' }}>
                {' '}· {Number(grupo.total_alumnos || 0)} alumno(s)
              </span>
            </strong>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
                gap: 8,
                alignItems: 'end',
              }}
            >
              <label style={labelCampo}>
                Entrenador principal
                <select
                  value={principalActual}
                  disabled={guardando}
                  onChange={(e) => {
                    const nuevo = e.target.value;
                    if (!nuevo || nuevo === principalActual) return;
                    void aplicar(grupo.grupo_id, () =>
                      onCambiarPrincipal(grupo, nuevo, Boolean(excepcional[grupo.grupo_id]))
                    );
                  }}
                  style={inputCampo}
                >
                  {!principalActual && <option value="">Sin entrenador…</option>}
                  {activos.map((entrenador) => (
                    <option key={entrenador.entrenador_id} value={entrenador.entrenador_id}>
                      {entrenador.nombre_completo}
                    </option>
                  ))}
                </select>
              </label>
              <label style={labelCampo}>
                Segundo entrenador
                <select
                  value={apoyoActual}
                  disabled={guardando}
                  onChange={(e) => {
                    const nuevo = e.target.value;
                    if (nuevo === apoyoActual) return;
                    void aplicar(grupo.grupo_id, () => onCambiarApoyo(grupo, nuevo));
                  }}
                  style={inputCampo}
                >
                  <option value="">Ninguno</option>
                  {activos
                    .filter((entrenador) => entrenador.entrenador_id !== principalActual)
                    .map((entrenador) => (
                      <option key={entrenador.entrenador_id} value={entrenador.entrenador_id}>
                        {entrenador.nombre_completo}
                      </option>
                    ))}
                </select>
              </label>
            </div>
            <label
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'center',
                fontSize: 12,
                color: '#475569',
              }}
            >
              <input
                type="checkbox"
                checked={Boolean(excepcional[grupo.grupo_id])}
                disabled={guardando}
                onChange={(e) =>
                  setExcepcional((actual) => ({ ...actual, [grupo.grupo_id]: e.target.checked }))
                }
              />
              Principal excepcional (no figura como disponible en este turno)
            </label>
          </div>
        );
      })}
    </div>
  );
}
