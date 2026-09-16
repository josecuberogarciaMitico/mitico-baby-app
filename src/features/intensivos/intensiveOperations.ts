import type {
  DiaIntensivoFormState,
  GrupoEditableIntensivoDiaApp,
  GrupoIntensivoFormState,
  IntensivoDiaApp,
  IntensivoFormState,
  PlantillaCuatroSesionesIntensivoState,
} from './intensiveTypes';

export function intensivoInicial(): IntensivoFormState {
  return { temporada: '', nombre: '', lugar: 'Madrid SnowZone', estado: 'Abierto' };
}

export function diaIntensivoInicial(): DiaIntensivoFormState {
  return { fecha: '', hora_inicio: '18:00', hora_fin: '20:00' };
}

export function plantillaCuatroSesionesInicial(): PlantillaCuatroSesionesIntensivoState {
  return { fechaInicio: '', horaInicio: '18:00', horaFin: '20:00', tipo: 'cuatro_dias' };
}

export function grupoIntensivoInicial(): GrupoIntensivoFormState {
  return {
    nombre_grupo: 'Grupo Intensivo',
    nivel_grupo: '',
    pista: 'Pequeña/Grande',
    punto_encuentro: '5',
    trabajo_diario: '',
    observaciones_importantes: '',
    entrenador_id: '',
    entrenador_apoyo_id: '',
    alumnos_ids: [],
    publicado: true,
  };
}

function addDaysIso(dateIso: string, days: number): string {
  const match = String(dateIso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error('La fecha inicial del intensivo no es válida.');
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (date.toISOString().slice(0, 10) !== dateIso) {
    throw new Error('La fecha inicial del intensivo no es válida.');
  }
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calcularFechasCuatroSesionesIntensivo(
  fechaInicio: string,
  tipo: PlantillaCuatroSesionesIntensivoState['tipo']
): string[] {
  if (!fechaInicio) return [];
  const offsets = tipo === 'cuatro_dias'
    ? [0, 1, 2, 3]
    : tipo === 'dos_fines_semana'
      ? [0, 1, 7, 8]
      : [0, 7, 14, 21];
  return offsets.map((offset) => addDaysIso(fechaInicio, offset));
}

export function nombreTipoCuatroSesionesIntensivo(
  tipo: PlantillaCuatroSesionesIntensivoState['tipo']
): string {
  if (tipo === 'cuatro_dias') return '4 días seguidos';
  if (tipo === 'dos_fines_semana') return '2 fines de semana consecutivos';
  if (tipo === 'cuatro_sabados') return '4 sábados';
  return '4 domingos';
}

export function grupoEdadIntensivo(
  fechaNacimiento?: string | null,
  fechaReferencia = new Date()
): 'Sin edad' | 'Mayores' | 'Pequeños' {
  if (!fechaNacimiento) return 'Sin edad';
  const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
  if (Number.isNaN(nacimiento.getTime())) return 'Sin edad';
  let edad = fechaReferencia.getFullYear() - nacimiento.getFullYear();
  const diferenciaMes = fechaReferencia.getMonth() - nacimiento.getMonth();
  if (diferenciaMes < 0 || (diferenciaMes === 0 && fechaReferencia.getDate() < nacimiento.getDate())) edad -= 1;
  return edad >= 7 ? 'Mayores' : 'Pequeños';
}

function normalizeGroupName(value: string | null | undefined): string {
  return String(value || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export type IntensiveFutureMove = {
  dia: IntensivoDiaApp;
  grupo_origen_id: string;
  grupo_origen: string;
  grupo_destino_id: string;
  grupo_destino: string;
};

export function planIntensiveFutureMove(input: {
  studentId: string;
  studentName: string;
  targetGroupName: string;
  days: IntensivoDiaApp[];
  rowsByDay: ReadonlyMap<string, GrupoEditableIntensivoDiaApp[]>;
  maximumForGroup?: (row: GrupoEditableIntensivoDiaApp) => number;
}): IntensiveFutureMove[] {
  if (input.days.length === 0) throw new Error('No hay sesiones futuras donde aplicar el cambio.');
  const targetName = normalizeGroupName(input.targetGroupName);
  if (!targetName) throw new Error('No se ha indicado un grupo de destino.');
  const plan: IntensiveFutureMove[] = [];

  for (const day of input.days) {
    const rows = input.rowsByDay.get(day.intensivo_dia_id) || [];
    if (rows.length === 0) {
      throw new Error(`Día ${day.numero_dia}: todavía no tiene grupos creados. No aplico ningún cambio para evitar dejar el intensivo a medias.`);
    }
    const studentRow = rows.find((row) => row.alumno_id === input.studentId);
    if (!studentRow) {
      throw new Error(`Día ${day.numero_dia}: ${input.studentName} no aparece en ningún grupo. No aplico ningún cambio.`);
    }
    const targetRow = rows.find((row) => normalizeGroupName(row.nombre_grupo) === targetName);
    if (!targetRow) {
      throw new Error(`Día ${day.numero_dia}: no existe el grupo destino “${input.targetGroupName}”. No aplico ningún cambio.`);
    }
    if (studentRow.grupo_id === targetRow.grupo_id) continue;
    const finalSize = rows.filter((row) => row.grupo_id === targetRow.grupo_id).length + 1;
    const maximum = input.maximumForGroup?.(targetRow) ?? 7;
    if (finalSize > maximum) {
      throw new Error(`Día ${day.numero_dia}: ${targetRow.nombre_grupo} quedaría con ${finalSize} niños y supera el ratio máximo (${maximum}). No aplico ningún cambio.`);
    }
    plan.push({
      dia: day,
      grupo_origen_id: studentRow.grupo_id,
      grupo_origen: studentRow.nombre_grupo,
      grupo_destino_id: targetRow.grupo_id,
      grupo_destino: targetRow.nombre_grupo,
    });
  }

  if (plan.length === 0) {
    throw new Error(`${input.studentName} ya está en ${input.targetGroupName} desde el día seleccionado en adelante.`);
  }
  return plan;
}
