import React, { useEffect, useMemo, useState } from 'react';
import type { OcioAlumnoApp, OcioGrupoApp, OcioPrepararResultadoApp } from './ocioTypes';
import { applyOcioRelocationsToStableGroup } from './ocioRelocation';
import {
  addEmptyOcioWeeklyGroup,
  buildOcioWeeklyGroups,
  moveOcioWeeklyStudent,
  validateOcioWeeklyGroups,
  weeklyLevelRange,
  type OcioWeeklyGroup,
} from './ocioWeekPlanning';

type Props = {
  ctx: Record<string, any>;
};

export function OcioWeekPreparationPanel({ ctx }: Props) {
  const {
    agendaBloqueBlanco,
    agendaCabeceraLinea,
    agendaVacioMini,
    alumnoVieneOcioSemana,
    abrirGrupoOcioEnTrabajoSemanal,
    botonPrincipal,
    botonSecundario,
    cambiosOcioSemana = [],
    deshacerPreparacionOcio,
    fechaGrupoOcioSemana,
    formatearFecha,
    horaCorta,
    ocioAimHarderSemana,
    ocioAlumnos,
    ocioGrupos,
    ocioSemanaResultados,
    ocioTurnoVista,
    prepararDiaOcioSemana,
    resultadoPerteneceDiaOcio,
    semanaAgendaActiva,
    semanaActualAgenda,
    tarjeta,
  } = ctx;

  const stableGroups = useMemo(
    () =>
      (ocioGrupos as OcioGrupoApp[])
        .filter(
          (group) =>
            group.activo &&
            String(group.dia_semana || '').localeCompare(ocioTurnoVista, undefined, {
              sensitivity: 'base',
            }) === 0
        )
        .map((group) => ({
          groupId: group.grupo_id,
          name: group.nombre_grupo,
          date: fechaGrupoOcioSemana(group),
          start: horaCorta(group.hora_inicio),
          end: horaCorta(group.hora_fin),
          piste: group.pista,
          // La composición de esta semana parte de los grupos estables, pero
          // aplica antes las entradas/salidas de los cambios puntuales. No se
          // modifica el grupo estable del alumno.
          students: applyOcioRelocationsToStableGroup(
            group.grupo_id,
            ocioAlumnos as OcioAlumnoApp[],
            cambiosOcioSemana
          ) as OcioAlumnoApp[],
        })),
    [
      ocioGrupos,
      ocioAlumnos,
      cambiosOcioSemana,
      ocioTurnoVista,
      semanaAgendaActiva,
      semanaActualAgenda,
    ]
  );

  const attendanceKey = stableGroups
    .flatMap((group) => group.students)
    .map((student) => `${student.alumno_id}:${alumnoVieneOcioSemana(student.alumno_id) ? 1 : 0}`)
    .sort()
    .join('|');

  const initialGroups = useMemo(
    () => buildOcioWeeklyGroups(stableGroups, alumnoVieneOcioSemana),
    [stableGroups, attendanceKey]
  );
  const [weeklyGroups, setWeeklyGroups] = useState<OcioWeeklyGroup[]>(initialGroups);

  useEffect(() => {
    setWeeklyGroups(initialGroups);
  }, [initialGroups]);

  const weekStart = semanaAgendaActiva || semanaActualAgenda || '';
  const rosterReady = ocioAimHarderSemana?.semanaInicio === weekStart;
  const exactRosterSlot = stableGroups.every((group) =>
    ocioAimHarderSemana?.turnos?.some(
      (turn: any) =>
        turn.fecha === group.date &&
        horaCorta(turn.horaInicio) === group.start &&
        horaCorta(turn.horaFin) === group.end
    )
  );
  const sourceLabel =
    ocioAimHarderSemana?.origen === 'MANUAL' ? 'listado pegado' : 'AimHarder';
  const studentsById = new Map(
    (ocioAlumnos as OcioAlumnoApp[]).map((student) => [student.alumno_id, student])
  );
  const comingCount = new Set(weeklyGroups.flatMap((group) => group.studentIds)).size;
  const prepared = (ocioSemanaResultados as OcioPrepararResultadoApp[]).filter(
    (result) => resultadoPerteneceDiaOcio(result, ocioTurnoVista)
  );

  function addTemporaryGroup() {
    const template = weeklyGroups[0] || initialGroups[0];
    if (!template) return;
    setWeeklyGroups((current) =>
      addEmptyOcioWeeklyGroup(current, {
        name: `Grupo temporal ${current.length + 1}`,
        date: template.date,
        start: template.start,
        end: template.end,
        piste: template.piste,
      })
    );
  }

  function submit() {
    try {
      validateOcioWeeklyGroups(weeklyGroups);
      void prepararDiaOcioSemana(
        ocioTurnoVista,
        weeklyGroups.filter((group) => group.studentIds.length > 0)
      );
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'La composición semanal no es válida.');
    }
  }

  if (!rosterReady || !exactRosterSlot) {
    return (
      <article style={agendaBloqueBlanco}>
        <strong>Primero consulta AimHarder o pega el listado de este día y horario.</strong>
        <p style={{ margin: '6px 0 0', color: '#64748b' }}>
          Preparar semana solo cargará los alumnos reales de la semana seleccionada.
        </p>
      </article>
    );
  }

  return (
    <>
      <article style={agendaBloqueBlanco}>
        <div style={agendaCabeceraLinea}>
          <div>
            <strong style={{ fontSize: 17 }}>Composición temporal · {ocioTurnoVista}</strong>
            <p style={{ margin: '5px 0 0', color: '#64748b' }}>
              {comingCount} alumnos de {sourceLabel}. Moverlos aquí no cambia sus grupos estables.
            </p>
          </div>
          <button type="button" onClick={addTemporaryGroup} style={botonSecundario}>
            + Grupo temporal
          </button>
        </div>
      </article>

      <div style={{ display: 'grid', gap: 12 }}>
        {weeklyGroups.map((group) => (
          <article key={group.weeklyGroupId} style={tarjeta}>
            <div style={agendaCabeceraLinea}>
              <div>
                <input
                  value={group.name}
                  onChange={(event) =>
                    setWeeklyGroups((current) =>
                      current.map((item) =>
                        item.weeklyGroupId === group.weeklyGroupId
                          ? { ...item, name: event.target.value }
                          : item
                      )
                    )
                  }
                  aria-label="Nombre del grupo temporal"
                  style={{ fontSize: 16, fontWeight: 800 }}
                />
                <div style={{ marginTop: 5, color: '#64748b' }}>
                  {formatearFecha(group.date)} · {group.start}–{group.end} · Nivel{' '}
                  {weeklyLevelRange(group, ocioAlumnos)}
                </div>
              </div>
              <strong>{group.studentIds.length} alumnos</strong>
            </div>

            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {group.studentIds.length === 0 ? (
                <div style={agendaVacioMini}>Grupo temporal vacío.</div>
              ) : (
                group.studentIds.map((studentId) => {
                  const student = studentsById.get(studentId);
                  if (!student) return null;
                  return (
                    <div
                      key={`${group.weeklyGroupId}-${studentId}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) minmax(170px, 230px)',
                        gap: 10,
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <div>
                        <strong>{student.alumno}</strong>
                        <div style={{ color: '#64748b', fontSize: 13 }}>
                          Nivel {student.nivel_usado || student.nivel || '-'}
                        </div>
                      </div>
                      <select
                        value={group.weeklyGroupId}
                        aria-label={`Mover temporalmente a ${student.alumno}`}
                        onChange={(event) =>
                          setWeeklyGroups((current) =>
                            moveOcioWeeklyStudent(current, studentId, event.target.value)
                          )
                        }
                      >
                        {weeklyGroups.map((target) => (
                          <option key={target.weeklyGroupId} value={target.weeklyGroupId}>
                            {target.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })
              )}
            </div>
          </article>
        ))}
      </div>

      <article style={agendaBloqueBlanco}>
        <div style={agendaCabeceraLinea}>
          <div>
            <strong>Composición final: {comingCount} alumnos</strong>
            <p style={{ margin: '5px 0 0', color: '#64748b' }}>
              Se enviará al núcleo común de Días de entrenamiento.
            </p>
          </div>
          <button type="button" onClick={submit} style={botonPrincipal}>
            VOLCAR A DÍAS DE ENTRENAMIENTO
          </button>
        </div>
      </article>

      {prepared.length > 0 && (
        <article id="ocio-grupos-preparados-semana" style={agendaBloqueBlanco}>
          <strong>Volcado realizado · {prepared.length} grupos</strong>
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {prepared.map((result, index) => (
              <div key={`${result.grupo_id || result.grupo_estable}-${index}`} style={tarjeta}>
                <div style={agendaCabeceraLinea}>
                  <div>
                    <strong>{result.grupo_estable}</strong>
                    <div style={{ marginTop: 4, color: '#64748b' }}>
                      {formatearFecha(result.fecha)} · {result.hora_inicio}–{result.hora_fin} ·{' '}
                      {result.alumnos} alumnos
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => abrirGrupoOcioEnTrabajoSemanal(result)}
                      style={botonPrincipal}
                    >
                      Abrir en Días de entrenamiento
                    </button>
                    <button
                      type="button"
                      onClick={() => void deshacerPreparacionOcio(result)}
                      style={botonSecundario}
                    >
                      Deshacer volcado
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      )}
    </>
  );
}
