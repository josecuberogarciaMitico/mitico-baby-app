import {
  requireTechnicalLevel,
  type TechnicalLevel,
} from '../levels/levelContract';
import type { InputTrabajoDiario } from './dailyWorkTypes';

function present(values: Array<string | null | undefined>): string[] {
  return values.map((value) => String(value || '').trim()).filter(Boolean);
}

export function requireDailyWorkLevels(input: InputTrabajoDiario): TechnicalLevel[] {
  const studentLevels = present(input.alumnos.map((student) => student.nivel));
  const source = studentLevels.length > 0 ? studentLevels : present(input.niveles);
  if (source.length === 0) {
    requireTechnicalLevel('', `Trabajo diario de ${input.nombreGrupo || 'grupo sin nombre'}`);
  }
  return source.map((level) =>
    requireTechnicalLevel(level, `Trabajo diario de ${input.nombreGrupo || 'grupo sin nombre'}`)
  );
}
